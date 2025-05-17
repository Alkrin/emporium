import { IncomingMessage, ServerResponse } from "http";
import { RequestBody_EditJobCredential, ServerJobCredentialData } from "../types";
import { executeQuery } from "../../../../../lib/db";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditJobCredential;

    let q: string = `UPDATE job_credentials SET`;
    const values = [];

    const bKeys = Object.keys(b.datum);
    const bLast = bKeys.length - 1;

    bKeys.forEach((fieldName, index) => {
      q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
      values.push(b.datum[fieldName as keyof ServerJobCredentialData]);
    });

    q += " WHERE id=?";
    values.push(b.datum.id);

    const results = await executeQuery<any>(q, values);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
