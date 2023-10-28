import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_AddOrRemoveInjury } from "../../serverRequestTypes";
import { ProficiencySource } from "../../staticData/types/abilitiesAndProficiencies";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_AddOrRemoveInjury;

    const results = await executeQuery<any>(
      "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES (?,?,?,?)",
      [b.characterId, b.injuryId, "", ProficiencySource.Injury]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
