import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_KillOrReviveCharacter } from "../../serverRequestTypes";
import { ContractId } from "../../redux/gameDefsSlice";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_KillOrReviveCharacter;

    const queries: SQLQuery[] = [];

    // Cancel all of their contracts.
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.ArmyWageContract, b.characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND party_a_id=?`,
      values: [ContractId.StructureMaintenanceContract, b.characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.ActivityLootContract, b.characterId, b.characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.CharacterWageContract, b.characterId, b.characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.PartiedLootContract, b.characterId, b.characterId],
    });
    queries.push({
      query: `DELETE FROM contracts WHERE def_id=? AND (party_a_id=? OR party_b_id=?)`,
      values: [ContractId.UnpartiedLootContract, b.characterId, b.characterId],
    });

    // Set all of their henchmen free.
    queries.push({
      query: `UPDATE characters SET henchmaster_id=0 WHERE henchmaster_id=?`,
      values: [b.characterId],
    });

    // The actual character gets deaded last, after all of its dependent data is gone.
    // We also set them free from their henchmaster.
    queries.push({
      query: `UPDATE characters SET dead=true,henchmaster_id=0 WHERE id=?`,
      values: [b.characterId],
    });

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error B" });
  }
}
