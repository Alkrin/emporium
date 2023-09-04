import { IncomingMessage, ServerResponse } from "http";
import { executeTransaction, SQLQuery } from "../../lib/db";
import { RequestBody_UpdateProficiencies } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_UpdateProficiencies;

    const queries: SQLQuery[] = [];

    // First we clean out the old proficiency data for this character.
    queries.push({
      query: "DELETE FROM proficiencies WHERE character_id=? AND source NOT LIKE 'Selectable%'",
      values: [b.character_id],
    });

    // Then we insert all the new proficiency data.
    b.proficiencies.forEach((data) => {
      queries.push({
        query: "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES(?,?,?,?)",
        values: [data.character_id, data.feature_id, data.subtype ?? "", data.source],
      });
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
