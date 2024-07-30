import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateItemDef } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateItemDef;
    const results = await executeQuery<any>(
      `INSERT INTO item_defs (name,description,stones,sixth_stones,storage_stones,storage_sixth_stones,storage_filters,bundleable,` +
        `number_per_stone,ac,damage_die,damage_dice,damage_die_2h,damage_dice_2h,range_increment,fixed_weight,magic_bonus,conditional_magic_bonus,` +
        `conditional_magic_bonus_type,max_cleaves,tags,purchase_quantity,cost_gp,cost_sp,cost_cp,sale_gp,sale_sp,sale_cp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.name,
        b.description,
        b.stones,
        b.sixth_stones,
        b.storage_stones,
        b.storage_sixth_stones,
        b.storage_filters,
        b.bundleable,
        b.number_per_stone,
        b.ac,
        b.damage_die,
        b.damage_dice,
        b.damage_die_2h,
        b.damage_dice_2h,
        b.range_increment,
        b.fixed_weight,
        b.magic_bonus,
        b.conditional_magic_bonus,
        b.conditional_magic_bonus_type,
        b.max_cleaves,
        b.tags,
        b.purchase_quantity,
        b.cost_gp,
        b.cost_sp,
        b.cost_cp,
        b.sale_gp,
        b.sale_sp,
        b.sale_cp,
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
