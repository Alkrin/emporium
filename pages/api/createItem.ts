import { IncomingMessage, ServerResponse } from "http";
import { executeTransaction, SQLQuery } from "../../lib/db";
import { RequestBody_CreateItem } from "../../serverRequestTypes";
import { generateQueriesCreateItem } from "./generators/generateQueriesCreateItem";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateItem;

    let queries: SQLQuery[] = [];

    queries = queries.concat(generateQueriesCreateItem(b.item));

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
