import store from "../redux/store";
import {
  ActivityData,
  ActivityOutcomeData,
  ActivityOutcomeType,
  ActivityParticipant,
  CharacterData,
} from "../serverAPI";
import {
  canCharacterFindTraps,
  canCharacterSneak,
  canCharacterTurnUndead,
  doesCharacterHaveMagicWeapons,
  doesCharacterHaveSilverWeapons,
  getCampaignXPDeductibleCapForLevel,
  getCharacterXPMultiplier,
  isCharacterArcane,
  isCharacterDivine,
} from "./characterUtils";
import { Dictionary } from "./dictionary";
import dateFormat from "dateformat";

export enum RewardDistro {
  // Even distribution to all participants.  Henchman hierarchy is ignored, and only local participants get a share.
  Equal = "equal",
  // For xp, if your henchmaster is in the group, you get 1 share.  If you not, you get 2 shares.
  // For gold, participants start from equal shares, then give half of their loot to their henchmaster, recursively.
  Hench = "hench",
}

export interface ArmyParticipant {
  armyId: number;
  troopId: number;
  troopDefId: number;
  troopCount: number;
  pendingInjuryCount: number;
  pendingDeathCount: number;
}

export interface AdventurerParticipant {
  characterId: number;
  pendingInjuryIds: string[];
  isPendingDeath: boolean;
}

export function generateActivityOutcomes(
  activity: ActivityData,
  currentDate: string,
  adventurerParticipants: AdventurerParticipant[],
  armyParticipants: ArmyParticipant[],
  totalMXP: number,
  gpWithXp: number,
  gpWithoutXp: number,
  xpDistro: RewardDistro,
  gpDistro: RewardDistro
): ActivityOutcomeData[] {
  const redux = store.getState();
  const allCharacters = redux.characters.characters;

  const activityId = activity.id ?? 0;

  const outcomes: ActivityOutcomeData[] = [];

  // Adventurer Deaths.
  const deadCharacterIds: number[] = adventurerParticipants
    .filter((ap) => {
      return ap.isPendingDeath;
    })
    .map((ap) => {
      return ap.characterId;
    });
  // Create "death" outcomes for the dead.
  deadCharacterIds.forEach((did) => {
    const o: ActivityOutcomeData = {
      id: 0, // Will be overwritten by the server.
      activity_id: activityId,
      target_id: did,
      type: ActivityOutcomeType.Death,
      quantity: 0,
      extra: "",
    };
    outcomes.push(o);
  });

  // Only surviving participants get stuff.
  const survivingAdventurerParticipants = adventurerParticipants.filter((p) => {
    return !deadCharacterIds.includes(p.characterId);
  });

  // Gold and XP distribution.
  // TODO: Implement Contracts to replace RewardDistro.
  interface RecipientData {
    characterId: number;
    gold: number;
    campaignGold: number; // Henchmaster's share from their henchmen.
    campaignDeductiblePayment: number;
    xpShares: number;
    xpMultiplier: number;
    xp: number;
  }
  const recipients: Dictionary<RecipientData> = {};
  survivingAdventurerParticipants.forEach((p) => {
    const participant = allCharacters[p.characterId];
    recipients[p.characterId] = {
      characterId: p.characterId,
      gold: 0,
      campaignGold: 0,
      campaignDeductiblePayment: 0,
      xpShares: 0,
      xpMultiplier: getCharacterXPMultiplier(participant),
      xp: 0,
    };
  });
  function distributeGoldThroughHenchChain(remainingGold: number, henchmasterId: number): void {
    const henchmaster = allCharacters[henchmasterId];

    // Make sure a recipient entry exists.
    if (!recipients[henchmasterId]) {
      recipients[henchmasterId] = {
        characterId: henchmasterId,
        gold: 0,
        campaignGold: 0,
        campaignDeductiblePayment: 0,
        xpShares: 0,
        xpMultiplier: getCharacterXPMultiplier(henchmaster),
        xp: 0,
      };
    }

    const shouldGiveGoldToHenchmaster =
      gpDistro === RewardDistro.Hench && // Hench mode?
      henchmaster.henchmaster_id > 0 && // Has a henchmaster?
      !deadCharacterIds.includes(henchmaster.henchmaster_id); // Henchmaster is still alive?

    if (shouldGiveGoldToHenchmaster) {
      recipients[henchmasterId].campaignGold += remainingGold / 2;
      // Everybody passes half of their share up the chain as campaign gold.
      distributeGoldThroughHenchChain(remainingGold / 2, henchmaster.henchmaster_id);
    } else {
      recipients[henchmasterId].campaignGold += remainingGold;
    }
  }
  // All surviving participants are included as recipients.
  let nonXPGoldPerShare = gpWithoutXp / survivingAdventurerParticipants.length;
  let xpGoldPerShare = gpWithXp / survivingAdventurerParticipants.length;
  let totalXPShares: number = 0;
  survivingAdventurerParticipants.forEach((p) => {
    const participant = allCharacters[p.characterId];
    const xpMultiplier = getCharacterXPMultiplier(participant);
    let xpShares: number = 2;
    // If your henchmaster is in the group, you get half a share.
    if (
      xpDistro === RewardDistro.Hench &&
      !!survivingAdventurerParticipants.find((p2) => {
        return p2.characterId === participant.henchmaster_id;
      })
    ) {
      xpShares = 1;
    }
    totalXPShares += xpShares;

    let gold = nonXPGoldPerShare + xpGoldPerShare;
    let gxp = xpGoldPerShare * xpMultiplier;

    const shouldGiveGoldToHenchmaster =
      gpDistro === RewardDistro.Hench && // Hench mode?
      participant.henchmaster_id > 0 && // Has a henchmaster?
      !deadCharacterIds.includes(participant.henchmaster_id); // Henchmaster is still alive?
    if (shouldGiveGoldToHenchmaster) {
      gold /= 2;
      gxp /= 2;
      distributeGoldThroughHenchChain(gold, participant.henchmaster_id);
    }

    // A few pre-calculated values.
    recipients[p.characterId].xpShares = xpShares;
    recipients[p.characterId].xpMultiplier = xpMultiplier;
    // Add the calculated earnings.
    recipients[p.characterId].gold += gold;
    recipients[p.characterId].xp = Math.ceil(recipients[p.characterId].xp + gxp);
  });

  // Distribute MXP.
  const mxpPerShare = totalMXP / totalXPShares;
  Object.values(recipients).forEach((r) => {
    const mxp = Math.ceil(mxpPerShare * r.xpShares * r.xpMultiplier);
    r.xp = Math.ceil(r.xp + mxp);
  });

  // In theory, we have now distributed XP and GP into recipient structs.  Next we should look at campaignGold
  // and apply it against the monthly deductible so we can know how much of it counts to grant xp.
  Object.values(recipients).forEach((r) => {
    if (r.campaignGold > 0) {
      const recipient = allCharacters[r.characterId];

      // See how much is left on the monthly CXP deductible.  Reset it if needed.
      let remainingDeductible = recipient.remaining_cxp_deductible;
      if (
        // Never had a deductible before.
        recipient.cxp_deductible_date.length === 0 ||
        // Or we've rolled into a new month.
        new Date(recipient.cxp_deductible_date).getTime() <= new Date().getTime()
      ) {
        remainingDeductible = getCampaignXPDeductibleCapForLevel(recipient.level);
        const o: ActivityOutcomeData = {
          id: 0, // Will be overwritten by the server.
          activity_id: activityId,
          target_id: r.characterId,
          type: ActivityOutcomeType.CXPDeductibleReset,
          quantity: remainingDeductible,
          extra: "",
        };
        outcomes.push(o);
      }

      // Apply CGP against the deductible first.
      r.campaignDeductiblePayment = Math.min(remainingDeductible, r.campaignGold);
      // Apply remaining CGP as CXP.
      const cgpAfterDeductible = r.campaignGold - r.campaignDeductiblePayment;
      r.xp += cgpAfterDeductible * r.xpMultiplier;
    }
  });

  // Turn "recipients" into Outcomes.
  Object.values(recipients).forEach((r) => {
    console.log({ ...r });
    // If there is GP gained, add a GP outcome.
    if (r.gold + r.campaignGold > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: r.characterId,
        type: ActivityOutcomeType.Gold,
        quantity: r.gold + r.campaignGold,
        extra: "",
      };
      outcomes.push(o);
    }
    // If there is XP gained, add an XP outcome.
    if (r.xp > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: r.characterId,
        type: ActivityOutcomeType.XP,
        quantity: r.xp,
        extra: "",
      };
      outcomes.push(o);
    }
    // If the CXP deductible changed, add a deductible outcome.
    if (r.campaignDeductiblePayment > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: r.characterId,
        type: ActivityOutcomeType.CXPDeductible,
        quantity: r.campaignDeductiblePayment,
        extra: "",
      };
      outcomes.push(o);
    }
  });

  // Adventurer Injuries.
  adventurerParticipants.forEach((ap) => {
    ap.pendingInjuryIds.forEach((injuryId) => {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: ap.characterId,
        type: ActivityOutcomeType.Injury,
        quantity: 0,
        extra: injuryId,
      };
      outcomes.push(o);
    });
  });

  // Army Deaths and Injuries
  const recoveryDate = new Date(currentDate);
  recoveryDate.setDate(recoveryDate.getDate() + 7);
  const recoveryDateString = dateFormat(recoveryDate, "yyyy-mm-dd");
  armyParticipants.forEach((ap) => {
    // Deaths
    if (ap.pendingDeathCount > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: ap.troopId,
        type: ActivityOutcomeType.ArmyDeath,
        quantity: ap.pendingDeathCount,
        extra: "",
      };
      outcomes.push(o);
    }
    // Injuries
    if (ap.pendingInjuryCount > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: ap.troopId,
        type: ActivityOutcomeType.ArmyInjury,
        quantity: ap.pendingInjuryCount,
        extra: recoveryDateString,
      };
      outcomes.push(o);
    }
  });

  return outcomes;
}

export function generateAnonymousActivity(endDate: string, participants: ActivityParticipant[]): ActivityData {
  const redux = store.getState();

  const activity: ActivityData = {
    id: 0,
    user_id: redux.user.currentUser.id,
    name: "",
    description: "",
    start_date: endDate,
    end_date: endDate,
    participants,
    resolution_text: "",
  };
  return activity;
}

export function createActivityParticipant(characterId: number): ActivityParticipant {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  const newParticipant: ActivityParticipant = {
    characterId: character.id,
    characterLevel: character.level,
    isArcane: isCharacterArcane(character.id),
    isDivine: isCharacterDivine(character.id),
    canTurnUndead: canCharacterTurnUndead(character.id),
    canSneak: canCharacterSneak(character.id),
    canFindTraps: canCharacterFindTraps(character.id),
    hasMagicWeapons: doesCharacterHaveMagicWeapons(character.id),
    hasSilverWeapons: doesCharacterHaveSilverWeapons(character.id),
  };
  return newParticipant;
}
