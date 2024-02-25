import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteArmy } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteArmy;

    const queries: SQLQuery[] = [];

    b.troop_ids.forEach((tid) => {
      // Injuries for the troops.
      queries.push({
        query: `DELETE FROM troop_injuries WHERE troop_id=?`,
        values: [tid],
      });

      // The troops.
      queries.push({
        query: `DELETE FROM troops WHERE id=?`,
        values: [tid],
      });
    });

    // The army itself.
    queries.push({
      query: `DELETE FROM armies WHERE id=?`,
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
