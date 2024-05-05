import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_SetHenchmaster } from "../../serverRequestTypes";
import { ContractId } from "../../redux/gameDefsSlice";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_SetHenchmaster;

    const queries: SQLQuery[] = [];

    queries.push({
      query: `SELECT @prevMasterId := (SELECT henchmaster_id FROM characters WHERE id=?)`,
      values: [b.minionCharacterId],
    });

    queries.push({
      query: `UPDATE characters SET henchmaster_id=? WHERE id=?`,
      values: [b.masterCharacterId, b.minionCharacterId],
    });

    if (b.masterCharacterId === 0) {
      // If we are setting henchmaster_id to zero, we are unsetting hench status and need to cancel their Contracts.
      // Clean up any CharacterWage contract.
      queries.push({
        query: `DELETE FROM contracts WHERE party_a_id=@prevMasterId AND party_b_id=? AND def_id=?`,
        values: [b.minionCharacterId, ContractId.CharacterWageContract],
      });
      // Clean up any PartiedLoot contract.
      queries.push({
        query: `DELETE FROM contracts WHERE party_a_id=@prevMasterId AND party_b_id=? AND def_id=?`,
        values: [b.minionCharacterId, ContractId.PartiedLootContract],
      });
      // Clean up any UnpartiedLoot contract.
      queries.push({
        query: `DELETE FROM contracts WHERE party_a_id=@prevMasterId AND party_b_id=? AND def_id=?`,
        values: [b.minionCharacterId, ContractId.UnpartiedLootContract],
      });
    } else {
      // If we are setting a non-zero henchmaster_id, we are setting hench status and need to generate or update Contracts.
      queries.push({
        query: `SELECT @masterPersonalPileId := (SELECT id FROM storage WHERE name=CONCAT('Personal Pile ',CAST(? AS VARCHAR(32))))`,
        values: [b.masterCharacterId],
      });
      queries.push({
        query: `SELECT @minionPersonalPileId := (SELECT id FROM storage WHERE name=CONCAT('Personal Pile ',CAST(? AS VARCHAR(32))))`,
        values: [b.minionCharacterId],
      });

      // Generate a CharacterWage contract.
      queries.push({
        query: `INSERT INTO contracts (def_id,party_a_id,party_b_id,target_a_id,target_b_id,value,exercise_date) VALUES (?,?,?,@masterPersonalPileId,@minionPersonalPileId,?,?)`,
        values: [ContractId.CharacterWageContract, b.masterCharacterId, b.minionCharacterId, 0, ""],
      });
      // Generate a PartiedLoot contract.
      queries.push({
        query: `INSERT INTO contracts (def_id,party_a_id,party_b_id,target_a_id,target_b_id,value,exercise_date) VALUES (?,?,?,?,?,?,?)`,
        values: [ContractId.PartiedLootContract, b.masterCharacterId, b.minionCharacterId, 0, 0, b.percentLoot, ""],
      });
      // Generate an UnpartiedLoot contract. (default of 50% loot goes to the henchmaster)
      queries.push({
        query: `INSERT INTO contracts (def_id,party_a_id,party_b_id,target_a_id,target_b_id,value,exercise_date) VALUES (?,?,?,@masterPersonalPileId,?,?,?)`,
        values: [ContractId.UnpartiedLootContract, b.masterCharacterId, b.minionCharacterId, 0, 50, ""],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
