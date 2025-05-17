import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentTroopStrategyBonus: AbilityComponent = {
  id: "TroopStrategyBonusStatic",
  name: "Troop Strategy Bonus, Static",
  description: "Grants a fixed bonus to Strategic Ability when commanding troops in battle.",
  fields: [
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["bonus_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [99, 99, 99, 99, 99, 99],
      extra: {
        headerText: "Strategic Ability Bonus By Rank",
        decimalDigits: 0,
        arraySize: 6,
      },
    },
  ],
};

export interface AbilityComponentTroopStrategyBonusData {
  /** The rank-based bonus granted to the character's Strategic Ability. */
  bonus_by_rank: number[];
}
