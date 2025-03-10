import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteProficiencyRoll, updateProficiencyRoll } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { ProficiencyRollData } from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";
import { CharacterStat } from "../../staticData/types/characterClasses";

interface ReactProps {}

interface InjectedProps {
  allProficiencyRolls: Dictionary<ProficiencyRollData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseProficiencyRollsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Proficiency Rolls Database"}
        allDefs={this.props.allProficiencyRolls}
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
        type: DatabaseEditingDialogField.NamedValue,
        labelTexts: ["Optional Stat Modifier"],
        fieldNames: ["stat"],
        defaults: [""],
        extra: {
          prompt:
            "If a stat is selected, this proficiency roll will gain a bonus equal to the stat's bonus times the bonus multiplier.",
          availableValues: statOptions,
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Stat Bonus Multiplier"],
        fieldNames: ["bonus_multiplier"],
        fieldSizes: ["2vmin"],
        defaults: [1],
        extra: {
          decimalDigits: 0,
        },
      },
    ];
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as ProficiencyRollData;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createProficiencyRoll(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateProficiencyRoll(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editProficiencyRoll(data);

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
        this.props.dispatch?.(updateProficiencyRoll(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteProficiencyRoll(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteProficiencyRoll(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allProficiencyRolls = state.gameDefs.proficiencyRolls;
  return {
    ...props,
    allProficiencyRolls,
  };
}

export const DatabaseProficiencyRollsDialog = connect(mapStateToProps)(ADatabaseProficiencyRollsDialog);
