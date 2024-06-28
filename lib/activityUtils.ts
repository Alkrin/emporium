import store from "../redux/store";
import {
  ActivityData,
  ActivityAdventurerParticipant,
  ContractData,
  ActivityArmyParticipant,
  ActivityOutcomeData,
  ActivityOutcomeType,
  ActivityOutcomeData_ChangeLocation,
  ActivityOutcomeData_Description,
  ActivityOutcomeData_InjuriesAndDeaths,
  ActivityOutcomeData_LootAndXP,
  ServerActivityOutcomeData,
  UniqueActivityOutcomeTypes,
} from "../serverAPI";
import {
  addCommasToNumber,
  canCharacterFindTraps,
  canCharacterSneak,
  canCharacterTurnUndead,
  doesCharacterHaveMagicWeapons,
  doesCharacterHaveSilverWeapons,
  getCampaignXPDeductibleCapForLevel,
  getCharacterXPMultiplier,
  getPersonalPile,
  isCharacterArcane,
  isCharacterDivine,
} from "./characterUtils";
import { Dictionary } from "./dictionary";
import dateFormat from "dateformat";
import { getFirstOfThisMonthDateString } from "./stringUtils";
import { ContractId } from "../redux/gameDefsSlice";
import { getTroopAvailableUnitCount } from "./armyUtils";

export interface ActivityResolutionData_ArmyDeath {
  troopId: number;
  deathCount: number;
}

export interface ActivityResolutionData_ArmyInjury {
  troopId: number;
  injuryCount: number;
  recoveryDate: string;
}

export interface ActivityResolutionData_CampaignXPDeductiblePayment {
  characterId: number;
  xpAmount: number;
}

export interface ActivityResolutionData_CampaignXPDeductibleReset {
  characterId: number;
  remainingDeductible: number;
}

export interface ActivityResolutionData_MoneyGranted {
  storageId: number;
  gpAmount: number;
}

export interface ActivityResolutionData_XPGranted {
  characterId: number;
  xpAmount: number;
}

export interface ActivityResolution {
  deadCharacterIds: number[];
  /** Key: injuryId, value: array of characterIds */
  characterInjuries: Dictionary<number[]>;
  armyDeaths: ActivityResolutionData_ArmyDeath[];
  armyInjuries: ActivityResolutionData_ArmyInjury[];
  cxpDeductiblePayments: ActivityResolutionData_CampaignXPDeductiblePayment[];
  cxpDeductibleResets: ActivityResolutionData_CampaignXPDeductibleReset[];
  moneyGranted: ActivityResolutionData_MoneyGranted[];
  xpGranted: ActivityResolutionData_XPGranted[];
  destinationId: number;
}

export function generateActivityResolution(
  activity: ActivityData,
  outcomes: ActivityOutcomeData[],
  currentDate: string
): ActivityResolution {
  const redux = store.getState();
  const allCharacters = redux.characters.characters;

  const resolution: ActivityResolution = {
    deadCharacterIds: [],
    characterInjuries: {},
    armyDeaths: [],
    armyInjuries: [],
    cxpDeductiblePayments: [],
    cxpDeductibleResets: [],
    moneyGranted: [],
    xpGranted: [],
    destinationId: 0,
  };

  // Any outcome could in theory have multiple instances.  For most, only the first matters.
  const outcomesByType: Dictionary<ActivityOutcomeData[]> = {};
  outcomes.forEach((o) => {
    if (!outcomesByType[o.type]) {
      outcomesByType[o.type] = [];
    }
    outcomesByType[o.type].push(o);
  });

  // Change Location.
  const changeLocationData = outcomesByType[
    ActivityOutcomeType.ChangeLocation
  ]?.[0] as ActivityOutcomeData_ChangeLocation;
  if (changeLocationData) {
    resolution.destinationId = changeLocationData.locationId;
  }

  // Adventurer Deaths.
  const injuriesAndDeathsData = outcomesByType[
    ActivityOutcomeType.InjuriesAndDeaths
  ]?.[0] as ActivityOutcomeData_InjuriesAndDeaths;

  resolution.deadCharacterIds = injuriesAndDeathsData?.deadCharacterIds ?? [];

  // Only surviving participants get stuff.
  const survivingAdventurerParticipants = activity.participants.filter((p) => {
    return !resolution.deadCharacterIds.includes(p.characterId);
  });

  interface RecipientData {
    characterId: number;
    xpGold: number;
    nonXPGold: number;
    campaignDeductiblePayment: number;
    campaignXP: number; // From campaignGold or directly from campaignXP distribution.
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
      campaignDeductiblePayment: 0,
      campaignXP: 0,
      xpShares: 0,
      xpMultiplier: getCharacterXPMultiplier(participant),
      xp: 0,
    };
  });

  const lootAndXPData = outcomesByType[ActivityOutcomeType.LootAndXP]?.[0] as ActivityOutcomeData_LootAndXP;

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

  // Actually distribute the MXP and CXP.
  const mxpPerShare = (lootAndXPData?.combatXP ?? 0) / totalXPShares;
  const campaignXPShare = (lootAndXPData?.campaignXP ?? 0) / survivingAdventurerParticipants.length;
  Object.values(recipients).forEach((r) => {
    const mxp = Math.ceil(mxpPerShare * r.xpShares * r.xpMultiplier);
    r.xp = Math.ceil(r.xp + mxp);
    const cxp = Math.ceil(campaignXPShare * r.xpMultiplier);
    r.campaignXP = Math.ceil(r.campaignXP + cxp);
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

    // Make sure a recipient entry exists.  The direct participants are already there, but henchmasters and contract holders might not be yet.
    if (!recipients[recipientId]) {
      recipients[recipientId] = {
        characterId: recipientId,
        xpGold: 0,
        nonXPGold: 0,
        campaignDeductiblePayment: 0,
        campaignXP: 0,
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

    // Once all UnpartiedLootContracts have been satisfied, the remaining CampaignGP can be applied to this character,
    // and appropriate CampaignXP can be assigned (used later for CampaignXP deductible calculations).
    recipients[recipientId].campaignXP += Math.ceil(personalShare * recipients[recipientId].xpMultiplier);
    // Tracking just the total amount that will finally be deposited in each storage, regardless of anything else.
    campaignGPDistributions[targetStorageId] = (campaignGPDistributions[targetStorageId] ?? 0) + personalShare;
  }

  const nonXPGoldPerShare = (lootAndXPData?.goldWithoutXP ?? 0) / participantsWithLootShares.length;
  const xpGoldPerShare = (lootAndXPData?.goldWithXP ?? 0) / participantsWithLootShares.length;
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
        !resolution.deadCharacterIds.includes(ulc.party_a_id) &&
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

  // In theory, we have now distributed CXP, MXP, and GP into recipient structs.  Next we should look at campaignXP
  // and apply it against the monthly deductible so we can know how much of it will actually grant xp.
  Object.values(recipients).forEach((r) => {
    if (r.campaignXP > 0) {
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
        const o: ActivityResolutionData_CampaignXPDeductibleReset = {
          characterId: r.characterId,
          remainingDeductible,
        };
        resolution.cxpDeductibleResets.push(o);
      }

      // Apply CXP against the deductible first.
      r.campaignDeductiblePayment = Math.min(remainingDeductible, Math.ceil(r.campaignXP));
      // Apply remaining CXP.
      const cxpAfterDeductible = r.campaignXP - r.campaignDeductiblePayment;
      r.xp += Math.ceil(cxpAfterDeductible * r.xpMultiplier);
    }
  });

  // Turn "recipients" into Outcomes.
  Object.values(recipients).forEach((r) => {
    // If there is GP gained, add a GP outcome.
    if (r.nonXPGold + r.xpGold > 0) {
      const o: ActivityResolutionData_MoneyGranted = {
        storageId: getPersonalPile(r.characterId).id,
        gpAmount: r.nonXPGold + r.xpGold,
      };
      resolution.moneyGranted.push(o);
    }
    // If there is XP gained, add an XP outcome.
    if (r.xp > 0) {
      const o: ActivityResolutionData_XPGranted = {
        characterId: r.characterId,
        xpAmount: r.xp,
      };
      resolution.xpGranted.push(o);
    }
    // If the CXP deductible changed, add a deductible outcome.
    if (r.campaignDeductiblePayment > 0) {
      const o: ActivityResolutionData_CampaignXPDeductiblePayment = {
        characterId: r.characterId,
        xpAmount: r.campaignDeductiblePayment,
      };
      resolution.cxpDeductiblePayments.push(o);
    }
  });

  // Campaign GP distributions (we accumulated these down to one per storage to cut down on DB writes).
  Object.entries(campaignGPDistributions).forEach(([storageIdString, gpAmount]) => {
    const o: ActivityResolutionData_MoneyGranted = {
      storageId: +storageIdString,
      gpAmount,
    };
    resolution.moneyGranted.push(o);
  });

  // Adventurer Injuries.
  Object.entries(injuriesAndDeathsData?.characterInjuries ?? {}).forEach(([characterIdString, injuryIds]) => {
    injuryIds.forEach((injuryId) => {
      if (!resolution.characterInjuries[injuryId]) {
        resolution.characterInjuries[injuryId] = [];
      }
      resolution.characterInjuries[injuryId].push(+characterIdString);
    });
  });

  // Army Deaths and Injuries
  const recoveryDate = new Date(currentDate);
  recoveryDate.setDate(recoveryDate.getDate() + 7);
  const recoveryDateString = dateFormat(recoveryDate, "yyyy-mm-dd");

  Object.entries(injuriesAndDeathsData?.troopInjuriesByArmy ?? {}).forEach(([armyIdString, troopInjuries]) => {
    Object.entries(troopInjuries).forEach(([troopDefIdString, injuryCount]) => {
      const troopId = redux.armies.troopsByArmy[+armyIdString].find((troop) => troop.def_id === +troopDefIdString)?.id;
      if (troopId) {
        const o: ActivityResolutionData_ArmyInjury = {
          troopId,
          injuryCount,
          recoveryDate: recoveryDateString,
        };
        resolution.armyInjuries.push(o);
      }
    });
  });

  Object.entries(injuriesAndDeathsData?.troopDeathsByArmy ?? {}).forEach(([armyIdString, troopDeaths]) => {
    Object.entries(troopDeaths).forEach(([troopDefIdString, deathCount]) => {
      const troopId = redux.armies.troopsByArmy[+armyIdString].find((troop) => troop.def_id === +troopDefIdString)?.id;
      if (troopId) {
        const o: ActivityResolutionData_ArmyDeath = {
          troopId,
          deathCount,
        };
        resolution.armyDeaths.push(o);
      }
    });
  });

  return resolution;
}

export function generateAnonymousActivity(
  endDate: string,
  participants: ActivityAdventurerParticipant[],
  armyParticipants: ActivityArmyParticipant[],
  leadFromBehindId: number
): ActivityData {
  const redux = store.getState();

  const activity: ActivityData = {
    id: 0,
    user_id: redux.user.currentUser.id,
    name: "",
    description: "",
    start_date: endDate,
    end_date: endDate,
    participants,
    army_participants: armyParticipants,
    lead_from_behind_id: leadFromBehindId,
  };
  return activity;
}

export function createActivityAdventurerParticipant(characterId: number): ActivityAdventurerParticipant {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  const newParticipant: ActivityAdventurerParticipant = {
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

export function createActivityArmyParticipant(armyId: number, startDate: string): ActivityArmyParticipant {
  const redux = store.getState();

  const troopCounts: Dictionary<number> = {};
  redux.armies.troopsByArmy[armyId].forEach((troopData) => {
    // This accounts for injuries on the startDate.
    let count: number = getTroopAvailableUnitCount(troopData, startDate);
    troopCounts[troopData.def_id] = (troopCounts[troopData.def_id] ?? 0) + count;
  });

  const newParticipant: ActivityArmyParticipant = {
    armyId,
    troopCounts,
  };
  return newParticipant;
}

export function getDisplayTextForExpectedOutcome(data: ActivityOutcomeData): string {
  const redux = store.getState();

  switch (data.type) {
    case ActivityOutcomeType.ChangeLocation: {
      const dcl = data as ActivityOutcomeData_ChangeLocation;
      const locationName = redux.locations.locations[dcl.locationId]?.name ?? "<LOCATION TBD>";
      return `Participants move to ${locationName}`;
    }
    case ActivityOutcomeType.Description: {
      const dd = data as ActivityOutcomeData_Description;
      return dd.description;
    }
    case ActivityOutcomeType.InjuriesAndDeaths: {
      const diad = data as ActivityOutcomeData_InjuriesAndDeaths;
      return (
        `Injured Adventurers: ${Object.keys(diad.characterInjuries).length}\n` +
        `Killed Adventurers: ${diad.deadCharacterIds.length}\n` +
        `Injured Troops: ${Object.values(diad.troopInjuriesByArmy).reduce<number>((injuries, troopData) => {
          injuries += Object.values(troopData).reduce<number>((soFar, count) => {
            return soFar + count;
          }, 0);
          return injuries;
        }, 0)}\n` +
        `Killed Troops: ${Object.values(diad.troopDeathsByArmy).reduce<number>((deaths, troopData) => {
          deaths += Object.values(troopData).reduce<number>((soFar, count) => {
            return soFar + count;
          }, 0);
          return deaths;
        }, 0)}`
      );
    }
    case ActivityOutcomeType.LootAndXP: {
      const dlax = data as ActivityOutcomeData_LootAndXP;
      return (
        `Gold with XP:\t\xa0${addCommasToNumber(dlax.goldWithXP, 2)}gp\n` +
        `Gold w/o XP:\t\xa0${addCommasToNumber(dlax.goldWithoutXP, 2)}gp\n` +
        `Combat XP:\t\xa0${addCommasToNumber(dlax.combatXP)}\n` +
        `Campaign XP:\t\xa0${addCommasToNumber(dlax.campaignXP)}`
      );
    }
    default: {
      return "";
    }
  }
}

export function convertServerActivityOutcome(seo: ServerActivityOutcomeData): ActivityOutcomeData | null {
  switch (seo.type) {
    case ActivityOutcomeType.ChangeLocation: {
      const o: ActivityOutcomeData_ChangeLocation = {
        type: seo.type,
        id: seo.id,
        activity_id: seo.activity_id,
        locationId: +seo.data,
      };
      return o;
    }
    case ActivityOutcomeType.Description: {
      const o: ActivityOutcomeData_Description = {
        type: seo.type,
        id: seo.id,
        activity_id: seo.activity_id,
        description: seo.data,
      };
      return o;
    }
    case ActivityOutcomeType.InjuriesAndDeaths: {
      // Major categories are separated by '|'.
      const [deadCharacterIdsData, characterInjuriesData, troopInjuriesByArmyData, troopDeathsByArmyData] =
        seo.data.split("|");
      // Dead character ids are a comma-separated list.
      const deadCharacterIds = deadCharacterIdsData.split(",").map((dcidString) => +dcidString);
      // Injured characters are separated by ':'.
      // The character id is separated from the injuries by '-'.
      // The injury ids are a comma-separated list.
      const characterInjuries: Dictionary<string[]> = {};
      characterInjuriesData.split(":").forEach((characterInjuriesDatum) => {
        const [characterIdString, injuriesData] = characterInjuriesDatum.split("-");
        const injuryIds = injuriesData.split(",");
        characterInjuries[+characterIdString] = injuryIds;
      });
      // Armies are separated by ':'.
      // ArmyId is separated from troop types by '~'.
      // Troop types are separated by ','.
      // TroopDefId is separated from the injury count by '-'.
      const troopInjuriesByArmy: Dictionary<Dictionary<number>> = {};
      troopInjuriesByArmyData.split(":").forEach((armyInjuriesDatum) => {
        const [armyIdString, troopTypesData] = armyInjuriesDatum.split("~");
        const troopInjuries: Dictionary<number> = {};
        troopTypesData.split(",").forEach((troopInjuriesDatum) => {
          const [troopDefIdString, countString] = troopInjuriesDatum.split("-");
          troopInjuries[+troopDefIdString] = +countString;
        });
        troopInjuriesByArmy[+armyIdString] = troopInjuries;
      });
      // Armies are separated by ':'.
      // ArmyId is separated from troop types by '~'.
      // Troop types are separated by ','.
      // TroopDefId is separated from the death count by '-'.
      const troopDeathsByArmy: Dictionary<Dictionary<number>> = {};
      troopDeathsByArmyData.split(":").forEach((armyDeathsDatum) => {
        const [armyIdString, troopTypesData] = armyDeathsDatum.split("~");
        const troopDeaths: Dictionary<number> = {};
        troopTypesData.split(",").forEach((troopDeathsDatum) => {
          const [troopDefIdString, countString] = troopDeathsDatum.split("-");
          troopDeaths[+troopDefIdString] = +countString;
        });
        troopDeathsByArmy[+armyIdString] = troopDeaths;
      });

      const o: ActivityOutcomeData_InjuriesAndDeaths = {
        type: seo.type,
        id: seo.id,
        activity_id: seo.activity_id,
        deadCharacterIds,
        // Injuries state.  Key: characterId, value: injuryIds.
        characterInjuries,
        // First key: armyId, second key: troopDefId, value: number of injuries.
        troopInjuriesByArmy,
        // First key: armyId, second key: troopDefId, value: number of deaths.
        troopDeathsByArmy,
      };
      return o;
    }
    case ActivityOutcomeType.LootAndXP: {
      const [goldWithXPString, goldWithoutXPString, combatXPString, campaignXPString] = seo.data.split(",");
      const o: ActivityOutcomeData_LootAndXP = {
        type: seo.type,
        id: seo.id,
        activity_id: seo.activity_id,
        goldWithXP: +goldWithXPString,
        goldWithoutXP: +goldWithoutXPString,
        combatXP: +combatXPString,
        campaignXP: +campaignXPString,
      };
      return o;
    }
    default: {
      console.error(`Found invalid ExpectedOutcomeType: ${seo.type}`);
      return null;
    }
  }
}

export function convertActivityOutcomeForServer(eo: ActivityOutcomeData): ServerActivityOutcomeData {
  const seo: ServerActivityOutcomeData = {
    id: eo.id,
    activity_id: eo.activity_id,
    type: eo.type,
    data: "",
  };

  switch (eo.type) {
    case ActivityOutcomeType.ChangeLocation: {
      const teo = eo as ActivityOutcomeData_ChangeLocation;
      seo.data = teo.locationId.toString();
      break;
    }
    case ActivityOutcomeType.Description: {
      const teo = eo as ActivityOutcomeData_Description;
      seo.data = teo.description;
      break;
    }
    case ActivityOutcomeType.InjuriesAndDeaths: {
      const teo = eo as ActivityOutcomeData_InjuriesAndDeaths;

      // TODO: Major categories are separated by '|'.

      // Dead character ids are a comma-separated list.
      const deadCharactersData = teo.deadCharacterIds.map((dcid) => dcid.toString()).join(",");

      // Injured characters are separated by ':'.
      const injuredCharactersData = Object.entries(teo.characterInjuries)
        .map(([characterIdString, injuryIds]) => {
          // The character id is separated from the injuries by '-'.
          // The injury ids are a comma-separated list.
          return characterIdString + "-" + injuryIds.join(",");
        })
        .join(":");

      // Armies are separated by ':'.
      const troopInjuriesData = Object.entries(teo.troopInjuriesByArmy)
        .map(([armyIdString, troopInjuries]) => {
          // ArmyId is separated from troop types by '~'.
          // Troop types are separated by ','.
          // TroopDefId is separated from the injury count by '-'.
          return (
            armyIdString +
            "~" +
            Object.entries(troopInjuries)
              .map((troopDefId, count) => `${troopDefId}-${count}`)
              .join(",")
          );
        })
        .join(":");

      // Armies are separated by ':'.
      const troopDeathsData = Object.entries(teo.troopDeathsByArmy)
        .map(([armyIdString, troopDeaths]) => {
          // ArmyId is separated from troop types by '~'.
          // Troop types are separated by ','.
          // TroopDefId is separated from the injury count by '-'.
          return (
            armyIdString +
            "~" +
            Object.entries(troopDeaths)
              .map((troopDefId, count) => `${troopDefId}-${count}`)
              .join(",")
          );
        })
        .join(":");

      seo.data = `${deadCharactersData}|${injuredCharactersData}|${troopInjuriesData}|${troopDeathsData}`;

      break;
    }
    case ActivityOutcomeType.LootAndXP: {
      const teo = eo as ActivityOutcomeData_LootAndXP;
      seo.data = `${teo.goldWithXP},${teo.goldWithoutXP},${teo.combatXP},${teo.campaignXP}`;
      break;
    }
    default: {
      console.error(`Unable to convert ExpectedOutcomeData with type ${eo.type}`);
      break;
    }
  }

  return seo;
}

export function sortActivityOutcomes(a: ActivityOutcomeData, b: ActivityOutcomeData): number {
  if (a.type !== b.type) {
    if (a.type === ActivityOutcomeType.Description) {
      return -1;
    }
    if (b.type === ActivityOutcomeType.Description) {
      return 1;
    }
  }
  return b.type.localeCompare(a.type);
}

export function getDisallowedTypesFromOutcomes(outcomes: ActivityOutcomeData[]): ActivityOutcomeType[] {
  const disallowedTypes = new Set<ActivityOutcomeType>();

  outcomes.forEach((o) => {
    if (UniqueActivityOutcomeTypes.includes(o.type)) {
      disallowedTypes.add(o.type);
    }
  });

  return Array.from(disallowedTypes);
}
