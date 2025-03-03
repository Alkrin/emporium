import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentReactionRollBonusConditional: AbilityComponent = {
  id: "ReactionRollBonusConditional",
  name: "Reaction Roll Bonus, Conditional",
  description: "Grants a conditional bonus (or penalty) to Reaction Rolls.",
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

export interface AbilityComponentReactionRollBonusConditionalData {
  /** The flat bonus granted to the character's Reaction Rolls. */
  bonus: number;
  /** Description of the conditions (or the targets) that trigger this conditional bonus. */
  condition: string;
}
