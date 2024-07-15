import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetXPReserve } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetXPReserve;
    const results = await executeQuery<any>(`UPDATE characters SET xp_reserve=? WHERE id=?`, [
      b.xp_reserve,
      b.characterId,
    ]);

    res.status(200).json({ newXPValue: b.xp_reserve });
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
