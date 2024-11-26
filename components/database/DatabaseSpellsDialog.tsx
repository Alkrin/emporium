import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteSpellDef, updateSpellDef } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, {
  SpellDefData,
  SpellDefData_StringToTypeLevels,
  SpellDefData_TypeLevelsToString,
} from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import {
  Database_StringArrayToString,
  Database_StringToStringArray,
  DatabaseEditingDialogField,
  DatabaseEditingDialogFieldDef,
} from "./databaseEditingDialog/databaseUtils";

interface ReactProps {}

interface InjectedProps {
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseSpellsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Spell Database"}
        allDefs={this.props.allSpellDefs}
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
        type: DatabaseEditingDialogField.String,
        labelTexts: ["Range"],
        fieldNames: ["spell_range"],
      },
      {
        type: DatabaseEditingDialogField.String,
        labelTexts: ["Duration"],
        fieldNames: ["duration"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ['Type/Levels (e.g. "Arcane:1")'],
        fieldNames: ["type_levels"],
        convertFromString: SpellDefData_StringToTypeLevels,
        convertLocalDataToEditableString: SpellDefData_TypeLevelsToString,
        fieldSizes: ["3vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Table Image"],
        fieldNames: ["table_image"],
        fieldSizes: ["1.5vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Tags"],
        fieldNames: ["tags"],
        convertFromString: Database_StringToStringArray,
        convertLocalDataToEditableString: Database_StringArrayToString,
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as SpellDefData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createSpellDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateSpellDef(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editSpellDef(data);

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
        this.props.dispatch?.(updateSpellDef(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteSpellDef(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteSpellDef(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    allSpellDefs,
  };
}

export const DatabaseSpellsDialog = connect(mapStateToProps)(ADatabaseSpellsDialog);
