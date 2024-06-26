import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteSingleEntry } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteSingleEntry;

    const queries: SQLQuery[] = [];

    // The activity itself.
    queries.push({
      query: `DELETE FROM activities WHERE id=?`,
      values: [b.id],
    });

    // Get rid of all outcomes recorded for this activity.
    queries.push({
      query: "DELETE FROM activity_outcomes WHERE activity_id=?",
      values: [b.id],
    });

    // Expected Outcomes too.
    queries.push({
      query: "DELETE FROM expected_outcomes WHERE activity_id=?",
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
