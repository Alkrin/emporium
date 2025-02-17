import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentArmorStatic: AbilityComponent = {
  id: "ArmorStatic",
  name: "Armor, Static",
  description: "Grants a fixed bonus to AC.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["AC Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentArmorStaticData {
  /** The flat bonus granted to the character's AC. */
  bonus: number;
}
