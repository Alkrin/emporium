import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateOrEditEquipmentSet } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditEquipmentSet;

    const queries: SQLQuery[] = [];

    // The set itself.
    queries.push({
      query: `INSERT INTO equipment_sets (name,class_name,class_id) VALUES (?,?,?)`,
      values: [b.setData.name, b.setData.class_name, b.setData.class_id],
    });

    queries.push({
      query: `SELECT @id:=LAST_INSERT_ID();`,
      values: [],
    });

    // Individual items in the set.
    b.itemData.forEach((item) => {
      queries.push({
        query: `INSERT INTO equipment_set_items (set_id,item_id,def_id,slot_name) VALUES (@id,?,?,?)`,
        values: [item.item_id, item.def_id, item.slot_name],
      });
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
