import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentLanguageCapacityBonus: AbilityComponent = {
  id: "LanguageCapacityBonus",
  name: "Language, Capacity Bonus",
  description: "Grants a rank-based bonus to the maximum number of languages that this character can learn.",
  fields: [
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["bonus_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [3, 6, 9, 12, 15, 18],
      extra: {
        headerText: "Bonus Languages By Rank",
        decimalDigits: 0,
        arraySize: 6,
      },
    },
  ],
};

export interface AbilityComponentLanguageCapacityBonusData {
  /** The rank-based bonus granted to the character's max language count. */
  bonus_by_rank: number[];
}
