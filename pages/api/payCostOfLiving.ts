import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_PayCostOfLiving } from "../../serverRequestTypes";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_PayCostOfLiving;

    const queries: SQLQuery[] = [];

    const thisMonth = getFirstOfThisMonthDateString();

    for (let i = 0; i < b.characters.length; ++i) {
      const c = b.characters[i];
      const gp = b.gp[i];

      queries.push({
        query: `UPDATE storage SET money=money-? WHERE name=CONCAT('Personal Pile ',CAST(? AS VARCHAR(32)))`,
        values: [gp, c.id],
      });

      queries.push({
        query: `UPDATE characters SET maintenance_date=?, maintenance_paid=? WHERE id=?`,
        values: [thisMonth, gp, c.id],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
