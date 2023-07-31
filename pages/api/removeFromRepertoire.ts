import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_RemoveFromRepertoire } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_RemoveFromRepertoire;

    let q: string = `DELETE FROM repertoires WHERE id=?`;
    const values = [b.entry_id];

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
