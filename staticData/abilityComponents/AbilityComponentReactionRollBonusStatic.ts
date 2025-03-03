import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentReactionRollBonusStatic: AbilityComponent = {
  id: "ReactionRollBonusStatic",
  name: "Reaction Roll Bonus, Static",
  description: "Grants a fixed bonus (or penalty) to Reaction Rolls.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Roll Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentReactionRollBonusStaticData {
  /** The flat bonus granted to the character's Reaction Rolls. */
  bonus: number;
}
