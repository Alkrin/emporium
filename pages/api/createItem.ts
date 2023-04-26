import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateItem } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateItem;
    const results = await executeQuery<any>(
      `INSERT INTO items (def_id,count,container_id,storage_id) VALUES (?,?,?,?)`,
      [b.def_id, b.count, b.container_id, b.storage_id]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
