import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateOrEditCharacter } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditCharacter;

    const queries: SQLQuery[] = [];

    // Create the new character.
    queries.push({
      query: `INSERT INTO characters (user_id,name,gender,portrait_url,class_name,level,strength,intelligence,wisdom,dexterity,constitution,charisma,xp,hp,hit_dice) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      values: [
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
      ],
    });
    queries.push({
      query: `SELECT @id:=LAST_INSERT_ID();`,
      values: [],
    });

    b.selected_class_features.forEach(([featureName, subtype, rank], index) => {
      if (featureName !== "---") {
        // A selectable may start at a rank higher than 1, so we push one Proficiency for each rank.
        for (let i = 0; i < rank; ++i) {
          queries.push({
            query: "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES(@id,?,?,?)",
            values: [featureName, subtype, `Selectable${index + 1}`],
          });
        }
      }
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
