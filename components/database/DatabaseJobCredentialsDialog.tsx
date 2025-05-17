import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { deleteJobCredential, updateJobCredential } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";
import { ServerAPIJobCredentials } from "../../pages/api/tables/job_credentials/functions";
import { JobCredentialData } from "../../pages/api/tables/job_credentials/types";

interface ReactProps {}

interface InjectedProps {
  data: Record<number, JobCredentialData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseJobCredentialsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Job Credentials Database"}
        allDefs={this.props.data}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(): DatabaseEditingDialogFieldDef[] {
    // ID and Name are handled automatically, so we don't have to include them here.
    return [];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as JobCredentialData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPIJobCredentials.create(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateJobCredential(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPIJobCredentials.edit(data);

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
        this.props.dispatch?.(updateJobCredential(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPIJobCredentials.delete(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteJobCredential(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    data: state.gameDefs.jobCredentials,
  };
}

export const DatabaseJobCredentialsDialog = connect(mapStateToProps)(ADatabaseJobCredentialsDialog);
