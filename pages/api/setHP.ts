import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetHP } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetHP;
    const results = await executeQuery<any>(`UPDATE characters SET hp=? WHERE id=?`, [b.hp, b.characterId]);

    res.status(200).json({ newHPValue: b.hp });
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
