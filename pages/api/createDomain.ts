import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateDomain } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateDomain;

    const fieldNames = Object.keys(b);
    const valueSlots = fieldNames.map(() => "?");
    const values = fieldNames.map((fn) => b[fn as keyof RequestBody_CreateDomain]);

    const results = await executeQuery<any>(
      `INSERT INTO domains (${fieldNames.join(",")}) VALUES (${valueSlots.join(",")})`,
      values
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
