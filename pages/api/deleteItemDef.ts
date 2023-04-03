import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_DeleteItemDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteItemDef;

    let q: string = `DELETE FROM item_defs WHERE id=?`;
    const values = [b.itemDefId];

    const results = await executeQuery<any>(q, values);

    if (results.affectedRows === 1) {
      res.status(200).json(results);
    } else {
      res.status(500).json({ error: "Error A" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
