import { IncomingMessage, ServerResponse } from "http";
import { executeQuery } from "../../lib/db";
import { RequestBody_CreateCharacter } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateCharacter;
    const results = await executeQuery<any>(
      `INSERT INTO characters (user_id,name,gender,portrait_url,class_name,level,strength,intelligence,wisdom,dexterity,constitution,charisma,xp,hp,hit_dice) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
      ]
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
