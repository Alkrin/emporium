import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { SearchableDef } from "../../components/database/SearchableDefList";
import { AbilityComponent } from "./abilityComponent";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";

export const AbilityComponentResearchBonusesOrEffectiveLevel: AbilityComponent = {
  id: "ResearchBonusesOrEffectiveLevel",
  name: "Research Bonuses or Effective Level",
  description:
    "Based on the total active count of this component, grants either an effective level in the specified research category, " +
    "or else a bonus to research rolls and research rate if a higher effective level is gained from a different source.",
  fields: [
    {
      type: DatabaseEditingDialogField.DatabaseDef,
      labelTexts: ["Research Category"],
      fieldNames: ["category"],
      extra: {
        gameDefsName: "researchCategories",
        renderTooltip: (def: SearchableDef) => <DescribedDefTooltip def={def as DescribedDef} />,
      },
    },
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["level_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [1, 1, 1, 1, 1, 1],
      extra: {
        headerText: "Effective Level By Rank",
        decimalDigits: 0,
        arraySize: 6,
      },
    },
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["bonus_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [0, 0, 0, 0, 0, 0],
      extra: {
        headerText: "Roll Bonus By Rank",
        decimalDigits: 0,
        arraySize: 6,
      },
    },
    {
      type: DatabaseEditingDialogField.NumberArray,
      labelTexts: ["R1", "R2", "R3", "R4", "R5", "R6"],
      fieldNames: ["multiplier_by_rank"],
      fieldSizes: ["2vmin"],
      defaults: [0, 0, 0, 0, 0, 0],
      extra: {
        headerText: "Rate Bonus By Rank (Percent)",
        decimalDigits: 0,
        arraySize: 6,
      },
    },
  ],
};

export interface AbilityComponentResearchBonusesOrEffectiveLevelData {
  /** The id of the associated ResearchCategory. */
  category: number;
  level_by_rank: number[];
  bonus_by_rank: number[];
  multiplier_by_rank: number[];
}
