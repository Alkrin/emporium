import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateTroopDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateTroopDef;
    const results = await executeQuery<any>(
      `INSERT INTO troop_defs (name,description,ac,move,morale,individual_br,platoon_br,platoon_size,wage,army_level) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        b.name,
        b.description,
        b.ac,
        b.move,
        b.morale,
        b.individual_br,
        b.platoon_br,
        b.platoon_size,
        b.wage,
        b.army_level,
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
