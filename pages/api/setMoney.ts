import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetMoney } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetMoney;
    const results = await executeQuery<any>(`UPDATE characters SET money=? WHERE id=?`, [b.gp, b.characterId]);

    res.status(200).json({ newMoneyValue: b.gp });
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
