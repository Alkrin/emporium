import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_AddOrRemoveInjury } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_AddOrRemoveInjury;

    const results = await executeQuery<any>("DELETE FROM proficiencies WHERE character_id=? AND feature_id=?", [
      b.characterId,
      b.injuryId,
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
