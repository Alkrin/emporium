import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentInitiativeBonusConditional: AbilityComponent = {
  id: "InitiativeBonusConditional",
  name: "Initiative Bonus, Conditional",
  description: "Grants a conditional bonus (or penalty) to Initiative rolls.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Roll Bonus"],
      fieldNames: ["bonus"],
    },
    {
      type: DatabaseEditingDialogField.LongString,
      labelTexts: ["Condition"],
      fieldNames: ["condition"],
    },
  ],
};

export interface AbilityComponentInitiativeBonusConditionalData {
  /** The flat bonus granted to the character's Initiative rolls. */
  bonus: number;
  /** Description of the conditions (or the targets) that trigger this conditional bonus. */
  condition: string;
}
