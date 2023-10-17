import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_ResolveActivity } from "../../serverRequestTypes";
import { ActivityOutcomeType } from "../../serverAPI";
import dateFormat from "dateformat";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_ResolveActivity;
    b.outcomes.sort((oa, ob) => {
      // Have to do resets before applying other things.
      if (oa.type !== ob.type) {
        if (oa.type === ActivityOutcomeType.CXPDeductibleReset) {
          return -1;
        } else if (ob.type === ActivityOutcomeType.CXPDeductibleReset) {
          return 1;
        }
      }
      return 0;
    });

    const queries: SQLQuery[] = [];

    // Update the activity with resolution text.
    queries.push({
      query: `UPDATE activities SET resolution_text=? WHERE id=?`,
      values: [b.resolution_text, b.activity_id],
    });

    // Create the Outcome records.
    b.outcomes.forEach((o) => {
      queries.push({
        query: `INSERT INTO activity_outcomes (activity_id,type,target_id,quantity) VALUES (?,?,?,?)`,
        values: [o.activity_id, o.type, o.target_id, o.quantity],
      });
    });

    // Apply the Outcomes.
    b.outcomes.forEach((o) => {
      switch (o.type) {
        case ActivityOutcomeType.Gold: {
          // Increment player gold.
          queries.push({
            query: `UPDATE characters SET money=money+? WHERE id=?`,
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
        default: {
          throw new Error(`Unhandled ActivityOutcomeType: ${o.type}`);
        }
      }
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
