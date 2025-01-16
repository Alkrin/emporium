import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_CreateOrEditCharacter, RequestField_StartingEquipmentData } from "../../serverRequestTypes";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { getCostOfLivingForCharacterLevel } from "../../lib/characterUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_CreateOrEditCharacter;

    const queries: SQLQuery[] = [];

    // Create the new character.
    queries.push({
      query: `INSERT INTO characters (user_id,name,gender,portrait_url,class_name,class_id,subclass_id,level,strength,intelligence,wisdom,dexterity,constitution,charisma,xp,hp,hit_dice,location_id,maintenance_date,maintenance_paid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
        // A fresh character starts out marked as "maintenance fully paid for this month", since you should have paid that amount to hire them.
        getFirstOfThisMonthDateString(),
        getCostOfLivingForCharacterLevel(b.level),
      ],
    });
    queries.push({
      query: `SELECT @id:=LAST_INSERT_ID();`,
      values: [],
    });

    // When creating a character, we also set up their Personal Pile storage.
    queries.push({
      query:
        "INSERT INTO storage (name,capacity,location_id,owner_id,group_ids,money) VALUES(CONCAT('Personal Pile ',CAST(@id AS VARCHAR(32))),?,?,@id,?,?)",
      values: [999999999, 0, "", 0],
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

    if (b.equipment) {
      const rootItems = b.equipment.filter((item) => {
        return !item.slot_name.startsWith("Container");
      });
      const containedItems = b.equipment.filter((item) => {
        return item.slot_name.startsWith("Container");
      });

      if (rootItems.length > 0) {
        // Depth-first traversal of containers.
        const generateItem = (item: RequestField_StartingEquipmentData, depth: number): void => {
          // Insert the item into the `items` table.
          if (depth === 0) {
            // Root item.  We add it to the character a little later.
            queries.push({
              query: `INSERT INTO items (def_id,count,container_id,storage_id) VALUES(?,?,0,0)`,
              values: [item.def_id, item.count],
            });
          } else {
            // Contained item.  Gets added to the container created in the previous loop of this recursion.
            queries.push({
              query: `INSERT INTO items (def_id,count,container_id,storage_id) VALUES(?,?,@id${depth - 1},0)`,
              values: [item.def_id, item.count],
            });
          }

          // Grab the id of the newly generated item record.
          queries.push({
            query: `SELECT @id${depth}:=LAST_INSERT_ID();`,
            values: [],
          });

          if (depth === 0) {
            // Root items equip directly to the character.
            queries.push({
              query: `UPDATE characters SET ${item.slot_name}=@id${depth} WHERE id=@id`,
              values: [],
            });
          }

          // Create any items contained in this item.
          // Note that this item_id is a temporary one for matching containers to contents,
          // not the actual id of the db record for the item.
          const containerSlotName = `Container${item.item_id}`;
          containedItems.forEach((containedItem) => {
            if (containedItem.slot_name === containerSlotName) {
              generateItem(containedItem, depth + 1);
            }
          });
        };

        rootItems.forEach((rootItem) => {
          generateItem(rootItem, 0);
        });
      }
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
