import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteAbilityDef, updateAbilityDef } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { AbilityDefData, AbilityType } from "../../serverAPI";
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
  allAbilityDefs: Dictionary<AbilityDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseAbilitiesDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Ability Database"}
        allDefs={this.props.allAbilityDefs}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(data: Partial<AbilityDefData>): DatabaseEditingDialogFieldDef[] {
    // Until data is initialized, we assume there is only a single input field.
    const maxRanks = data.max_ranks ?? 1;
    const descriptionLabelTexts = Array(maxRanks)
      .fill("")
      .map((_, index) => `Description, Rank ${index + 1}`);

    // ID and Name are handled automatically, so we don't have to include them here.
    return [
      {
        type: DatabaseEditingDialogField.NamedValue,
        labelTexts: ["Type?"],
        fieldNames: ["type"],
        defaults: [AbilityType.Other],
        extra: {
          prompt: "Select Ability Type",
          availableValues: Object.values(AbilityType).map((cs) => [cs, cs]),
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Max Ranks"],
        fieldNames: ["max_ranks"],
        defaults: [1],
        fieldSizes: ["4vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongStringArray,
        labelTexts: descriptionLabelTexts,
        fieldNames: ["descriptions"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Subtypes"],
        fieldNames: ["subtypes"],
        convertFromString: Database_StringToStringArray,
        convertLocalDataToEditableString: Database_StringArrayToString,
      },
      {
        type: DatabaseEditingDialogField.Boolean,
        labelTexts: ["Allows Custom Subtypes?"],
        fieldNames: ["custom_subtypes"],
        defaults: [false],
      },
      {
        type: DatabaseEditingDialogField.AbilityComponents,
        labelTexts: ["Components"],
        fieldNames: ["components"],
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as AbilityDefData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createAbilityDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateAbilityDef(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editAbilityDef(data);

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
        this.props.dispatch?.(updateAbilityDef(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteAbilityDef(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteAbilityDef(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allAbilityDefs = state.gameDefs.abilities;
  return {
    ...props,
    allAbilityDefs,
  };
}

export const DatabaseAbilitiesDialog = connect(mapStateToProps)(ADatabaseAbilitiesDialog);
