import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentMeleeDamageByLevel: AbilityComponent = {
  id: "MeleeDamageByLevel",
  name: "Melee Damage Bonus, by Level",
  description: "Grants bonus damage to melee attacks based on the level of the character.",
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

export interface AbilityComponentMeleeDamageByLevelData {
  /** Bonus to damage granted at each level.  Zero-th index is level one. */
  damage_by_level: number[];
}
