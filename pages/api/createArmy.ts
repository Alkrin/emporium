import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateArmy } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateArmy;
    const results = await executeQuery<any>(`INSERT INTO armies (name,location_id,user_id) VALUES (?,?,?)`, [
      b.name,
      b.location_id,
      b.user_id,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
