import { IncomingMessage, ServerResponse } from "http";
import { SQLQuery, executeTransaction } from "../../lib/db";
import { RequestBody_ExerciseContract } from "../../serverRequestTypes";
import { ContractId } from "../../redux/gameDefsSlice";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";

export default async function handler(req: IncomingMessage & any, res: ServerResponse & any): Promise<void> {
  try {
    const b = req.body as RequestBody_ExerciseContract;

    const queries: SQLQuery[] = [];

    const thisMonth = getFirstOfThisMonthDateString();

    for (let i = 0; i < b.contracts.length; ++i) {
      const c = b.contracts[i];
      const gp = b.gp[i];

      switch (c.def_id) {
        case ContractId.ArmyWageContract: {
          // Remove money from source Storage.
          queries.push({
            query: `UPDATE storage SET money=money-? WHERE id=?`,
            values: [gp, c.target_a_id],
          });
          // Update the army's maintenance_date.
          queries.push({
            query: `UPDATE armies SET maintenance_date=? WHERE id=?`,
            values: [thisMonth, c.party_b_id],
          });
          break;
        }
        case ContractId.CharacterWageContract: {
          // Remove money from source Storage.
          queries.push({
            query: `UPDATE storage SET money=money-? WHERE id=?`,
            values: [gp, c.target_a_id],
          });
          // Add money to destination Storage.
          queries.push({
            query: `UPDATE storage SET money=money+? WHERE id=?`,
            values: [gp, c.target_b_id],
          });
          // Note that the actual paying of Cost Of Living is not part of any contract.
          // A CharacterWage contract is only responsible for making sure enough money to do so is available.
          break;
        }
        case ContractId.StructureMaintenanceContract: {
          // Remove money from source Storage.
          queries.push({
            query: `UPDATE storage SET money=money-? WHERE id=?`,
            values: [gp, c.target_a_id],
          });
          // Update the structure's maintenance_date.
          queries.push({
            query: `UPDATE structures SET maintenance_date=? WHERE id=?`,
            values: [thisMonth, c.party_b_id],
          });
          break;
        }
        default: {
          // For unhandled contracts, just give up and move on.
          continue;
        }
      }

      // For handled contracts, update their exercise_date.
      queries.push({
        query: `UPDATE contracts SET exercise_date=? WHERE id=?`,
        values: [thisMonth, c.id],
      });
    }

    const results = await executeTransaction<any>(queries);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Error A" });
  }
}
