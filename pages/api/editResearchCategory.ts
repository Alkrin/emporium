import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_EditResearchCategory } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditResearchCategory;

    let q: string = `UPDATE research_categories SET`;
    const values = [];

    const bKeys = Object.keys(b);
    const bLast = bKeys.length - 1;

    Object.keys(b).forEach((fieldName, index) => {
      q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
      values.push(b[fieldName as keyof RequestBody_EditResearchCategory]);
    });

    q += " WHERE id=?";
    values.push(b.id);

    const results = await executeQuery<any>(q, values);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
