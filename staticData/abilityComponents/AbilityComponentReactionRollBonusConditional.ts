import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentReactionRollBonusConditional: AbilityComponent = {
  id: "ReactionRollBonusConditional",
  name: "Reaction Roll Bonus, Conditional",
  description: "Grants a conditional bonus (or penalty) to Reaction Rolls.",
  fields: [
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["bonus_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [99, 99, 99, 99, 99, 99],
      extra: {
        headerText: "Bonus By Rank",
        decimalDigits: 0,
        arraySize: 6,
      },
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
  bonus_by_rank: number[];
  /** Description of the conditions (or the targets) that trigger this conditional bonus. */
  condition: string;
}
