import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentInitiativeBonusStatic: AbilityComponent = {
  id: "InitiativeBonusStatic",
  name: "Initiative Bonus, Static",
  description: "Grants a fixed bonus (or penalty) to Initiative rolls.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Roll Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentInitiativeBonusStaticData {
  /** The flat bonus granted to the character's Reaction Rolls. */
  bonus: number;
}
