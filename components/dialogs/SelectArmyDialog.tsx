import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectArmyDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ArmyData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";

interface State {
  selectedArmyId: number;
}

interface ReactProps {
  preselectedArmyId: number;
  onSelectionConfirmed: (armyId: number) => Promise<void>;
}

interface InjectedProps {
  allArmies: Dictionary<ArmyData>;
  activeRole: UserRole;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectArmyDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedArmyId: props.preselectedArmyId,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Army"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderArmyRow(
                {
                  id: 0,
                  name: "---",
                  location_id: 0,
                  maintenance_date: "",
                  user_id: 0,
                },
                -1
              )}
              {this.getSortedArmies().map(this.renderArmyRow.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Selection"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Cancel"}
        </div>
      </div>
    );
  }

  private renderArmyRow(army: ArmyData, index: number): React.ReactNode {
    const selectedClass = army.id === this.state.selectedArmyId ? styles.selected : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`armyRow${index}`}
        onClick={() => {
          this.setState({ selectedArmyId: army.id });
        }}
      >
        <div className={styles.listName}>{army.name}</div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedArmyId);
    this.onCloseClicked();
  }

  private getSortedArmies(): ArmyData[] {
    const permittedArmies = Object.values(this.props.allArmies).filter((army) => {
      return this.props.activeRole !== "player" || army.user_id === this.props.currentUserId;
    });

    permittedArmies.sort((armyA, armyB) => {
      // And an alphy sort when the others don't apply.
      const nameA = armyA.name;
      const nameB = armyB.name;

      return nameA.localeCompare(nameB);
    });

    return permittedArmies;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allArmies = state.armies.armies;
  const { activeRole } = state.hud;
  const currentUserId = state.user.currentUser.id;

  return {
    ...props,
    allArmies,
    activeRole,
    currentUserId,
  };
}

export const SelectArmyDialog = connect(mapStateToProps)(ASelectArmyDialog);
