import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../../../../lib/db";
import { RequestBody_CreateJob, ServerJobData } from "../types";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateJob;

    const fieldNames = Object.keys(b.datum);
    const valueSlots = fieldNames.map(() => "?");
    const values = fieldNames.map((fn) => b.datum[fn as keyof ServerJobData]);

    const results = await executeQuery<any>(
      `INSERT INTO jobs (${fieldNames.join(",")}) VALUES (${valueSlots.join(",")})`,
      values
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
