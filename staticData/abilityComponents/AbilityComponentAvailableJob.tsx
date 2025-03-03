import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentAvailableJob: AbilityComponent = {
  id: "AvailableJob",
  name: "Available Job",
  description:
    "Grants access to a rank-based job that can earn a specific monthly wage if performed as a downtime activity.",
  fields: [
    {
      type: DatabaseEditingDialogField.ResizableArray,
      labelTexts: ["Jobs By Rank"],
      fieldNames: ["jobs"],
      extra: {
        entryDef: {
          type: DatabaseEditingDialogField.Dictionary,
          labelTexts: [""],
          fieldNames: [""],
          extra: {
            fields: [
              {
                type: DatabaseEditingDialogField.LongString,
                labelTexts: ["Job Title"],
                fieldNames: ["title"],
                fieldSizes: ["1.7vmin"],
              },
              {
                type: DatabaseEditingDialogField.Number,
                labelTexts: ["Monthly Wage", "gp"],
                fieldNames: ["wage"],
                extra: {
                  decimalDigits: 2,
                },
              },
            ],
          },
        },
      },
    },
  ],
};

export interface AvailableJobEntry {
  title: string;
  wage: number;
}

export interface AbilityComponentAvailableJobData {
  jobs: AvailableJobEntry[];
}
