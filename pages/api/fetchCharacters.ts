import { IncomingMessage, ServerResponse } from "http";
import executeQuery from "../../lib/db";

export default async function handler(
  req: IncomingMessage & any,
  res: ServerResponse & any
): Promise<void> {
  try {
    // TODO: We might want to fetch only a subset of characters if we wanted to block players
    //       from access to data that they shouldn't have.
    const results = await executeQuery<any>(`SELECT * FROM characters`, []);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
