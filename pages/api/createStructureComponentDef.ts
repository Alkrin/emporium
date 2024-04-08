import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateStructureComponentDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateStructureComponentDef;
    const results = await executeQuery<any>(
      `INSERT INTO structure_component_defs (name,description,cost) VALUES (?,?,?)`,
      [b.name, b.description, b.cost]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
