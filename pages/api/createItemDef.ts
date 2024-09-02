import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateItemDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateItemDef;
    const results = await executeQuery<any>(
      `INSERT INTO item_defs (name,description,stones,sixth_stones,storage_stones,storage_sixth_stones,storage_filters,has_charges,` +
        `number_per_stone,ac,damage_die,damage_dice,damage_die_2h,damage_dice_2h,range_short,range_medium,range_long,fixed_weight,` +
        `magic_bonus,conditional_magic_bonus,conditional_magic_bonus_type,max_cleaves,tags,purchase_quantity,cost,sale,spell_ids) ` +
        `VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.name,
        b.description,
        b.stones,
        b.sixth_stones,
        b.storage_stones,
        b.storage_sixth_stones,
        b.storage_filters,
        b.has_charges,
        b.number_per_stone,
        b.ac,
        b.damage_die,
        b.damage_dice,
        b.damage_die_2h,
        b.damage_dice_2h,
        b.range_short,
        b.range_medium,
        b.range_long,
        b.fixed_weight,
        b.magic_bonus,
        b.conditional_magic_bonus,
        b.conditional_magic_bonus_type,
        b.max_cleaves,
        b.tags,
        b.purchase_quantity,
        b.cost,
        b.sale,
        b.spell_ids,
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
