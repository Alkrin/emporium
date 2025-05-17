import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";
import { AbilityComponent } from "./abilityComponent";
import { SearchableDef } from "../../components/database/SearchableDefList";

export const AbilityComponentProficiencyRollMultiTarget: AbilityComponent = {
  id: "ProficiencyRollMultiTarget",
  name: "Proficiency Roll, Multi Target",
  description:
    "Grants access to an ability with multiple roll targets whose outcomes are based on a d20 roll and either the character's level or " +
    "the rank of the proficiency containing this component.  Other abilities may provide bonuses or penalties " +
    "to the final target values.",
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
      type: DatabaseEditingDialogField.ResizableArray,
      labelTexts: ["Targets"],
      fieldNames: ["targets"],
      extra: {
        entryDef: {
          type: DatabaseEditingDialogField.Dictionary,
          labelTexts: [""],
          fieldNames: [""],
          extra: {
            fields: [
              {
                type: DatabaseEditingDialogField.LongString,
                labelTexts: ["Name"],
                fieldNames: ["name"],
                fieldSizes: ["1.7vmin"],
              },
              {
                type: DatabaseEditingDialogField.NumberArray,
                labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
                fieldNames: ["target_by_rank"],
                fieldSizes: ["2vmin"],
                defaults: [99, 99, 99, 99, 99, 99],
                extra: {
                  headerText: "Target By Rank",
                  decimalDigits: 0,
                  arraySize: 6,
                },
              },
              {
                type: DatabaseEditingDialogField.NumberArray,
                labelTexts: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14"],
                fieldNames: ["target_by_level"],
                fieldSizes: ["2vmin"],
                defaults: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
                extra: {
                  headerText: "Target By Level",
                  decimalDigits: 0,
                  arraySize: 14,
                },
              },
            ],
          },
        },
      },
    },
  ],
};

export interface AbilityComponentProficiencyRollMultiTargetData {
  proficiency_roll_id: number;
  targets: { name: string; target_by_rank: number[]; target_by_level: number[] }[];
}
