import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_EditItemDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditItemDef;

    let q: string = `UPDATE item_defs SET`;
    const values = [];

    const bKeys = Object.keys(b);
    const bLast = bKeys.length - 1;

    Object.keys(b).forEach((fieldName, index) => {
      q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
      values.push(b[fieldName as keyof RequestBody_EditItemDef]);
    });

    q += " WHERE id=?";
    values.push(b.id);

    const results = await executeQuery<any>(q, values);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
