import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { TroopData, TroopDefData } from "../../serverAPI";
import styles from "./CreateTroopSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { updateTroop } from "../../redux/armiesSlice";

interface State {
  troopDefId: number;
  count: number;
  isSaving: boolean;
}

interface ReactProps {
  armyId: number;
}

interface InjectedProps {
  troopDefs: Dictionary<TroopDefData>;
  currentTroops: TroopData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateTroopSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      troopDefId: 0,
      count: 0,
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;

    const troopDef = this.props.troopDefs[this.state.troopDefId];

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{"Create New Troop"}</div>
        <div className={styles.contentRow}>
          <div className={styles.typeLabel}>{"Type"}</div>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.column}>
            <div className={styles.listContainer}>{this.getSortedTroopDefs().map(this.renderTypeRow.bind(this))}</div>
          </div>
          <div className={styles.infoPanel}>
            {this.state.troopDefId === 0 ? null : (
              <>
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
              </>
            )}
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
          <div className={styles.createButton} onClick={this.onCreateClicked.bind(this)}>
            {"Create"}
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

  private getSortedTroopDefs(): TroopDefData[] {
    const allowedDefs = Object.values(this.props.troopDefs).filter(({ id }) => {
      // Each troop type should be unique within an army.  One record for all Heavy Infantry A, etc.
      return !this.props.currentTroops.find((t) => t.def_id === id);
    });
    allowedDefs.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });

    return allowedDefs;
  }

  private renderTypeRow(def: TroopDefData, index: number): React.ReactNode {
    return (
      <div
        className={`${styles.listRow} ${def.id === this.state.troopDefId ? styles.selected : ""}`}
        key={`typeRow${index}`}
        onClick={() => {
          this.setState({ troopDefId: def.id });
        }}
      >
        <div className={styles.listName}>{def.name}</div>
      </div>
    );
  }

  private async onCreateClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid type?
    if (this.state.troopDefId === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoTypeError",
          content: {
            title: "Error!",
            message: "Please select a Type for this troop!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

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
      id: 0,
      army_id: this.props.armyId,
      def_id: this.state.troopDefId,
      count: this.state.count,
    };

    // Send it to the server!
    const res = await ServerAPI.createTroop(newTroop);
    if ("error" in res) {
      console.log("Failed to create troop.");
    } else {
      // Successfully created, so add it to the local data.
      newTroop.id = res.insertId;
      this.props.dispatch?.(updateTroop(newTroop));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const troopDefs = state.gameDefs.troops;
  const currentTroops = state.armies.troopsByArmy[props.armyId] ?? [];

  return {
    ...props,
    troopDefs,
    currentTroops,
  };
}

export const CreateTroopSubPanel = connect(mapStateToProps)(ACreateTroopSubPanel);
