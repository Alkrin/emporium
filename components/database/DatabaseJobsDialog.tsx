import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { deleteJob, updateJob } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";
import { JobData } from "../../pages/api/tables/jobs/types";
import { ServerAPIJob } from "../../pages/api/tables/jobs/functions";

interface ReactProps {}

interface InjectedProps {
  data: Record<number, JobData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseJobsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Jobs Database"}
        allDefs={this.props.data}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(): DatabaseEditingDialogFieldDef[] {
    // ID and Name are handled automatically, so we don't have to include them here.
    return [
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Monthly Wage", "gp"],
        fieldNames: ["wage"],
        fieldSizes: ["5vmin"],
        defaults: [1],
        extra: {
          decimalDigits: 2,
        },
      },
      {
        type: DatabaseEditingDialogField.Boolean,
        labelTexts: ["Has Subtypes"],
        fieldNames: ["has_subtypes"],
        defaults: [false],
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Required Credentials"],
        fieldNames: ["credentials"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.Dictionary,
            labelTexts: [""],
            fieldNames: [""],
            extra: {
              fields: [
                {
                  type: DatabaseEditingDialogField.DatabaseDef,
                  labelTexts: ["Credential"],
                  fieldNames: ["credential_id"],
                  extra: {
                    gameDefsName: "jobCredentials",
                  },
                },
                {
                  type: DatabaseEditingDialogField.String,
                  labelTexts: ["Subtype", "(blank if any)"],
                  fieldNames: ["subtype"],
                  fieldSizes: ["10vmin"],
                },
                {
                  type: DatabaseEditingDialogField.Number,
                  labelTexts: ["Required Ranks"],
                  fieldNames: ["ranks"],
                  fieldSizes: ["5vmin"],
                  defaults: [1],
                },
              ],
            },
          },
        },
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Alternate Credentials"],
        fieldNames: ["alternate_credentials"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.ResizableArray,
            labelTexts: [""],
            fieldNames: [""],
            extra: {
              entryDef: {
                type: DatabaseEditingDialogField.Dictionary,
                labelTexts: [""],
                fieldNames: [""],
                extra: {
                  fields: [
                    {
                      type: DatabaseEditingDialogField.DatabaseDef,
                      labelTexts: ["Credential"],
                      fieldNames: ["credential_id"],
                      extra: {
                        gameDefsName: "jobCredentials",
                      },
                    },
                    {
                      type: DatabaseEditingDialogField.String,
                      labelTexts: ["Subtype", "(blank if any)"],
                      fieldNames: ["subtype"],
                      fieldSizes: ["10vmin"],
                    },
                    {
                      type: DatabaseEditingDialogField.Number,
                      labelTexts: ["Required Ranks"],
                      fieldNames: ["ranks"],
                      fieldSizes: ["5vmin"],
                      defaults: [1],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as JobData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPIJob.create(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateJob(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPIJob.edit(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditDefFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Changes were not saved.  Please try again."} />,
          })
        );
        return data.id;
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateJob(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPIJob.delete(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteJob(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    data: state.gameDefs.jobs,
  };
}

export const DatabaseJobsDialog = connect(mapStateToProps)(ADatabaseJobsDialog);
