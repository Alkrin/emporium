import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_AddToSpellbook } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_AddToSpellbook;
    const results = await executeQuery<any>(`INSERT INTO spellbooks (spellbook_id,spell_id) VALUES (?,?)`, [
      b.spellbook_id,
      b.spell_id,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
