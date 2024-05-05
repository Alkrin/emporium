import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateContract } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateContract;
    const results = await executeQuery<any>(
      `INSERT INTO contracts (def_id,party_a_id,party_b_id,target_a_id,target_b_id,value,exercise_date) VALUES (?,?,?,?,?,?,?)`,
      [b.def_id, b.party_a_id, b.party_b_id, b.target_a_id, b.target_b_id, b.value, b.exercise_date]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
