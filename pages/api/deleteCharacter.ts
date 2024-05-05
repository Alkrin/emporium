import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_DeleteCharacter } from "../../serverRequestTypes";
import { ContractId } from "../../redux/gameDefsSlice";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_DeleteCharacter;

    const queries: SQLQuery[] = [];

    // Delete all assigned proficiencies.
    queries.push({
      query: `DELETE FROM proficiencies WHERE character_id=?`,
      values: [b.id],
    });

    // Delete the character's items.
    if (b.item_ids.length > 0) {
      const questionMarks = b.item_ids
        .map(() => {
          return "?";
        })
        .join(",");

      // Delete any spellbooks from the passed itemIds.
      queries.push({
        query: `DELETE FROM spellbooks WHERE spellbook_id IN (${questionMarks})`,
        values: b.item_ids,
      });

      // Delete the items themselves.
      queries.push({
        query: `DELETE FROM items WHERE id IN (${questionMarks})`,
        values: b.item_ids,
      });
    }

    // Delete all storages, including the Personal Pile.
    queries.push({
      query: `DELETE FROM storage WHERE owner_id=?`,
      values: [b.id],
    });

    // Delete all spell repertoires.
    queries.push({
      query: `DELETE FROM repertoires WHERE character_id=?`,
      values: [b.id],
    });

    // Set all of their henchmen free.
    queries.push({
      query: `UPDATE characters SET henchmaster_id=0 WHERE henchmaster_id=?`,
      values: [b.id],
    });

    // Contracts.
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.ArmyWageContract, b.id],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.StructureMaintenanceContract, b.id],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.ActivityLootContract, b.id, b.id],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.CharacterWageContract, b.id, b.id],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.PartiedLootContract, b.id, b.id],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.UnpartiedLootContract, b.id, b.id],
    });

    // The actual character gets deleted last, after all of its dependent data is gone.
    queries.push({
      query: `DELETE FROM characters WHERE id=?`,
      values: [b.id],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
