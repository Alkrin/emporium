import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { SearchableDef } from "../../components/database/SearchableDefList";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentProficiencyRollBonusConditional: AbilityComponent = {
  id: "ProficiencyRollBonusConditional",
  name: "Proficiency Roll Bonus, Conditional",
  description: "Grants a conditional bonus (or penalty) to a single Proficiency Roll.",
  fields: [
    {
      type: DatabaseEditingDialogField.DatabaseDef,
      labelTexts: ["Roll Type"],
      fieldNames: ["proficiency_roll_id"],
      extra: {
        gameDefsName: "proficiencyRolls",
        renderTooltip: (def: SearchableDef) => <DescribedDefTooltip def={def as DescribedDef} />,
      },
    },
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

export interface AbilityComponentProficiencyRollBonusConditionalData {
  proficiency_roll_id: number;
  /** The flat bonus granted to the character's Proficiency Rolls. */
  bonus_by_rank: number[];
  /** Description of the conditions (or the targets) that trigger this conditional bonus. */
  condition: string;
}
