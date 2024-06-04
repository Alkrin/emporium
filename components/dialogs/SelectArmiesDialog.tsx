import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectArmiesDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ArmyData, LocationData, UserData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";
import { getArmyAvailableBattleRating, getArmyTotalBattleRating } from "../../lib/armyUtils";

interface State {
  selectedArmyIDs: number[];
  filterOwnerId: number;
  filterLocationId: number;
}

interface ReactProps {
  preselectedArmyIDs: number[];
  currentDateOverride?: string;
  onSelectionConfirmed: (armyIDs: number[]) => void;
}

interface InjectedProps {
  currentUserID: number;
  allArmies: Dictionary<ArmyData>;
  allLocations: Dictionary<LocationData>;
  activeRole: UserRole;
  users: Dictionary<UserData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectArmiesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedArmyIDs: [...props.preselectedArmyIDs],
      filterOwnerId: -1,
      filterLocationId: -1,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Armies"}</div>
        <div className={styles.filtersContainer}>
          <div className={styles.row}>
            <div className={styles.filterText}>Owner</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterOwnerId}
              onChange={(e) => {
                this.setState({ filterOwnerId: +e.target.value });
              }}
            >
              <option value={-1}>Any</option>
              {this.sortPermittedUsers().map(({ id, name }) => {
                return (
                  <option value={id} key={`user${name}`}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className={styles.row}>
            <div className={styles.filterText}>Location</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterLocationId}
              onChange={(e) => {
                this.setState({ filterLocationId: +e.target.value });
              }}
            >
              <option value={-1}>Any</option>
              {this.getSortedLocations().map(({ id, name }) => {
                return (
                  <option value={id} key={`location${name}`}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={styles.participantsSection}>
          <div className={styles.participantsContainer}>
            <div className={styles.normalText}>{"Participants"}</div>
            <div className={styles.participantsListContainer}>
              {this.getSortedParticipants().map(this.renderParticipantRow.bind(this))}
            </div>
          </div>
          <div className={styles.participantsContainer}>
            <div className={styles.normalText}>{"Armies"}</div>
            <div className={styles.armiesListContainer}>
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

  private renderParticipantRow(army: ArmyData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`participantRow${index}`}>
        <div className={styles.listBattleRating}>{`BR: ${getArmyAvailableBattleRating(
          army.id,
          this.props.currentDateOverride
        ).toFixed(2)} / ${getArmyTotalBattleRating(army.id).toFixed(2)}`}</div>
        <div className={styles.listName}>{army.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onRemoveParticipant.bind(this, army)}>
          -
        </div>
      </div>
    );
  }

  private renderArmyRow(army: ArmyData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`armyRow${index}`}>
        <div className={styles.listBattleRating}>{`BR: ${getArmyAvailableBattleRating(army.id).toFixed(
          2
        )} / ${getArmyTotalBattleRating(army.id).toFixed(2)}`}</div>
        <div className={styles.listName}>{army.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onAddParticipant.bind(this, army)}>
          +
        </div>
      </div>
    );
  }

  private onAddParticipant(army: ArmyData): void {
    const selectedArmyIDs = [...this.state.selectedArmyIDs, army.id];
    this.setState({ selectedArmyIDs });
  }

  private onRemoveParticipant(army: ArmyData): void {
    const selectedArmyIDs = this.state.selectedArmyIDs.filter((aid) => {
      return aid !== army.id;
    });
    this.setState({ selectedArmyIDs });
  }

  private sortPermittedUsers(): UserData[] {
    const permittedUsers = Object.values(this.props.users)
      .filter((user) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return user.id === this.props.currentUserID;
        }
      })
      .sort();

    return permittedUsers;
  }

  private getSortedLocations(): LocationData[] {
    const locations = Object.values(this.props.allLocations).sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return locations;
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedArmyIDs);
    this.onCloseClicked();
  }

  private getSortedParticipants(): ArmyData[] {
    const p: ArmyData[] = this.state.selectedArmyIDs.map((aid) => {
      return this.props.allArmies[aid];
    });

    // Sort by then by name.
    p.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return p;
  }

  private getSortedArmies(): ArmyData[] {
    const p: ArmyData[] = Object.values(this.props.allArmies).filter((army) => {
      // Exclude armies that are already participants.
      if (
        !!this.state.selectedArmyIDs.find((aid) => {
          return army.id === aid;
        })
      ) {
        return false;
      }

      // Apply Owner filter.
      if (this.state.filterOwnerId > -1 && army.user_id !== this.state.filterOwnerId) {
        return false;
      }

      // Apply Location filter.
      if (this.state.filterLocationId > -1 && army.location_id !== this.state.filterLocationId) {
        return false;
      }

      return true;
    });

    // Sort by name.
    p.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return p;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allArmies = state.armies.armies;
  const allLocations = state.locations.locations;
  const { activeRole } = state.hud;
  const { users } = state.user;
  return {
    ...props,
    currentUserID: state.user.currentUser.id,
    allArmies,
    allLocations,
    activeRole,
    users,
  };
}

export const SelectArmiesDialog = connect(mapStateToProps)(ASelectArmiesDialog);
