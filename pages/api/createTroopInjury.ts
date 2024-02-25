import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateTroopInjury } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateTroopInjury;
    const results = await executeQuery<any>(
      `INSERT INTO troop_injuries (troop_id,count,recovery_date) VALUES (?,?,?)`,
      [b.troop_id, b.count, b.recovery_date]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
