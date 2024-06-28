import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateActivity } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateActivity;

    const queries: SQLQuery[] = [];

    queries.push({
      query: `INSERT INTO activities (user_id,name,description,start_date,end_date,participants,army_participants,lead_from_behind_id) VALUES (?,?,?,?,?,?,?,?)`,
      values: [
        b.user_id,
        b.name,
        b.description,
        b.start_date,
        b.end_date,
        b.participants,
        b.army_participants,
        b.lead_from_behind_id,
      ],
    });

    queries.push({
      query: `SELECT @id:=LAST_INSERT_ID();`,
      values: [],
    });

    b.expectedOutcomes.forEach((eo) => {
      queries.push({
        query: `INSERT INTO expected_outcomes (activity_id,type,data) VALUES (@id,?,?)`,
        values: [eo.type, eo.data],
      });
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
