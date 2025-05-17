import * as React from "react";
import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentJobCredential: AbilityComponent = {
  id: "JobCredential",
  name: "Job Credential",
  description: "Grants ranks in a job credential according to the rank of the containing ability.",
  fields: [
    {
      type: DatabaseEditingDialogField.DatabaseDef,
      labelTexts: ["Credential Type"],
      fieldNames: ["credential_id"],
      extra: {
        gameDefsName: "jobCredentials",
      },
    },
  ],
};

export interface AbilityComponentJobCredentialData {
  credential_id: number;
}
