import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";
import { SavingThrowType, sortedSavingThrowTypes } from "../types/characterClasses";

export const AbilityComponentSavingThrowBonusConditional: AbilityComponent = {
  id: "SavingThrowBonusConditional",
  name: "Saving Throw Bonus, Conditional",
  description: "Grants a conditional bonus (or penalty) to the specified Saving Throw(s).",
  fields: [
    {
      type: DatabaseEditingDialogField.NamedValues,
      labelTexts: ["Throw Type(s)"],
      fieldNames: ["throw_types"],
      extra: {
        prompt: "Which Saving Throws receive this bonus?",
        availableValues: sortedSavingThrowTypes.map((st) => [st, st]),
      },
    },
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

export interface AbilityComponentSavingThrowBonusConditionalData {
  throw_types: SavingThrowType[];
  /** The flat bonus granted to the character's Saving Throw(s). */
  bonus: number;
  /** Description of the conditions (or the sources) that trigger this conditional bonus. */
  condition: string;
}
