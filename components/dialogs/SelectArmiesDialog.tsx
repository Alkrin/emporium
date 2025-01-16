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
import dateFormat from "dateformat";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAny,
  FilterValueBusyStatus,
  FilterValues,
  isFilterMetArmyBusyStatus,
  isFilterMetLocation,
  isFilterMetOwner,
} from "../FilterDropdowns";

interface State {
  startDate: string;
  endDate: string;
  selectedArmyIDs: number[];
  filters: FilterValues;
}

interface ReactProps {
  preselectedArmyIDs: number[];
  startDateOverride?: string;
  endDateOverride?: string;
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

    const startDate = this.props.startDateOverride ?? dateFormat(new Date(), "yyyy-mm-dd");
    const endDate = this.props.endDateOverride ?? startDate;

    this.state = {
      startDate,
      endDate,
      selectedArmyIDs: [...props.preselectedArmyIDs],
      filters: {
        [FilterType.Owner]: this.props.currentUserID.toString(),
        [FilterType.Location]: FilterValueAny,
        [FilterType.BusyStatus]: FilterValueBusyStatus.Available,
      },
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Armies"}</div>
        <div className={styles.contentRow}>
          <div className={styles.normalText}>{"When are they needed?\xa0"}</div>
          <input
            type={"date"}
            value={this.state.startDate}
            onChange={(e) => {
              this.setState({ startDate: e.target.value });
            }}
          />
          <div className={styles.normalText}>{"\xa0-\xa0"}</div>
          <input
            type={"date"}
            value={this.state.endDate}
            onChange={(e) => {
              this.setState({ endDate: e.target.value });
            }}
          />
        </div>
        <div className={styles.filtersContainer}>
          <FilterDropdowns
            filterOrder={[[FilterType.Owner, FilterType.BusyStatus, FilterType.Location]]}
            filterValues={this.state.filters}
            onFilterChanged={(filters) => {
              this.setState({ filters });
            }}
          />
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
          this.props.startDateOverride
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
      if (!isFilterMetOwner(this.state.filters, army.user_id)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, army.location_id)) {
        return false;
      }

      // Apply Status filter.
      if (!isFilterMetArmyBusyStatus(this.state.filters, army.id, this.state.startDate, this.state.endDate)) {
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
