import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateOrEditEquipmentSet } from "../../serverRequestTypes";
import { EquipmentSetData } from "../../serverAPI";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditEquipmentSet;

    const queries: SQLQuery[] = [];

    // The set itself.
    let q: string = `UPDATE equipment_sets SET`;
    const values = [];

    const bKeys = Object.keys(b.setData);
    const bLast = bKeys.length - 1;

    bKeys.forEach((fieldName, index) => {
      q += ` ${fieldName}=?${index !== bLast ? "," : ""}`;
      values.push(b.setData[fieldName as keyof EquipmentSetData]);
    });

    q += " WHERE id=?";
    values.push(b.setData.id);

    queries.push({
      query: q,
      values,
    });

    // Get rid of the previous item list.
    queries.push({
      query: "DELETE FROM equipment_set_items WHERE set_id=?",
      values: [b.setData.id],
    });

    // Push individual items into the set.
    b.itemData.forEach((item) => {
      queries.push({
        query: `INSERT INTO equipment_set_items (set_id,item_id,def_id,slot_name) VALUES (?,?,?,?)`,
        values: [b.setData.id, item.item_id, item.def_id, item.slot_name],
      });
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
