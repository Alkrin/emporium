import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteMap } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteMap;

    const queries: SQLQuery[] = [];

    // TODO: Delete all contained locations.
    // TODO: Delete all contained storages.
    // TODO: Delete all contained items.
    // TODO: Relocate all contained characters to the void.

    // Delete all associated map hexes.
    queries.push({
      query: `DELETE FROM map_hexes WHERE map_id=?`,
      values: [b.mapId],
    });

    // The actual map gets deleted last, after all of its dependent data is gone.
    queries.push({
      query: `DELETE FROM maps WHERE id=?`,
      values: [b.mapId],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
