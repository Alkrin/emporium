import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { SearchableDef } from "../../components/database/SearchableDefList";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentResearchCapability: AbilityComponent = {
  id: "ResearchCapability",
  name: "Research Capability",
  description:
    "Grants the ability to perform research rolls in a single research category, at the standard " +
    "roll targets and research rates for that category.",
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
  ],
};

export interface AbilityComponentResearchCapabilityData {
  /** The id of the ResearchCategory associated with this component. */
  category: number;
}
