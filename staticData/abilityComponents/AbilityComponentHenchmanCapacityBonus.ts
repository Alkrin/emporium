import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentHenchmanCapacityBonus: AbilityComponent = {
  id: "HenchmanCapacityBonus",
  name: "Henchman Capacity Bonus",
  description: "Grants a fixed bonus to the maximum number of henchmen this character can have.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Max Henchmen Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentHenchmanCapacityBonusData {
  /** The flat bonus granted to the character's maximum number of henchmen. */
  bonus: number;
}
