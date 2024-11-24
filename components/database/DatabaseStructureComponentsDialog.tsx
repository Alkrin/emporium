import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteStructureComponentDef, updateStructureComponentDef } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { StructureComponentDefData } from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";

interface ReactProps {}

interface InjectedProps {
  allStructureComponentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseStructureComponentsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Structure Component Database"}
        allDefs={this.props.allStructureComponentDefs}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(): DatabaseEditingDialogFieldDef[] {
    // ID and Name are handled automatically, so we don't have to include them here.
    return [
      { type: DatabaseEditingDialogField.LongString, labelTexts: ["Description"], fieldNames: ["description"] },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Cost", "GP"],
        fieldNames: ["cost"],
        fieldSizes: ["10vmin"],
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as StructureComponentDefData;

    if (data.id === 0) {
      // Brand new structureComponentDef.
      const res = await ServerAPI.createStructureComponentDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateStructureComponentDef(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old structureComponentDef.
      const res = await ServerAPI.editStructureComponentDef(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditStructureComponentDefFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Changes were not saved.  Please try again."} />,
          })
        );
        return data.id;
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateStructureComponentDef(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteStructureComponentDef(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteStructureComponentDef(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allStructureComponentDefs = state.gameDefs.structureComponents;
  return {
    ...props,
    allStructureComponentDefs,
  };
}

export const DatabaseStructureComponentsDialog = connect(mapStateToProps)(ADatabaseStructureComponentsDialog);
