import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_EditLocation } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditLocation;

    const queries: SQLQuery[] = [];

    // Erase type-specific data.
    queries.push({
      query: `DELETE FROM location_cities WHERE location_id=?`,
      values: [b.id],
    });
    queries.push({
      query: `DELETE FROM location_lairs WHERE location_id=?`,
      values: [b.id],
    });

    // Finally, delete the location itself.
    queries.push({
      query: `DELETE FROM locations WHERE id=?`,
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
