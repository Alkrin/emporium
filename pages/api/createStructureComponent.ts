import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateStructureComponent } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateStructureComponent;
    const results = await executeQuery<any>(
      `INSERT INTO structure_components (structure_id,component_id,quantity) VALUES (?,?,?)`,
      [b.structure_id, b.component_id, b.quantity]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
