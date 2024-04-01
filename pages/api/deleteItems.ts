import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteItems } from "../../serverRequestTypes";
import { EquipmentSlotTag } from "../../lib/tags";
import { CharacterEquipmentSlots } from "../../serverAPI";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteItems;

    const queries: SQLQuery[] = [];

    // Delete anything contained in the item.
    if (b.item_ids.length > 0) {
      const questionMarks = b.item_ids
        .map(() => {
          return "?";
        })
        .join(",");

      // Unequip the item if it was equipped.
      // Note that this is super inefficient.
      b.item_ids.forEach((itemId) => {
        CharacterEquipmentSlots.forEach((key) => {
          queries.push({
            query: `UPDATE characters SET ${key}=0 WHERE ${key}=${itemId}`,
            values: b.item_ids,
          });
        });
      });

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

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
