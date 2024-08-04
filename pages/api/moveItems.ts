import { IncomingMessage, ServerResponse } from "http";
import { executeTransaction, SQLQuery } from "../../lib/db";
import { RequestBody_MoveItems } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const { moves } = req.body as RequestBody_MoveItems;

    const queries: SQLQuery[] = [];

    moves.forEach((move) => {
      if (move.srcCharacterId && move.srcEquipmentSlot) {
        // If the item was on a character, remove it.
        queries.push({
          query: `UPDATE characters SET ${move.srcEquipmentSlot}=? WHERE id=?`,
          values: [0, move.srcCharacterId],
        });
      } else {
        if (move.srcSplit) {
          // If we are splitting a single item out of a bundle, reduce its count by one.
          queries.push({
            query: "UPDATE items SET count=count-1 WHERE id=?",
            values: [move.itemId],
          });
        } else {
          // If the item was in a Storage or Container, remove it.
          queries.push({
            query: "UPDATE items SET container_id=?,storage_id=? WHERE id=?",
            values: [0, 0, move.itemId],
          });
        }
      }

      if (move.destCharacterId && move.destEquipmentSlot) {
        // Equip on a character.
        if (move.srcSplit) {
          // We are equipping a single item from a bundle, so we need to generate a new bundle containing that single item...
          queries.push({
            query:
              `INSERT INTO items (def_id,count,container_id,storage_id,notes,is_for_sale,owner_ids,is_unused,spell_ids) ` +
              `SELECT def_id,1,0,0,notes,is_for_sale,owner_ids,0,spell_ids FROM items WHERE id=?`,
            values: [move.itemId],
          });
          // ...and then equip the new item.
          queries.push({
            query: `UPDATE characters SET ${move.destEquipmentSlot}=LAST_INSERT_ID() WHERE id=?`,
            values: [move.destCharacterId],
          });
        } else {
          // Standard move of a single item.
          queries.push({
            query: `UPDATE characters SET ${move.destEquipmentSlot}=? WHERE id=?`,
            values: [move.itemId, move.destCharacterId],
          });
          queries.push({
            query: `UPDATE items SET is_unused=? WHERE id=?`,
            values: [0, move.itemId],
          });
        }
      } else if (move.destContainerId) {
        // Assign to a container.
        queries.push({
          query: "UPDATE items SET container_id=?,storage_id=? WHERE id=?",
          values: [move.destContainerId, 0, move.itemId],
        });
      } else if (move.destStorageId) {
        // Assign to a storage.
        queries.push({
          query: "UPDATE items SET container_id=?,storage_id=? WHERE id=?",
          values: [0, move.destStorageId, move.itemId],
        });
      }
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
