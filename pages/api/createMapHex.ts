import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateMapHex } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateMapHex;
    const results = await executeQuery<any>(
      `INSERT INTO map_hexes (map_id,x,y,type,rivers,roads) VALUES (?,?,?,?,?,?)`,
      [b.map_id, b.x, b.y, b.type, b.rivers, b.roads]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
