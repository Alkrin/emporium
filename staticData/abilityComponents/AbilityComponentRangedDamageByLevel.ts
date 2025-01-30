import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentRangedDamageByLevel: AbilityComponent = {
  id: "RangedDamageByLevel",
  name: "Ranged Damage Bonus, by Level",
  description: "Grants bonus damage to ranged attacks based on the level of the character.",
  fields: [
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14"],
      fieldNames: ["damage_by_level"],
      fieldSizes: ["2vmin"],
      extra: {
        headerText: "Damage Bonus by Level",
        decimalDigits: 0,
        arraySize: 14,
      },
    },
  ],
};
