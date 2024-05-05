import store from "../redux/store";
import {
  ActivityData,
  ActivityOutcomeData,
  ActivityOutcomeType,
  ActivityParticipant,
  ContractData,
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
import { getFirstOfThisMonthDateString } from "./stringUtils";
import { ContractId } from "../redux/gameDefsSlice";

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
  gpWithoutXp: number
): [ActivityOutcomeData[], Dictionary<number>] {
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

  interface RecipientData {
    characterId: number;
    xpGold: number;
    nonXPGold: number;
    campaignGold: number; // Contractually granted share of gold paid to this recipient by others.
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
      xpGold: 0,
      nonXPGold: 0,
      campaignGold: 0,
      campaignDeductiblePayment: 0,
      xpShares: 0,
      xpMultiplier: getCharacterXPMultiplier(participant),
      xp: 0,
    };
  });

  // MXP distribution.
  // First figure out how many shares each participant gets.
  let totalXPShares: number = 0;
  survivingAdventurerParticipants.forEach((p) => {
    const participant = allCharacters[p.characterId];
    const xpMultiplier = getCharacterXPMultiplier(participant);
    let xpShares: number = 2;
    // If your henchmaster is in the group, you get half a share of mxp.
    if (
      !!survivingAdventurerParticipants.find((p2) => {
        return p2.characterId === participant.henchmaster_id;
      })
    ) {
      xpShares = 1;
    }
    totalXPShares += xpShares;

    // A few pre-calculated values.
    recipients[p.characterId].xpShares = xpShares;
    recipients[p.characterId].xpMultiplier = xpMultiplier;
  });

  // Actually distribute the MXP.
  const mxpPerShare = totalMXP / totalXPShares;
  Object.values(recipients).forEach((r) => {
    const mxp = Math.ceil(mxpPerShare * r.xpShares * r.xpMultiplier);
    r.xp = Math.ceil(r.xp + mxp);
  });

  // Gold and GXP distribution.
  // Some participants may have contractually given up their own shares of loot.
  const minionIds: number[] = [];
  Object.values(redux.contracts.contractsByDefByPartyAId[ContractId.PartiedLootContract] ?? {}).forEach(
    (plcs: ContractData[]) => {
      plcs.forEach((plc) => {
        const partyAIsPresent = !!survivingAdventurerParticipants.find((sap) => sap.characterId === plc.party_a_id);
        const partyBIsPresent = !!survivingAdventurerParticipants.find((sap) => sap.characterId === plc.party_b_id);

        if (partyAIsPresent && partyBIsPresent) {
          minionIds.push(plc.party_b_id);
        }
      });
    }
  );

  const participantsWithLootShares = survivingAdventurerParticipants.filter((p) => {
    // If there is a PartiedLoot contract and both parties are in the list of survivors, one of them (the "minion")
    // doesn't get a personal share, but is instead paid out of the other's share.
    return !minionIds.includes(p.characterId);
  });

  // Key: storageId, value: GP amount to deposit.
  const campaignGPDistributions: Dictionary<number> = {};

  // Helper function to recursively pass GP through the contract chain.
  function distributeCampaignGP(campaignGP: number, recipientId: number, targetStorageId: number): void {
    // If we're down to less than a copper to distribute, just stop.
    if (campaignGP < 0.01) {
      return;
    }

    const character = allCharacters[recipientId];

    // Make sure a recipient entry exists.
    if (!recipients[recipientId]) {
      recipients[recipientId] = {
        characterId: recipientId,
        xpGold: 0,
        nonXPGold: 0,
        campaignGold: 0,
        campaignDeductiblePayment: 0,
        xpShares: 0,
        xpMultiplier: getCharacterXPMultiplier(character),
        xp: 0,
      };
    }

    // Contractual obligations!
    // ActivityLootContracts were already activated before entering this recursion, so we don't have to check them again.
    // PartiedLootContracts were already activated to generate `participantsWithLootShares`, so we don't have to check them again.
    // UnpartiedLootContracts are the last relevant type.  CampaignGP is distributed according to this chain regardless of the characters'
    //   participation in (or absence from) this activity.
    let personalShare = campaignGP;
    const ulcs: ContractData[] =
      redux.contracts.contractsByDefByPartyBId[ContractId.UnpartiedLootContract]?.[recipientId] ?? [];
    ulcs.forEach((ulc) => {
      const percentOwed = ulc.value / 100;
      const gpOwed = campaignGP * percentOwed;
      const gpPaid = Math.min(personalShare, gpOwed);
      personalShare -= gpPaid;
      // Recursively pass the CampaignGP up the contract chain.
      distributeCampaignGP(gpPaid, ulc.party_a_id, ulc.target_a_id);
    });

    // Once all UnpartiedLootContracts have been satisfied, the remaining CampaignGP can be applied to this character.
    // Tracking total by character, used later for CXP deductible calculations.
    recipients[recipientId].campaignGold += personalShare;
    // Tracking just the total amount that will finally be deposited in each storage, regardless of anything else.
    campaignGPDistributions[targetStorageId] = (campaignGPDistributions[targetStorageId] ?? 0) + personalShare;
  }

  const nonXPGoldPerShare = gpWithoutXp / participantsWithLootShares.length;
  const xpGoldPerShare = gpWithXp / participantsWithLootShares.length;
  participantsWithLootShares.forEach((p) => {
    // Check if this participant has any contracts that require them to share their loot.
    let nonXPGoldPersonalShare = nonXPGoldPerShare;
    let xpGoldPersonalShare = xpGoldPerShare;

    // Is there a relevant ActivityLoot contract? (gives away a flat percentage off the top).
    const alcs = redux.contracts.contractsByDefByPartyAId[ContractId.ActivityLootContract]?.[p.characterId] ?? [];
    alcs.forEach((alc) => {
      const percentOwed = alc.value / 100;
      const nonXPGoldOwed = nonXPGoldPerShare * percentOwed;
      const xpGoldOwed = xpGoldPerShare * percentOwed;

      nonXPGoldPersonalShare -= nonXPGoldOwed;
      xpGoldPersonalShare -= xpGoldOwed;

      // Distribute the owed gold through the contract chain.
      distributeCampaignGP(nonXPGoldOwed + xpGoldOwed, alc.party_b_id, alc.target_a_id);
    });

    // ALCs come off the top.  PLCS and ULCs are a percentage of what remains after that.
    let nonXPGoldPersonalShareRemaining = nonXPGoldPersonalShare;
    let xpGoldPersonalShareRemaining = xpGoldPersonalShare;

    // Is there a relevant PartiedLoot contract? (pays a percentage of their personal share to a minion who is also present)
    const plcs = redux.contracts.contractsByDefByPartyAId[ContractId.PartiedLootContract]?.[p.characterId] ?? [];
    plcs.forEach((plc) => {
      // If party B is present (and alive), pay them.
      if (!!survivingAdventurerParticipants.find((sap) => sap.characterId === plc.party_b_id)) {
        const percentOwed = plc.value / 100;
        const nonXPGoldOwed = nonXPGoldPersonalShare * percentOwed;
        const xpGoldOwed = xpGoldPersonalShare * percentOwed;
        const nonXPGoldPaid = Math.min(nonXPGoldOwed, nonXPGoldPersonalShareRemaining);
        const xpGoldPaid = Math.min(xpGoldOwed, xpGoldPersonalShareRemaining);
        nonXPGoldPersonalShareRemaining -= nonXPGoldPaid;
        xpGoldPersonalShareRemaining -= xpGoldPaid;

        recipients[plc.party_b_id].nonXPGold += nonXPGoldPaid;
        recipients[plc.party_b_id].xpGold += xpGoldPaid;
      }
    });

    // Is there a relevant UnpartiedLoot contract? (pays a percentage of their personal share to a master who is NOT present)
    const ulcs = redux.contracts.contractsByDefByPartyBId[ContractId.UnpartiedLootContract]?.[p.characterId] ?? [];
    ulcs.forEach((ulc) => {
      // If the master is not present, pay them as CampaignGP.
      if (
        !deadCharacterIds.includes(ulc.party_a_id) &&
        !survivingAdventurerParticipants.find((sap) => sap.characterId === ulc.party_a_id)
      ) {
        const percentOwed = ulc.value / 100;
        const nonXPGoldOwed = nonXPGoldPersonalShare * percentOwed;
        const xpGoldOwed = xpGoldPersonalShare * percentOwed;
        const nonXPGoldPaid = Math.min(nonXPGoldOwed, nonXPGoldPersonalShareRemaining);
        const xpGoldPaid = Math.min(xpGoldOwed, xpGoldPersonalShareRemaining);
        nonXPGoldPersonalShareRemaining -= nonXPGoldPaid;
        xpGoldPersonalShareRemaining -= xpGoldPaid;

        distributeCampaignGP(nonXPGoldPaid + xpGoldPaid, ulc.party_a_id, ulc.target_a_id);
      }
    });

    // Once all contracts have been satisfied, any remaining loot goes to this character.
    recipients[p.characterId].nonXPGold += nonXPGoldPersonalShareRemaining;
    recipients[p.characterId].xpGold += xpGoldPersonalShareRemaining;
    // xpGold grant XP, of course!
    recipients[p.characterId].xp += Math.ceil(xpGoldPersonalShareRemaining * recipients[p.characterId].xpMultiplier);
  });

  // In theory, we have now distributed MXP and GP into recipient structs.  Next we should look at campaignGold
  // and apply it against the monthly deductible so we can know how much of it counts to grant xp.
  Object.values(recipients).forEach((r) => {
    if (r.campaignGold > 0) {
      const recipient = allCharacters[r.characterId];

      // See how much is left on the monthly CXP deductible.  Reset it if needed.
      const thisMonth = getFirstOfThisMonthDateString();
      let remainingDeductible = recipient.remaining_cxp_deductible;
      if (
        // Never had a deductible before.
        recipient.cxp_deductible_date.length === 0 ||
        // Or we've rolled into a new month.
        recipient.cxp_deductible_date !== thisMonth
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
      r.campaignDeductiblePayment = Math.min(remainingDeductible, Math.ceil(r.campaignGold));
      // Apply remaining CGP as CXP.
      const cgpAfterDeductible = r.campaignGold - r.campaignDeductiblePayment;
      r.xp += Math.ceil(cgpAfterDeductible * r.xpMultiplier);
    }
  });

  // Turn "recipients" into Outcomes.
  Object.values(recipients).forEach((r) => {
    // If there is GP gained, add a GP outcome.
    if (r.nonXPGold + r.xpGold > 0) {
      const o: ActivityOutcomeData = {
        id: 0, // Will be overwritten by the server.
        activity_id: activityId,
        target_id: r.characterId,
        type: ActivityOutcomeType.Gold,
        quantity: r.nonXPGold + r.xpGold,
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

  return [outcomes, campaignGPDistributions];
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
