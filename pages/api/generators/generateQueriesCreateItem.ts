import { SQLQuery } from "../../../lib/db";
import { ServerItemData } from "../../../serverAPI";

export function generateQueriesCreateItem(item: ServerItemData): SQLQuery[] {
  const queries: SQLQuery[] = [];

  queries.push({
    query: `INSERT INTO items (def_id,count,container_id,storage_id,notes,is_for_sale,owner_ids,is_unused,spell_ids) VALUES (?,?,?,?,?,?,?,?,?)`,
    values: [
      item.def_id,
      item.count,
      item.container_id,
      item.storage_id,
      item.notes,
      item.is_for_sale,
      item.owner_ids,
      item.is_unused,
      item.spell_ids,
    ],
  });

  return queries;
}
