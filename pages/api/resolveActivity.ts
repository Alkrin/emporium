import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_ResolveActivity } from "../../serverRequestTypes";
import { ActivityData_ParticipantToString, ActivityOutcomeData, ActivityOutcomeType } from "../../serverAPI";
import dateFormat from "dateformat";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_ResolveActivity;
    b.outcomes.sort((oa, ob) => {
      if (oa.type !== ob.type) {
        // Have to do resets before applying other things.
        if (oa.type === ActivityOutcomeType.CXPDeductibleReset) {
          return -1;
        } else if (ob.type === ActivityOutcomeType.CXPDeductibleReset) {
          return 1;
        }
      }
      return 0;
    });

    const isAnonymous = b.activity.id === 0;

    const queries: SQLQuery[] = [];

    if (!isAnonymous) {
      // Update the activity with resolution text.
      queries.push({
        query: `UPDATE activities SET resolution_text=? WHERE id=?`,
        values: [b.resolution_text, b.activity.id],
      });

      // Create the Outcome records.
      b.outcomes.forEach((o) => {
        queries.push({
          query: `INSERT INTO activity_outcomes (activity_id,type,target_id,quantity) VALUES (?,?,?,?)`,
          values: [o.activity_id, o.type, o.target_id, o.quantity],
        });
      });
    }

    // Adventurer Injuries.  Grouped by injury type.
    const oneDayInjuries: ActivityOutcomeData[] = [];
    const oneWeekInjuries: ActivityOutcomeData[] = [];
    const twoWeekInjuries: ActivityOutcomeData[] = [];
    const fourWeekInjuries: ActivityOutcomeData[] = [];
    // Apply the Outcomes.
    b.outcomes.forEach((o) => {
      switch (o.type) {
        case ActivityOutcomeType.Gold: {
          // Increment player gold (goes into their personal pile).
          queries.push({
            query: `UPDATE storage SET money=money+? WHERE name=CONCAT('Personal Pile ',CAST(? AS VARCHAR(32)))`,
            values: [o.quantity, o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.XP: {
          // Increment player XP.
          queries.push({
            query: `UPDATE characters SET xp=xp+? WHERE id=?`,
            values: [o.quantity, o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.CXPDeductibleReset: {
          // Set remaining deductible and update deductible date to the first day of this month.
          queries.push({
            query: `UPDATE characters SET remaining_cxp_deductible=?,cxp_deductible_date=? WHERE id=?`,
            values: [o.quantity, dateFormat(new Date(), "yyyy-mm-01"), o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.CXPDeductible: {
          // Decrement remaining deductible.
          queries.push({
            query: `UPDATE characters SET remaining_cxp_deductible=GREATEST(remaining_cxp_deductible-?,0) WHERE id=?`,
            values: [o.quantity, o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.Injury: {
          switch (o.extra) {
            case "OneDay": {
              oneDayInjuries.push(o);
              break;
            }
            case "OneWeek": {
              oneWeekInjuries.push(o);
              break;
            }
            case "TwoWeeks": {
              twoWeekInjuries.push(o);
              break;
            }
            case "FourWeeks": {
              fourWeekInjuries.push(o);
              break;
            }
            default: {
              // All other injuries are permanent, and get added as "proficiencies".
              queries.push({
                query: "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES(?,?,?,?)",
                values: [o.target_id, o.extra, "", ActivityOutcomeType.Injury],
              });
              break;
            }
          }
          break;
        }
        case ActivityOutcomeType.Death: {
          // These should be the same queries as in the `killCharacter` action.

          // Set all of their henchmen free.
          queries.push({
            query: `UPDATE characters SET henchmaster_id=0 WHERE henchmaster_id=?`,
            values: [o.target_id],
          });

          // The actual character gets deaded last, after all of its dependent data is gone.
          // We also set them free from their henchmaster.
          queries.push({
            query: `UPDATE characters SET dead=true,henchmaster_id=0 WHERE id=?`,
            values: [o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.ArmyDeath: {
          queries.push({
            query: `UPDATE troops SET count=count-? WHERE id=?`,
            values: [o.quantity, o.target_id],
          });
          break;
        }
        case ActivityOutcomeType.ArmyInjury: {
          queries.push({
            query: "INSERT INTO troop_injuries (troop_id,count,recovery_date) VALUES(?,?,?)",
            values: [o.target_id, o.quantity, o.extra],
          });
          break;
        }
        default: {
          throw new Error(`Unhandled ActivityOutcomeType: ${o.type}`);
        }
      }
    });

    // Injuries have been grouped by type.
    const dayInMillis = 60 * 60 * 24 * 1000;
    // "Bed Rest" activities start the next day after the activity ends.
    const startDate = new Date(new Date(b.activity.end_date).getTime() + dayInMillis);
    if (oneDayInjuries.length > 0) {
      const endDate = new Date(startDate.getTime() + dayInMillis);
      queries.push({
        query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
        values: [
          b.activity.user_id,
          "Injuries",
          `Minimal injuries incurred during #${b.activity.id}.  Requires one day of bed rest.`,
          dateFormat(startDate, "yyyy-mm-dd"),
          dateFormat(endDate, "yyyy-mm-dd"),
          oneDayInjuries
            .map((odi) => {
              const participant = b.activity.participants.find((p) => {
                return p.characterId === odi.target_id;
              });
              if (participant) {
                return ActivityData_ParticipantToString(participant);
              } else {
                // Should never happen, but at least we have a fallback.
                return odi.target_id;
              }
            })
            .join(","),
        ],
      });
    }
    if (oneWeekInjuries.length > 0) {
      const endDate = new Date(startDate.getTime() + dayInMillis * 7);
      queries.push({
        query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
        values: [
          b.activity.user_id,
          "Injuries",
          `Minor injuries incurred during #${b.activity.id}.  Requires one week of bed rest.`,
          dateFormat(startDate, "yyyy-mm-dd"),
          dateFormat(endDate, "yyyy-mm-dd"),
          oneWeekInjuries
            .map((owi) => {
              const participant = b.activity.participants.find((p) => {
                return p.characterId === owi.target_id;
              });
              if (participant) {
                return ActivityData_ParticipantToString(participant);
              } else {
                // Should never happen, but at least we have a fallback.
                return owi.target_id;
              }
            })
            .join(","),
        ],
      });
    }
    if (twoWeekInjuries.length > 0) {
      const endDate = new Date(startDate.getTime() + dayInMillis * 14);
      queries.push({
        query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
        values: [
          b.activity.user_id,
          "Injuries",
          `Moderate injuries incurred during #${b.activity.id}.  Requires two weeks of bed rest.`,
          dateFormat(startDate, "yyyy-mm-dd"),
          dateFormat(endDate, "yyyy-mm-dd"),
          twoWeekInjuries
            .map((twi) => {
              const participant = b.activity.participants.find((p) => {
                return p.characterId === twi.target_id;
              });
              if (participant) {
                return ActivityData_ParticipantToString(participant);
              } else {
                // Should never happen, but at least we have a fallback.
                return twi.target_id;
              }
            })
            .join(","),
        ],
      });
    }
    if (fourWeekInjuries.length > 0) {
      const endDate = new Date(startDate.getTime() + dayInMillis * 28);
      queries.push({
        query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants) VALUES (?,?,?,?,?,?)`,
        values: [
          b.activity.user_id,
          "Injuries",
          `Major injuries incurred during #${b.activity.id}.  Requires four weeks of bed rest.`,
          dateFormat(startDate, "yyyy-mm-dd"),
          dateFormat(endDate, "yyyy-mm-dd"),
          fourWeekInjuries
            .map((fwi) => {
              const participant = b.activity.participants.find((p) => {
                return p.characterId === fwi.target_id;
              });
              if (participant) {
                return ActivityData_ParticipantToString(participant);
              } else {
                // Should never happen, but at least we have a fallback.
                return fwi.target_id;
              }
            })
            .join(","),
        ],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
