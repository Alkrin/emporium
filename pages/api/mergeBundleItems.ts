import { IncomingMessage, ServerResponse } from "http";
import { executeTransaction, SQLQuery } from "../../lib/db";
import { RequestBody_MergeBundleItems } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const { srcItemId, destItemId, count, srcCharacterId, srcEquipmentSlot } = req.body as RequestBody_MergeBundleItems;

    const queries: SQLQuery[] = [];

    // Remove items from the src.
    queries.push({
      query: `UPDATE items SET count=count-? WHERE id=?`,
      values: [count, srcItemId],
    });
    // Add items to the dest.
    queries.push({
      query: `UPDATE items SET count=count+? WHERE id=?`,
      values: [count, destItemId],
    });
    // If src is empty, destroy it.
    queries.push({
      query: `DELETE FROM items WHERE id=? AND count<1`,
      values: [srcItemId],
    });
    // If the src was an equipped item, de-equip it.
    if (srcCharacterId && srcEquipmentSlot) {
      queries.push({
        query: `UPDATE characters SET ${srcEquipmentSlot}=0 WHERE id=?`,
        values: [srcCharacterId],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
