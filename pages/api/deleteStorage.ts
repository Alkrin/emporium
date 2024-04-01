import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteStorage } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteStorage;

    const queries: SQLQuery[] = [];

    // Delete the storage's items.
    if (b.item_ids.length > 0) {
      const questionMarks = b.item_ids
        .map(() => {
          return "?";
        })
        .join(",");

      // Delete any spellbooks from the passed itemIds.
      queries.push({
        query: `DELETE FROM spellbooks WHERE spellbook_id IN (${questionMarks})`,
        values: b.item_ids,
      });

      // Delete the items themselves.
      queries.push({
        query: `DELETE FROM items WHERE id IN (${questionMarks})`,
        values: b.item_ids,
      });
    }

    // Finally, delete the storage itself.
    queries.push({
      query: `DELETE FROM storage WHERE id=?`,
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
