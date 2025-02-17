import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateOrEditCharacter } from "../../serverRequestTypes";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditCharacter;

    const queries: SQLQuery[] = [];
    queries.push({
      query: `UPDATE characters SET user_id=?,name=?,gender=?,portrait_url=?,class_name=?,class_id=?,subclass_id=?,level=?,strength=?,intelligence=?,wisdom=?,dexterity=?,constitution=?,charisma=?,xp=?,hp=?,hit_dice=?,location_id=?,proficiencies=? WHERE id=?`,
      values: [
        b.user_id,
        b.name,
        b.gender,
        b.portrait_url,
        b.class_name,
        b.class_id,
        b.subclass_id,
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
        b.location_id,
        b.proficiencies,
        b.id,
      ],
    });

    // First we clean out the old proficiency data for this character.
    queries.push({
      query: "DELETE FROM proficiencies WHERE character_id=? AND source LIKE 'Selectable%'",
      values: [b.id],
    });

    // Then we insert all the new proficiency data.
    b.selected_class_features.forEach(([featureName, subtype, rank], index) => {
      if (featureName !== "---") {
        // A selectable may start at a rank higher than 1, so we push one Proficiency for each rank.
        for (let i = 0; i < rank; ++i) {
          queries.push({
            query: "INSERT INTO proficiencies (character_id,feature_id,subtype,source) VALUES(?,?,?,?)",
            values: [b.id, featureName, subtype, `Selectable${index + 1}`],
          });
        }
      }
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
