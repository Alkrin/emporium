import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateOrEditCharacter } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditCharacter;
    const results = await executeQuery<any>(
      `UPDATE characters SET user_id=?,name=?,gender=?,portrait_url=?,class_name=?,level=?,strength=?,intelligence=?,wisdom=?,dexterity=?,constitution=?,charisma=?,xp=?,hp=?,hit_dice=? WHERE id=?`,
      [
        b.user_id,
        b.name,
        b.gender,
        b.portrait_url,
        b.class_name,
        b.level,
        b.strength,
        b.intelligence,
        b.wisdom,
        b.dexterity,
        b.constitution,
        b.charisma,
        b.xp,
        b.hp,
        b.hit_dice,
        b.id,
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
