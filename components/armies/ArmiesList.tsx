import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { ArmyData, LocationData, TroopData, TroopInjuryData, UserData } from "../../serverAPI";
import styles from "./ArmiesList.module.scss";
import { setActiveArmyId } from "../../redux/armiesSlice";
import { CreateArmySubPanel } from "./CreateArmySubPanel";

interface State {
  filterOwnerId: number;
  filterLocationId: number; // Location or Activity?
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  currentUserId: number;
  users: Dictionary<UserData>;
  activeArmyId: number;
  armies: Dictionary<ArmyData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopInjuriesByTroop: Dictionary<TroopInjuryData[]>;
  allLocations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AArmiesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filterOwnerId: -1,
      filterLocationId: -1,
    };
  }

  render(): React.ReactNode {
    const armies = this.sortPermittedArmies();

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.newArmyButton} onClick={this.onCreateNewClicked.bind(this)}>
            Add New Army
          </div>
          Filters
          <div className={styles.filtersContainer}>
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
        <div className={styles.listContainer}>
          {armies.map((character, index) => {
            return this.renderArmyRow(character, index);
          })}
        </div>
      </div>
    );
  }

  private renderArmyRow(army: ArmyData, index: number): React.ReactNode {
    const selectedClass = army.id === this.props.activeArmyId ? styles.selected : "";

    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`armyRow${index}`}
        onClick={this.onArmyRowClick.bind(this, army.id)}
      >
        <div className={styles.row}>
          <div className={styles.listName}>{army.name}</div>
          <div className={styles.editButton} onClick={this.onArmyEditClick.bind(this, army.id)} />
        </div>
      </div>
    );
  }

  private onArmyRowClick(armyId: number): void {
    if (this.props.activeArmyId !== armyId) {
      this.props.dispatch?.(setActiveArmyId(armyId));
    }
  }

  private onArmyEditClick(armyId: number): void {
    // Editing also selects the character.
    this.onArmyRowClick(armyId);
    // Open the characterCreator in edit mode.
    this.props.dispatch?.(
      showSubPanel({
        id: "EditArmy",
        content: () => {
          return <CreateArmySubPanel isEditMode />;
        },
        escapable: true,
      })
    );
  }

  private sortPermittedUsers(): UserData[] {
    const permittedUsers = Object.values(this.props.users)
      .filter((user) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return user.id === this.props.currentUserId;
        }
      })
      .sort();

    return permittedUsers;
  }

  private sortPermittedArmies(): ArmyData[] {
    const permittedArmies = Object.values(this.props.armies).filter((army) => {
      return this.props.activeRole !== "player" || army.user_id === this.props.currentUserId;
    });

    const filteredArmies = permittedArmies.filter((army) => {
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

    filteredArmies.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });

    return filteredArmies;
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateNewArmy",
        content: () => {
          return <CreateArmySubPanel />;
        },
        escapable: true,
      })
    );
  }

  private getSortedLocations(): LocationData[] {
    const locations = Object.values(this.props.allLocations).sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return locations;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { users } = state.user;
  const { armies, activeArmyId, troopsByArmy, troopInjuriesByTroop } = state.armies;
  const allLocations = state.locations.locations;
  return {
    ...props,
    activeRole,
    currentUserId: state.user.currentUser.id,
    users,
    activeArmyId,
    armies,
    troopsByArmy,
    troopInjuriesByTroop,
    allLocations,
  };
}

export const ArmiesList = connect(mapStateToProps)(AArmiesList);
