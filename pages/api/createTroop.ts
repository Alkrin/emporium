import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateTroop } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateTroop;
    const results = await executeQuery<any>(`INSERT INTO troops (army_id,def_id,count) VALUES (?,?,?)`, [
      b.army_id,
      b.def_id,
      b.count,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
