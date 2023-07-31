import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_AddToRepertoire } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_AddToRepertoire;
    const results = await executeQuery<any>(
      `INSERT INTO repertoires (character_id,spell_id,spell_type,spell_level) VALUES (?,?,?,?)`,
      [b.character_id, b.spell_id, b.spell_type, b.spell_level]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
