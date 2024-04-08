import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteSingleEntry } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteSingleEntry;

    const queries: SQLQuery[] = [];

    // Delete any associated StructureComponents.
    queries.push({
      query: `DELETE FROM structure_components WHERE structure_id=?`,
      values: [b.id],
    });

    // Finally, delete the structure itself.
    queries.push({
      query: `DELETE FROM structures WHERE id=?`,
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
