import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const results = await executeQuery<any>(
      `SELECT character_id,name,subtype,source FROM proficiencies ORDER BY source ASC`,
      []
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
