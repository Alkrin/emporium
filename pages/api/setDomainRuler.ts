import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetDomainRuler } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetDomainRuler;
    const results = await executeQuery<any>(`UPDATE domains SET ruler_character_id=? WHERE id=?`, [
      b.characterId,
      b.domainId,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
