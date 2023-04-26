import { IncomingMessage, ServerResponse } from "http";
import { executeTransaction, SQLQuery } from "../../lib/db";
import { RequestBody_SplitBundleItems } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const { srcItemId, destContainerId, destStorageId, count, itemDefId } = req.body as RequestBody_SplitBundleItems;

    const queries: SQLQuery[] = [];

    // Remove items from the src.
    queries.push({
      query: `UPDATE items SET count=count-? WHERE id=?`,
      values: [count, srcItemId],
    });
    // Place the items into a brand new bundle.
    queries.push({
      query: `INSERT INTO items (def_id,count,container_id,storage_id) VALUES (?,?,?,?)`,
      values: [itemDefId, count, destContainerId, destStorageId],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
