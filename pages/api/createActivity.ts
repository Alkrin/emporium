import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateActivity } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateActivity;

    const fieldNames = Object.keys(b).filter((fn) => !["expectedOutcomes"].includes(fn));
    const valueSlots = fieldNames.map(() => "?");
    const values = fieldNames.map((fn) => b[fn as keyof RequestBody_CreateActivity]);

    const queries: SQLQuery[] = [];

    queries.push({
      query: `INSERT INTO activities (${fieldNames.join(",")}) VALUES (${valueSlots.join(",")})`,
      values,
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
