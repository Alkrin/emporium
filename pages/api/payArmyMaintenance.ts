import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_PayArmyMaintenance } from "../../serverRequestTypes";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_PayArmyMaintenance;

    const queries: SQLQuery[] = [];

    // Remove the money from storage.
    queries.push({
      query: `UPDATE storage SET money=money-? WHERE id=?`,
      values: [b.gp, b.storageId],
    });

    // Give credit for maintenance paid by updating the date to this month.
    const thisMonth = getFirstOfThisMonthDateString();
    queries.push({
      query: `UPDATE armies SET maintenance_date=? WHERE id=?`,
      values: [thisMonth, b.armyId],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
