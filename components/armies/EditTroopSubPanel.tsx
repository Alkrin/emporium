import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { TroopData, TroopDefData } from "../../serverAPI";
import styles from "./EditTroopSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { deleteTroop, updateTroop } from "../../redux/armiesSlice";

interface State {
  count: number;
  isSaving: boolean;
}

interface ReactProps {
  troop: TroopData;
}

interface InjectedProps {
  troopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditTroopSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      count: props.troop.count,
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;

    const troopDef = this.props.troopDefs[this.props.troop.def_id];

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{`Editing Troop #${this.props.troop.id}`}</div>
        <div className={styles.contentRow}>
          <div className={styles.infoPanel}>
            <div className={styles.troopLabel}>{troopDef.name}</div>
            <div className={styles.gearContainer}>
              <div className={styles.gearLabel}>{troopDef.description}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Platoon BR:"}</div>
              <div className={styles.infoValue}>{troopDef.platoon_br}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Platoon Size:"}</div>
              <div className={styles.infoValue}>{troopDef.platoon_size}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Individual BR:"}</div>
              <div className={styles.infoValue}>{troopDef.individual_br}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Move:"}</div>
              <div className={styles.infoValue}>{`${troopDef.move}' / ${troopDef.move / 5} miles`}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Wages:"}</div>
              <div className={styles.infoValue}>{troopDef.wage}gp</div>
            </div>
            <div className={styles.infoRow} />
            <div className={styles.infoRow} />
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"AC:"}</div>
              <div className={styles.infoValue}>{troopDef.ac}</div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Morale:"}</div>
              <div className={styles.infoValue}>
                {troopDef.morale >= 0 ? "+" : ""}
                {troopDef.morale}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>Count</div>
          <input
            className={styles.countTextField}
            type={"number"}
            value={this.state.count}
            onChange={(e) => {
              this.setState({ count: +e.target.value });
            }}
            tabIndex={nextTabIndex++}
          />
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
            {"Save Changes"}
          </div>
          <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
        </div>

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Send it to the server!
    const res = await ServerAPI.deleteTroop(this.props.troop.id);
    if ("error" in res) {
      console.log("Failed to delete troop.");
    } else {
      // Successfully deleted, so update the local data.
      this.props.dispatch?.(deleteTroop(this.props.troop.id));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid count?
    if (this.state.count < 1) {
      this.props.dispatch?.(
        showModal({
          id: "NoCountError",
          content: {
            title: "Error!",
            message: "Please enter a non-zero troop count!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Create a new troop.
    const newTroop: TroopData = {
      ...this.props.troop,
      count: this.state.count,
    };

    // Send it to the server!
    const res = await ServerAPI.editTroop(newTroop);
    if ("error" in res) {
      console.log("Failed to edit troop.");
    } else {
      // Successfully edited, so update the local data.
      this.props.dispatch?.(updateTroop(newTroop));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const troopDefs = state.gameDefs.troops;
  return {
    ...props,
    troopDefs,
  };
}

export const EditTroopSubPanel = connect(mapStateToProps)(AEditTroopSubPanel);
