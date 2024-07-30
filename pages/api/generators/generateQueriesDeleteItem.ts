import { SQLQuery } from "../../../lib/db";
import { CharacterEquipmentSlots } from "../../../serverAPI";

export function generateQueriesDeleteItem(itemId: number): SQLQuery[] {
  const queries: SQLQuery[] = [];

  // Unequip the item if it was equipped.
  // Note that this is super inefficient and generates a LOT of queries that will do nothing.
  CharacterEquipmentSlots.forEach((key) => {
    queries.push({
      query: `UPDATE characters SET ${key}=0 WHERE ${key}=?`,
      values: [itemId],
    });
  });

  // If it was a spellbook, delete the spellbook entries.
  queries.push({
    query: `DELETE FROM spellbooks WHERE spellbook_id=?`,
    values: [itemId],
  });

  // Delete the item itself.
  queries.push({
    query: `DELETE FROM items WHERE id=?`,
    values: [itemId],
  });

  return queries;
}
