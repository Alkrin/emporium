import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteItems } from "../../serverRequestTypes";
import { generateQueriesDeleteItem } from "./generators/generateQueriesDeleteItem";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteItems;

    let queries: SQLQuery[] = [];

    b.item_ids.forEach((itemId) => {
      queries = queries.concat(generateQueriesDeleteItem(itemId));
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
