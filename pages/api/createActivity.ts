import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateActivity } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateActivity;
    const results = await executeQuery<any>(
      `INSERT INTO activities (user_id,name,description,start_date,end_date,participants,army_participants,lead_from_behind_id) VALUES (?,?,?,?,?,?,?,?)`,
      [
        b.user_id,
        b.name,
        b.description,
        b.start_date,
        b.end_date,
        b.participants,
        b.army_participants,
        b.lead_from_behind_id,
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
