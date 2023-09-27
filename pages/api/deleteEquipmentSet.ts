import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteEquipmentSet } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteEquipmentSet;

    const queries: SQLQuery[] = [];

    // The set itself.
    queries.push({
      query: `DELETE FROM equipment_sets WHERE id=?`,
      values: [b.setId],
    });

    // Get rid of the previous item list.
    queries.push({
      query: "DELETE FROM equipment_set_items WHERE set_id=?",
      values: [b.setId],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
