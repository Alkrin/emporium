import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateSpellDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateSpellDef;
    const results = await executeQuery<any>(
      `INSERT INTO spell_defs (name,description,spell_range,duration,tags,type_levels,table_image) VALUES (?,?,?,?,?,?,?)`,
      [b.name, b.description, b.spell_range, b.duration, b.tags, b.type_levels, b.table_image]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
