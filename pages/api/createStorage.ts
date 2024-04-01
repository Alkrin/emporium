import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateStorage } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateStorage;
    const results = await executeQuery<any>(
      `INSERT INTO storage (name,capacity,location_id,owner_id,money) VALUES (?,?,?,?,?)`,
      [b.name, b.capacity, b.location_id, b.owner_id, b.money]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
