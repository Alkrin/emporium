import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentTroopMoraleBonusStatic: AbilityComponent = {
  id: "TroopMoraleBonusStatic",
  name: "Troop Morale Bonus, Static",
  description: "Grants a fixed bonus to Unit Morale rolls when leading troops in battle.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Unit Morale Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentTroopMoraleBonusStaticData {
  /** The flat bonus granted to the Unit Morale rolls of troops lead by the character. */
  bonus: number;
}
