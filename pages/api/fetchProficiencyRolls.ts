import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const results = await executeQuery<any>(`SELECT * FROM proficiency_rolls`, []);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
