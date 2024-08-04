import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateItem } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateItem;
    const results = await executeQuery<any>(
      `INSERT INTO items (def_id,count,container_id,storage_id,notes,is_for_sale,owner_ids,is_unused,spell_ids) VALUES (?,?,?,?,?,?,?,?,?)`,
      [b.def_id, b.count, b.container_id, b.storage_id, b.notes, b.is_for_sale, b.owner_ids, b.is_unused, b.spell_ids]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
