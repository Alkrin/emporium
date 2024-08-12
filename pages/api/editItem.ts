import { IncomingMessage, ServerResponse } from "http";
import { RequestBody_EditItem } from "../../serverRequestTypes";
import { generateQueriesEditItem } from "./generators/generateQueriesEditItem";
import { executeTransaction, SQLQuery } from "../../lib/db";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_EditItem;

    let queries: SQLQuery[] = [];

    queries = queries.concat(generateQueriesEditItem(b.item));

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
