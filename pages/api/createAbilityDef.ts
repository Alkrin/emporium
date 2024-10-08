import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateAbilityDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateAbilityDef;
    const results = await executeQuery<any>(
      `INSERT INTO ability_defs (name,max_ranks,descriptions,subtypes,components) VALUES (?,?,?,?,?)`,
      [b.name, b.max_ranks, b.descriptions, b.subtypes, b.components]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
