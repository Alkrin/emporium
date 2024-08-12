import { SQLQuery } from "../../../lib/db";
import { ServerItemData } from "../../../serverAPI";

export function generateQueriesEditItem(item: ServerItemData): SQLQuery[] {
  const queries: SQLQuery[] = [];

  let q: string = `UPDATE items SET`;
  const values = [];

  const bKeys = Object.keys(item);
  const bLast = bKeys.length - 1;

  bKeys.forEach((fieldName, index) => {
    q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
    values.push(item[fieldName as keyof ServerItemData]);
  });

  q += " WHERE id=?";
  values.push(item.id);

  queries.push({ query: q, values });

  return queries;
}
