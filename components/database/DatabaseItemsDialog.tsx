import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteItemDef, updateItemDef } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { ItemDefData } from "../../serverAPI";
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
  allItemDefs: Dictionary<ItemDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseItemsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Item Database"}
        allDefs={this.props.allItemDefs}
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
        type: DatabaseEditingDialogField.Numbers,
        labelTexts: ["Size", "\xa0and", "\xa0/ 6 stone"],
        fieldNames: ["stones", "sixth_stones"],
        fieldSizes: ["3vmin", "2vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["\xa0\xa0\xa0\xa0or Number per Stone"],
        fieldNames: ["number_per_stone"],
        fieldSizes: ["3.5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Purchase Price", "GP"],
        fieldNames: ["cost"],
        fieldSizes: ["10vmin"],
        extra: {
          decimalDigits: 2,
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Sale Price", "GP"],
        fieldNames: ["sale"],
        fieldSizes: ["10vmin"],
        extra: {
          decimalDigits: 2,
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Purchase Quantity"],
        fieldNames: ["purchase_quantity"],
        fieldSizes: ["5vmin"],
        defaults: [1],
      },
      {
        type: DatabaseEditingDialogField.Boolean,
        labelTexts: ["Has Charges?"],
        fieldNames: ["has_charges"],
      },
      {
        type: DatabaseEditingDialogField.Spells,
        labelTexts: ["Associated Spells"],
        fieldNames: ["spell_ids"],
      },
      {
        type: DatabaseEditingDialogField.Numbers,
        labelTexts: ["Storage", "and", " / 6 stone"],
        fieldNames: ["storage_stones", "storage_sixth_stones"],
        fieldSizes: ["3vmin", "2vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Storage Filters (comma separated)"],
        fieldNames: ["storage_filters"],
        convertFromString: Database_StringToStringArray,
        convertLocalDataToEditableString: Database_StringArrayToString,
        fieldSizes: ["3.5vmin"],
      },
      {
        type: DatabaseEditingDialogField.Boolean,
        labelTexts: ["Stored Items Are Weightless?"],
        fieldNames: ["fixed_weight"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Armor Class"],
        fieldNames: ["ac"],
        fieldSizes: ["3vmin"],
      },
      {
        type: DatabaseEditingDialogField.Numbers,
        labelTexts: ["1h Damage", "\xa0d"],
        fieldNames: ["damage_dice", "damage_die"],
        fieldSizes: ["3vmin", "2vmin"],
      },
      {
        type: DatabaseEditingDialogField.Numbers,
        labelTexts: ["2h Damage", "\xa0d"],
        fieldNames: ["damage_dice_2h", "damage_die_2h"],
        fieldSizes: ["3vmin", "2vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Short Range", "'"],
        fieldNames: ["range_short"],
        fieldSizes: ["4vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Medium Range", "'"],
        fieldNames: ["range_medium"],
        fieldSizes: ["4vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Long Range", "'"],
        fieldNames: ["range_long"],
        fieldSizes: ["4vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Max Cleaves"],
        fieldNames: ["max_cleaves"],
        fieldSizes: ["3vmin"],
        defaults: [99],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Magical Bonus +"],
        fieldNames: ["magic_bonus"],
        fieldSizes: ["3vmin"],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Conditional Magical Bonus +"],
        fieldNames: ["conditional_magic_bonus"],
        fieldSizes: ["3vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Condition (e.g. Undead, Evil, etc.)"],
        fieldNames: ["conditional_magic_bonus_type"],
        fieldSizes: ["1.5vmin"],
      },
      {
        type: DatabaseEditingDialogField.LongString,
        labelTexts: ["Tags"],
        fieldNames: ["tags"],
        convertFromString: Database_StringToStringArray,
        convertLocalDataToEditableString: Database_StringArrayToString,
        fieldSizes: ["5vmin"],
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as ItemDefData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createItemDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateItemDef(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editItemDef(data);

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
        this.props.dispatch?.(updateItemDef(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteItemDef(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteItemDef(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allItemDefs = state.gameDefs.items;
  return {
    ...props,
    allItemDefs,
  };
}

export const DatabaseItemsDialog = connect(mapStateToProps)(ADatabaseItemsDialog);
