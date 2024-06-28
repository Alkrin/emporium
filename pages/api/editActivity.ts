import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_EditActivity } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditActivity;

    const queries: SQLQuery[] = [];

    let q: string = `UPDATE activities SET`;
    const values = [];

    // Exclude the "extra" fields that aren't directly part of the Activity record.
    const bKeys = Object.keys(b).filter((k) => !["expectedOutcomes"].includes(k));
    const bLast = bKeys.length - 1;

    bKeys.forEach((fieldName, index) => {
      q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
      values.push(b[fieldName as keyof RequestBody_EditActivity]);
    });

    q += " WHERE id=?";
    values.push(b.id);

    queries.push({
      query: q,
      values,
    });

    // Get rid of old expectations.
    queries.push({
      query: "DELETE FROM expected_outcomes WHERE activity_id=?",
      values: [b.id],
    });
    // Affirm new expectations.
    b.expectedOutcomes.forEach((eo) => {
      queries.push({
        query: `INSERT INTO expected_outcomes (activity_id,type,data) VALUES (?,?,?)`,
        values: [eo.activity_id, eo.type, eo.data],
      });
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
