import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_SetCharacterLocation } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetCharacterLocation;
    const results = await executeQuery<any>(`UPDATE characters SET location_id=? WHERE id=?`, [
      b.locationId,
      b.characterId,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
