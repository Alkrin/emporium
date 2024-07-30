import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_SellItem } from "../../serverRequestTypes";
import { generateQueriesDeleteItem } from "./generators/generateQueriesDeleteItem";
import { generateQueriesResolveActivity } from "./generators/generateQueriesResolveActivity";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SellItem;

    let queries: SQLQuery[] = [];

    // Give money and XP to the appropriate recipients.
    if (b.activity.participants.length > 0) {
      // If there are any living owners, give them their shares via activity resolution.
      queries = queries.concat(generateQueriesResolveActivity(b.activity, [b.outcome], b.resolution));
    } else {
      // If there are no living owners, the loot goes straight into the active storage.
      queries.push({ query: `UPDATE storage SET money=money+? WHERE id=?`, values: [b.gpGained, b.storageId] });
    }

    if (b.sellCount >= b.item.count) {
      // Sold them all, so delete the item.
      queries = queries.concat(generateQueriesDeleteItem(b.item.id));
    } else {
      // Only sold some, so reduce the count of the item.
      queries.push({
        query: `UPDATE items SET count=count-? WHERE id=?`,
        values: [b.sellCount, b.item.id],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
