import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateMap } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateMap;
    const results = await executeQuery<any>(`INSERT INTO maps (name,min_x,max_x,min_y,max_y) VALUES (?,?,?,?,?)`, [
      b.name,
      b.min_x,
      b.max_x,
      b.min_y,
      b.max_y,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
