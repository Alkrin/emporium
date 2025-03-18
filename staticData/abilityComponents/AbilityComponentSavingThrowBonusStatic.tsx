import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";
import { SavingThrowType, sortedSavingThrowTypes } from "../types/characterClasses";

export const AbilityComponentSavingThrowBonusStatic: AbilityComponent = {
  id: "SavingThrowBonusStatic",
  name: "Saving Throw Bonus, Static",
  description: "Grants a fixed bonus (or penalty) to the specified Saving Throw(s).",
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
  ],
};

export interface AbilityComponentSavingThrowBonusStaticData {
  throw_types: SavingThrowType[];
  /** The flat bonus granted to the character's Saving Throw(s). */
  bonus: number;
}
