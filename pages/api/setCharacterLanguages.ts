import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetCharacterLanguages } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetCharacterLanguages;
    const results = await executeQuery<any>(`UPDATE characters SET languages=? WHERE id=?`, [
      JSON.stringify(b.languages),
      b.characterId,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
