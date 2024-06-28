import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_ResolveActivity } from "../../serverRequestTypes";
import { ActivityData_ParticipantToString } from "../../serverAPI";
import dateFormat from "dateformat";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { ContractId } from "../../redux/gameDefsSlice";
import { ProficiencySource } from "../../staticData/types/abilitiesAndProficiencies";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_ResolveActivity;

    const isAnonymous = b.activity.id === 0;

    const queries: SQLQuery[] = [];

    // Anonymous activities won't appear in the database.
    if (!isAnonymous) {
      b.outcomes.forEach((o) => {
        queries.push({
          query: `INSERT INTO activity_outcomes (activity_id,type,data) VALUES (?,?,?)`,
          values: [o.activity_id, o.type, o.data],
        });
      });
    }

    // Apply the resolutions.

    if (b.resolution.destinationId !== 0) {
      // Change Location for participating armies and characters.
      b.activity.participants.forEach((p) => {
        queries.push({
          query: `UPDATE characters SET location_id=? WHERE id=?`,
          values: [b.resolution.destinationId, p.characterId],
        });
      });
      b.activity.army_participants.forEach((ap) => {
        queries.push({
          query: `UPDATE armies SET location_id=? WHERE id=?`,
          values: [b.resolution.destinationId, ap.armyId],
        });
      });
    }

    // Deductible resets need to happen before we make deductible payments.
    b.resolution.cxpDeductibleResets.forEach((data) => {
      // Set remaining deductible and update deductible date to the first day of this month.
      queries.push({
        query: `UPDATE characters SET remaining_cxp_deductible=?,cxp_deductible_date=? WHERE id=?`,
        values: [data.remainingDeductible, getFirstOfThisMonthDateString(), data.characterId],
      });
    });

    b.resolution.cxpDeductiblePayments.forEach((data) => {
      // Decrement remaining deductible.
      queries.push({
        query: `UPDATE characters SET remaining_cxp_deductible=GREATEST(remaining_cxp_deductible-?,0) WHERE id=?`,
        values: [data.xpAmount, data.characterId],
      });
    });

    b.resolution.moneyGranted.forEach((data) => {
      // Money.
      queries.push({
        query: `UPDATE storage SET money=money+? WHERE id=?`,
        values: [data.gpAmount, data.storageId],
      });
    });

    b.resolution.xpGranted.forEach((data) => {
      // XP.
      queries.push({
        query: `UPDATE characters SET xp=xp+? WHERE id=?`,
        values: [data.xpAmount, data.characterId],
      });
    });

    b.resolution.deadCharacterIds.forEach((characterId) => {
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

    b.resolution.armyDeaths.forEach((data) => {
      queries.push({
        query: `UPDATE troops SET count=count-? WHERE id=?`,
        values: [data.deathCount, data.troopId],
      });
    });

    b.resolution.armyInjuries.forEach((data) => {
      queries.push({
        query: "INSERT INTO troop_injuries (troop_id,count,recovery_date) VALUES(?,?,?)",
        values: [data.troopId, data.injuryCount, data.recoveryDate],
      });
    });

    // Character injuries have been grouped by type.
    // "Bed Rest" activities start the next day after the activity ends.
    const dayInMillis = 60 * 60 * 24 * 1000;
    const startDate = new Date(new Date(b.activity.end_date).getTime() + dayInMillis);
    Object.entries(b.resolution.characterInjuries).forEach(([injuryId, characterIds]) => {
      switch (injuryId) {
        case "OneDay": {
          const endDate = new Date(startDate.getTime() + dayInMillis);
          queries.push({
            query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
            values: [
              b.activity.user_id,
              "Injuries",
              `Minimal injuries incurred during #${b.activity.id}.  Requires one day of bed rest.`,
              dateFormat(startDate, "yyyy-mm-dd"),
              dateFormat(endDate, "yyyy-mm-dd"),
              characterIds
                .map((characterId) => {
                  const participant = b.activity.participants.find((p) => {
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
          const endDate = new Date(startDate.getTime() + dayInMillis * 7);
          queries.push({
            query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
            values: [
              b.activity.user_id,
              "Injuries",
              `Minor injuries incurred during #${b.activity.id}.  Requires one week of bed rest.`,
              dateFormat(startDate, "yyyy-mm-dd"),
              dateFormat(endDate, "yyyy-mm-dd"),
              characterIds
                .map((characterId) => {
                  const participant = b.activity.participants.find((p) => {
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
          const endDate = new Date(startDate.getTime() + dayInMillis * 14);
          queries.push({
            query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
            values: [
              b.activity.user_id,
              "Injuries",
              `Moderate injuries incurred during #${b.activity.id}.  Requires two weeks of bed rest.`,
              dateFormat(startDate, "yyyy-mm-dd"),
              dateFormat(endDate, "yyyy-mm-dd"),
              characterIds
                .map((characterId) => {
                  const participant = b.activity.participants.find((p) => {
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
          const endDate = new Date(startDate.getTime() + dayInMillis * 28);
          queries.push({
            query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
            values: [
              b.activity.user_id,
              "Injuries",
              `Major injuries incurred during #${b.activity.id}.  Requires four weeks of bed rest.`,
              dateFormat(startDate, "yyyy-mm-dd"),
              dateFormat(endDate, "yyyy-mm-dd"),
              characterIds
                .map((characterId) => {
                  const participant = b.activity.participants.find((p) => {
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

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
