import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteTroopDef, updateTroopDef } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { TroopDefData } from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";

interface ReactProps {}

interface InjectedProps {
  allTroopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseTroopsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Troop Database"}
        allDefs={this.props.allTroopDefs}
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
        labelTexts: ["AC"],
        fieldNames: ["ac"],
        fieldSizes: ["5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Exploration Move", "'"],
        fieldNames: ["move"],
        fieldSizes: ["5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Morale"],
        fieldNames: ["morale"],
        fieldSizes: ["5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Individual BR"],
        fieldNames: ["individual_br"],
        fieldSizes: ["5vmin"],
        extra: {
          decimalDigits: 3,
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Platoon BR"],
        fieldNames: ["platoon_br"],
        fieldSizes: ["5vmin"],
        extra: {
          decimalDigits: 3,
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Platoon Size"],
        fieldNames: ["platoon_size"],
        fieldSizes: ["5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Wage", "GP"],
        fieldNames: ["wage"],
        fieldSizes: ["7vmin"],
        extra: {
          decimalDigits: 2,
        },
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as TroopDefData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createTroopDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateTroopDef(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editTroopDef(data);

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
        this.props.dispatch?.(updateTroopDef(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteTroopDef(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteTroopDef(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allTroopDefs = state.gameDefs.troops;
  return {
    ...props,
    allTroopDefs,
  };
}

export const DatabaseTroopsDialog = connect(mapStateToProps)(ADatabaseTroopsDialog);
