import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateStructure } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateStructure;
    const results = await executeQuery<any>(
      `INSERT INTO structures (name,description,location_id,owner_id) VALUES (?,?,?,?)`,
      [b.name, b.description, b.location_id, b.owner_id]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
