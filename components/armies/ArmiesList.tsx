import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { ArmyData, TroopData, TroopInjuryData } from "../../serverAPI";
import styles from "./ArmiesList.module.scss";
import { setActiveArmyId } from "../../redux/armiesSlice";
import { CreateArmySubPanel } from "./CreateArmySubPanel";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAny,
  FilterValues,
  isFilterMetLocation,
  isFilterMetOwner,
} from "../FilterDropdowns";

interface State {
  filters: FilterValues;
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  currentUserId: number;
  activeArmyId: number;
  armies: Dictionary<ArmyData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopInjuriesByTroop: Dictionary<TroopInjuryData[]>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AArmiesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        [FilterType.Owner]: this.props.currentUserId.toString(),
        [FilterType.Location]: FilterValueAny,
      },
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
            <FilterDropdowns
              filterOrder={[[FilterType.Owner], [FilterType.Location]]}
              filterValues={this.state.filters}
              onFilterChanged={(filters) => {
                this.setState({ filters });
              }}
            />
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
      })
    );
  }

  private sortPermittedArmies(): ArmyData[] {
    const permittedArmies = Object.values(this.props.armies).filter((army) => {
      return this.props.activeRole !== "player" || army.user_id === this.props.currentUserId;
    });

    const filteredArmies = permittedArmies.filter((army) => {
      // Apply Owner filter.
      if (!isFilterMetOwner(this.state.filters, army.user_id)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, army.location_id)) {
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
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { armies, activeArmyId, troopsByArmy, troopInjuriesByTroop } = state.armies;

  return {
    ...props,
    activeRole,
    currentUserId: state.user.currentUser.id,
    activeArmyId,
    armies,
    troopsByArmy,
    troopInjuriesByTroop,
  };
}

export const ArmiesList = connect(mapStateToProps)(AArmiesList);
