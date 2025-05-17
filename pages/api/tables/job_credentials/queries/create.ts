import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../../../../lib/db";
import { RequestBody_CreateJobCredential, ServerJobCredentialData } from "../types";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateJobCredential;

    const fieldNames = Object.keys(b.datum);
    const valueSlots = fieldNames.map(() => "?");
    const values = fieldNames.map((fn) => b.datum[fn as keyof ServerJobCredentialData]);

    const results = await executeQuery<any>(
      `INSERT INTO job_credentials (${fieldNames.join(",")}) VALUES (${valueSlots.join(",")})`,
      values
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
