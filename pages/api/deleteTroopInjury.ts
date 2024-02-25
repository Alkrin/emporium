import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_DeleteSingleEntry } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteSingleEntry;

    let q: string = `DELETE FROM troop_injuries WHERE id=?`;
    const values = [b.id];

    const results = await executeQuery<any>(q, values);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
