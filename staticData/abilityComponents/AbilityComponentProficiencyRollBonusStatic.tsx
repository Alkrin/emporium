import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";
import { SearchableDef } from "../../components/database/SearchableDefList";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";

export const AbilityComponentProficiencyRollBonusStatic: AbilityComponent = {
  id: "ProficiencyRollBonusStatic",
  name: "Proficiency Roll Bonus, Static",
  description: "Grants a fixed bonus (or penalty) to a single Proficiency Roll.",
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
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Roll Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentProficiencyRollBonusStaticData {
  proficiency_roll_id: number;
  /** The flat bonus granted to the character's Proficiency Rolls. */
  bonus: number;
}
