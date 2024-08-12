import { ActivityResolution } from "../../../lib/activityUtils";
import { SQLQuery } from "../../../lib/db";
import { getFirstOfThisMonthDateString } from "../../../lib/stringUtils";
import { ContractId } from "../../../redux/gameDefsSlice";
import { ActivityData, ActivityData_ParticipantToString, ServerActivityOutcomeData } from "../../../serverAPI";
import dateFormat from "dateformat";
import { ProficiencySource } from "../../../staticData/types/abilitiesAndProficiencies";
import { addDaysToDateString, dayInMillis } from "../../../lib/timeUtils";
import { generateQueriesCreateItem } from "./generateQueriesCreateItem";
import { convertItemForServer } from "../../../lib/itemUtils";
import { generateQueriesEditItem } from "./generateQueriesEditItem";

export function generateQueriesResolveActivity(
  activity: ActivityData,
  outcomes: ServerActivityOutcomeData[],
  resolution: ActivityResolution
): SQLQuery[] {
  let queries: SQLQuery[] = [];

  const isAnonymous = activity.id === 0;

  // Anonymous activities won't appear in the database.
  if (!isAnonymous) {
    outcomes.forEach((o) => {
      queries.push({
        query: `INSERT INTO activity_outcomes (activity_id,type,data) VALUES (?,?,?)`,
        values: [o.activity_id, o.type, o.data],
      });
    });
  }

  // Apply the resolutions.

  if (resolution.destinationId !== 0) {
    // Change Location for participating armies and characters.
    activity.participants.forEach((p) => {
      queries.push({
        query: `UPDATE characters SET location_id=? WHERE id=?`,
        values: [resolution.destinationId, p.characterId],
      });
    });
    activity.army_participants.forEach((ap) => {
      queries.push({
        query: `UPDATE armies SET location_id=? WHERE id=?`,
        values: [resolution.destinationId, ap.armyId],
      });
    });
  }

  // Deductible resets need to happen before we make deductible payments.
  resolution.cxpDeductibleResets.forEach((data) => {
    // Set remaining deductible and update deductible date to the first day of this month.
    queries.push({
      query: `UPDATE characters SET remaining_cxp_deductible=?,cxp_deductible_date=? WHERE id=?`,
      values: [data.remainingDeductible, getFirstOfThisMonthDateString(), data.characterId],
    });
  });

  resolution.cxpDeductiblePayments.forEach((data) => {
    // Decrement remaining deductible.
    queries.push({
      query: `UPDATE characters SET remaining_cxp_deductible=GREATEST(remaining_cxp_deductible-?,0) WHERE id=?`,
      values: [data.xpAmount, data.characterId],
    });
  });

  resolution.moneyGranted.forEach((data) => {
    // Money.
    queries.push({
      query: `UPDATE storage SET money=money+? WHERE id=?`,
      values: [data.gpAmount, data.storageId],
    });
  });

  resolution.xpGranted.forEach((data) => {
    // XP.
    queries.push({
      query: `UPDATE characters SET xp=xp+? WHERE id=?`,
      values: [data.xpAmount, data.characterId],
    });
  });

  resolution.deadCharacterIds.forEach((characterId) => {
    // These should be the same queries as in the `killCharacter` action.

    // Cancel all of their contracts.
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.ArmyWageContract, characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.StructureMaintenanceContract, characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.ActivityLootContract, characterId, characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.CharacterWageContract, characterId, characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.PartiedLootContract, characterId, characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.UnpartiedLootContract, characterId, characterId],
    });

    // Set all of their henchmen free.
    queries.push({
      query: `UPDATE characters SET henchmaster_id=0 WHERE henchmaster_id=?`,
      values: [characterId],
    });

    // The actual character gets deaded last, after all of its dependent data is gone.
    // We also set them free from their henchmaster.
    queries.push({
      query: `UPDATE characters SET dead=true,henchmaster_id=0 WHERE id=?`,
      values: [characterId],
    });
  });

  resolution.armyDeaths.forEach((data) => {
    queries.push({
      query: `UPDATE troops SET count=count-? WHERE id=?`,
      values: [data.deathCount, data.troopId],
    });
  });

  resolution.armyInjuries.forEach((data) => {
    queries.push({
      query: "INSERT INTO troop_injuries (troop_id,count,recovery_date) VALUES(?,?,?)",
      values: [data.troopId, data.injuryCount, data.recoveryDate],
    });
  });

  // Character injuries have been grouped by type.
  // "Bed Rest" activities start the next day after the activity ends.
  const startDate = addDaysToDateString(activity.end_date, 1);
  Object.entries(resolution.characterInjuries).forEach(([injuryId, characterIds]) => {
    switch (injuryId) {
      case "OneDay": {
        const endDate = addDaysToDateString(startDate, 1);
        queries.push({
          query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
          values: [
            activity.user_id,
            "Injuries",
            `Minimal injuries incurred during #${activity.id}.  Requires one day of bed rest.`,
            startDate,
            endDate,
            characterIds
              .map((characterId) => {
                const participant = activity.participants.find((p) => {
                  return p.characterId === characterId;
                });
                if (participant) {
                  return ActivityData_ParticipantToString(participant);
                } else {
                  // Should never happen, but at least we have a fallback.
                  return characterId;
                }
              })
              .join(","),
          ],
        });
        break;
      }
      case "OneWeek": {
        const endDate = addDaysToDateString(startDate, 7);
        queries.push({
          query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
          values: [
            activity.user_id,
            "Injuries",
            `Minor injuries incurred during #${activity.id}.  Requires one week of bed rest.`,
            startDate,
            endDate,
            characterIds
              .map((characterId) => {
                const participant = activity.participants.find((p) => {
                  return p.characterId === characterId;
                });
                if (participant) {
                  return ActivityData_ParticipantToString(participant);
                } else {
                  // Should never happen, but at least we have a fallback.
                  return characterId;
                }
              })
              .join(","),
          ],
        });
        break;
      }
      case "TwoWeeks": {
        const endDate = addDaysToDateString(startDate, 14);
        queries.push({
          query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
          values: [
            activity.user_id,
            "Injuries",
            `Moderate injuries incurred during #${activity.id}.  Requires two weeks of bed rest.`,
            startDate,
            endDate,
            characterIds
              .map((characterId) => {
                const participant = activity.participants.find((p) => {
                  return p.characterId === characterId;
                });
                if (participant) {
                  return ActivityData_ParticipantToString(participant);
                } else {
                  // Should never happen, but at least we have a fallback.
                  return characterId;
                }
              })
              .join(","),
          ],
        });
        break;
      }
      case "FourWeeks": {
        const endDate = addDaysToDateString(startDate, 28);
        queries.push({
          query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
          values: [
            activity.user_id,
            "Injuries",
            `Major injuries incurred during #${activity.id}.  Requires four weeks of bed rest.`,
            startDate,
            endDate,
            characterIds
              .map((characterId) => {
                const participant = activity.participants.find((p) => {
                  return p.characterId === characterId;
                });
                if (participant) {
                  return ActivityData_ParticipantToString(participant);
                } else {
                  // Should never happen, but at least we have a fallback.
                  return characterId;
                }
              })
              .join(","),
          ],
        });
        break;
      }
      default: {
        // All other injuries are permanent, and get added as "proficiencies".
        characterIds.forEach((characterId) => {
          queries.push({
            query: "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES(?,?,?,?)",
            values: [characterId, injuryId, "", ProficiencySource.Injury],
          });
        });
        break;
      }
    }
  });

  resolution.armyMerges.forEach((merge) => {
    // Transfer unique troops from the subordinate army into the primary army.
    merge.uniqueTroopIds.forEach((uniqueTroopId) => {
      queries.push({
        query: "UPDATE troops SET army_id=? WHERE id=?",
        values: [merge.primaryArmyId, uniqueTroopId],
      });
    });

    // Resolve each troop merge.
    merge.troopMerges.forEach(([subordinateTroopId, primaryTroopId]) => {
      // The primary troop gains the members from the subordinate troop.
      queries.push({
        query: "UPDATE troops SET count=count+(SELECT count FROM troops WHERE id=?) WHERE id=?",
        values: [subordinateTroopId, primaryTroopId],
      });
      // Any pending subordinate troop injuries are inherited by the primary troop.
      queries.push({
        query: "UPDATE troop_injuries SET troop_id=? WHERE troop_id=?",
        values: [primaryTroopId, subordinateTroopId],
      });
      // The subordinate troop now gets destroyed, since its members have been given away.
      queries.push({
        query: "DELETE FROM troops WHERE id=?",
        values: [subordinateTroopId],
      });
    });

    // Now that the troops have all been transferred, delete all contracts associated with the subordinate army.
    queries.push({
      query: "DELETE FROM contracts WHERE def_id=? AND party_b_id=?",
      values: [ContractId.ArmyWageContract, merge.subordinateArmyId],
    });

    // And finally destroy the subordinate army itself.
    queries.push({
      query: "DELETE FROM armies WHERE id=?",
      values: [merge.subordinateArmyId],
    });
  });

  // Army Wage Contract transfers.
  resolution.transferArmyWageContractIds.forEach((contractId) => {
    queries.push({
      query: "UPDATE contracts SET target_a_id=? WHERE id=?",
      values: [resolution.transferStorageId, contractId],
    });
  });

  // Character Wage Contract transfers.
  resolution.transferCharacterWageContractIds.forEach((contractId) => {
    queries.push({
      query: "UPDATE contracts SET target_a_id=? WHERE id=?",
      values: [resolution.transferStorageId, contractId],
    });
  });

  // Activity Loot Contract transfers.
  resolution.transferActivityLootContractIds.forEach((contractId) => {
    queries.push({
      query: "UPDATE contracts SET target_a_id=? WHERE id=?",
      values: [resolution.transferStorageId, contractId],
    });
  });

  // New items.
  resolution.newItems.forEach((item) => {
    queries = queries.concat(generateQueriesCreateItem(convertItemForServer(item)));
  });

  // Updated items.
  resolution.updatedItems.forEach((item) => {
    queries = queries.concat(generateQueriesEditItem(convertItemForServer(item)));
  });

  return queries;
}
