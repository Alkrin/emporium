import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { ProficiencyRollDefTooltip } from "../../components/database/tooltips/ProficiencyRollDefTooltip";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentProficiencyRoll: AbilityComponent = {
  id: "ProficiencyRoll",
  name: "Proficiency Roll",
  description:
    "Grants access to an ability whose outcomes are based on a d20 roll and the rank of the proficiency containing " +
    "this component.  Default target is 11+ at first rank, reduced by 4 per additional rank to a minimum of 3+.  " +
    "Other abilities may further reduce this target.",
  fields: [
    {
      type: DatabaseEditingDialogField.DatabaseDef,
      labelTexts: ["Roll Type"],
      fieldNames: ["proficiency_roll_id"],
      extra: {
        gameDefsName: "proficiencyRolls",
        renderTooltip: (defId: number) => <ProficiencyRollDefTooltip defId={defId} />,
      },
    },
  ],
};
