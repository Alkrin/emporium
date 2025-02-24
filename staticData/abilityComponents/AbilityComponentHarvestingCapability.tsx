import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { SearchableDef } from "../../components/database/SearchableDefList";
import { DescribedDef, DescribedDefTooltip } from "../../components/database/tooltips/DescribedDefTooltip";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentHarvestingCapability: AbilityComponent = {
  id: "HarvestingCapability",
  name: "Harvesting Capability",
  description:
    "Grants ranks towards the required ranks to unlock the ability to harvest special components from monsters " +
    "matching a particular harvesting category.",
  fields: [
    {
      type: DatabaseEditingDialogField.DatabaseDef,
      labelTexts: ["Harvesting Category"],
      fieldNames: ["category_id"],
      extra: {
        gameDefsName: "harvestingCategories",
        renderTooltip: (def: SearchableDef) => <DescribedDefTooltip def={def as DescribedDef} />,
      },
    },
  ],
};

export interface AbilityComponentHarvestingCapabilityData {
  /** The id of the HarvestingCategory associated with this component. */
  category_id: number;
}
