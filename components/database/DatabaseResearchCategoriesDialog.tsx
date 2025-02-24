import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { deleteResearchCategory, updateResearchCategory } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { ResearchCategoryData } from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";
import { CharacterStat } from "../../staticData/types/characterClasses";

interface ReactProps {}

interface InjectedProps {
  allResearchCategories: Record<number, ResearchCategoryData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseResearchCategoriesDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Research Categories Database"}
        allDefs={this.props.allResearchCategories}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(): DatabaseEditingDialogFieldDef[] {
    // ID and Name are handled automatically, so we don't have to include them here.

    const statOptions: [string, string][] = [["---", "---"]];
    statOptions.push(
      ...Object.values(CharacterStat)
        .sort()
        .map((wc) => {
          const entry: [string, string] = [wc, wc];
          return entry;
        })
    );

    return [
      { type: DatabaseEditingDialogField.LongString, labelTexts: ["Description"], fieldNames: ["description"] },
      {
        type: DatabaseEditingDialogField.NumberArray,
        labelTexts: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14"],
        fieldNames: ["rates_by_level"],
        fieldSizes: ["4vmin"],
        defaults: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        extra: {
          headerText: "Research Rate By Level (gp/day)",
          decimalDigits: 0,
          arraySize: 14,
        },
      },
      {
        type: DatabaseEditingDialogField.NumberArray,
        labelTexts: ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14"],
        fieldNames: ["rolls_by_level"],
        fieldSizes: ["2vmin"],
        defaults: [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
        extra: {
          headerText: "Roll Target By Level",
          decimalDigits: 0,
          arraySize: 14,
        },
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as ResearchCategoryData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createResearchCategory(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateResearchCategory(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editResearchCategory(data);

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
        this.props.dispatch?.(updateResearchCategory(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteResearchCategory(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteResearchCategory(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allResearchCategories = state.gameDefs.researchCategories;
  return {
    ...props,
    allResearchCategories,
  };
}

export const DatabaseResearchCategoriesDialog = connect(mapStateToProps)(ADatabaseResearchCategoriesDialog);
