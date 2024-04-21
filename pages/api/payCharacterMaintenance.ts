import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_PayCharacterMaintenance } from "../../serverRequestTypes";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_PayCharacterMaintenance;

    const queries: SQLQuery[] = [];

    // Remove the money from storage.
    queries.push({
      query: `UPDATE storage SET money=money-? WHERE id=?`,
      values: [b.gp, b.storageId],
    });

    // Give credit for maintenance paid, and update the date to this month if necessary.
    const thisMonth = getFirstOfThisMonthDateString();
    queries.push({
      query: `UPDATE characters SET maintenance_paid=?,maintenance_date=? WHERE id=? AND maintenance_date!=?`,
      values: [b.gp, thisMonth, b.characterId, thisMonth],
    });
    queries.push({
      query: `UPDATE characters SET maintenance_paid=maintenance_paid+? WHERE id=? AND maintenance_date=?`,
      values: [b.gp, b.characterId, thisMonth],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
