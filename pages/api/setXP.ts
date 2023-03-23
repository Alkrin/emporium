import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetXP } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetXP;
    const results = await executeQuery<any>(`UPDATE characters SET xp=? WHERE id=?`, [b.xp, b.characterId]);

    res.status(200).json({ newXPValue: b.xp });
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
