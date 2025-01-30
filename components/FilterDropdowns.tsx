/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import store, { RootState } from "../redux/store";
import styles from "./FilterDropdowns.module.scss";
import { CharacterData, LocationData, UserData } from "../serverAPI";
import { Dictionary } from "../lib/dictionary";
import { UserRole } from "../redux/userSlice";
import { AbilityDisplayData } from "./characters/dialogs/EditProficienciesSubPanel";
import { AllProficiencies } from "../staticData/proficiencies/AllProficiencies";
import { AbilityOrProficiency } from "../staticData/types/abilitiesAndProficiencies";
import { getProficiencyRankForCharacter } from "../lib/characterUtils";

export const FilterValueAny = "---";
export enum FilterValueAliveStatus {
  Alive = "Alive",
  Dead = "Dead",
}
export enum FilterValueBusyStatus {
  Available = "Available",
  Busy = "Busy",
}

export enum FilterType {
  AliveStatus = "AliveStatus",
  BusyStatus = "BusyStatus",
  Location = "Location",
  Owner = "Owner",
  Proficiency = "Proficiency",
}

export type FilterValues = Partial<Record<keyof typeof FilterType, string>>;

const filterTypeNames: Record<keyof typeof FilterType, string> = {
  [FilterType.AliveStatus]: "Status",
  [FilterType.BusyStatus]: "Status",
  [FilterType.Location]: "Location",
  [FilterType.Owner]: "Owner",
  [FilterType.Proficiency]: "Proficiency",
};

export function isFilterMetAliveStatus(filters: FilterValues, character: CharacterData): boolean {
  const aliveFilter = filters[FilterType.AliveStatus] ?? FilterValueAny;
  if (aliveFilter === FilterValueAny) {
    return true;
  }

  if (
    (aliveFilter === FilterValueAliveStatus.Alive && character.dead) ||
    (aliveFilter === FilterValueAliveStatus.Dead && !character.dead)
  ) {
    return false;
  }

  return true;
}

export function isFilterMetAdventurerBusyStatus(
  filters: FilterValues,
  characterId: number,
  startDate: string,
  endDate: string
): boolean {
  const busyFilter = filters[FilterType.BusyStatus] ?? FilterValueAny;
  if (busyFilter === FilterValueAny) {
    return true;
  }

  const redux = store.getState();
  const conflictingActivity = Object.values(redux.activities.activities).find((activity) => {
    // Look at other activities this character is/was part of.
    if (
      !activity.participants.find((p) => {
        return characterId === p.characterId;
      })
    ) {
      return false;
    }

    // Would any of those overlap with the date we are checking?
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    const activityStartTime = new Date(activity.start_date).getTime();
    const activityEndTime = new Date(activity.end_date).getTime();

    return Math.max(startTime, activityStartTime) <= Math.min(endTime, activityEndTime);
  });

  if (busyFilter === FilterValueBusyStatus.Busy && !conflictingActivity) {
    return false;
  }
  if (busyFilter === FilterValueBusyStatus.Available && !!conflictingActivity) {
    return false;
  }

  return true;
}

export function isFilterMetArmyBusyStatus(
  filters: FilterValues,
  armyId: number,
  startDate: string,
  endDate: string
): boolean {
  const busyFilter = filters[FilterType.BusyStatus] ?? FilterValueAny;
  if (busyFilter === FilterValueAny) {
    return true;
  }

  const redux = store.getState();
  const conflictingActivity = Object.values(redux.activities.activities).find((activity) => {
    // Look at other activities this army is/was part of.
    if (
      !activity.army_participants.find((p) => {
        return armyId === p.armyId;
      })
    ) {
      return false;
    }

    // Would any of those overlap with the date we are checking?
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    const activityStartTime = new Date(activity.start_date).getTime();
    const activityEndTime = new Date(activity.end_date).getTime();

    return Math.max(startTime, activityStartTime) <= Math.min(endTime, activityEndTime);
  });

  if (busyFilter === FilterValueBusyStatus.Busy && !conflictingActivity) {
    return false;
  }
  if (busyFilter === FilterValueBusyStatus.Available && !!conflictingActivity) {
    return false;
  }

  return true;
}

export function isFilterMetLocation(filters: FilterValues, locationId: number): boolean {
  const locationFilter = filters[FilterType.Location] ?? FilterValueAny;
  if (locationFilter === FilterValueAny) {
    return true;
  }

  return locationId === +locationFilter;
}

export function isFilterMetOwner(filters: FilterValues, ownerId: number): boolean {
  const ownerFilter = filters[FilterType.Owner] ?? FilterValueAny;
  if (ownerFilter === FilterValueAny) {
    return true;
  }

  return ownerId === +ownerFilter;
}

export function isFilterMetProficiency(filters: FilterValues, characterId: number): boolean {
  const proficiencyFilter = filters[FilterType.Proficiency] ?? FilterValueAny;
  if (proficiencyFilter === FilterValueAny) {
    return true;
  }

  let subtype: string | undefined = undefined;
  const subtypeMatch = proficiencyFilter.match(/\(([^)]+)\)/);
  if (subtypeMatch) {
    subtype = subtypeMatch[1];
  }

  let profId: string = "";
  if ((subtype?.length ?? 0) > 0) {
    profId = proficiencyFilter.slice(0, proficiencyFilter.indexOf("(")).trim();
  } else {
    profId = proficiencyFilter;
  }

  if (!getProficiencyRankForCharacter(characterId, profId, subtype)) {
    return false;
  }

  return true;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Each included value will produce a single dropdown.  Each array defines a column, from left to right. */
  filterOrder: FilterType[][];
  /** Key should be FilterType enum. */
  filterValues: FilterValues;
  onFilterChanged?: (values: FilterValues) => void;
}

interface InjectedProps {
  allLocations: Dictionary<LocationData>;
  users: Dictionary<UserData>;
  activeRole: UserRole;
  currentUserID: number;
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class AFilterDropdowns extends React.Component<Props> {
  public render(): React.ReactNode {
    const {
      filterOrder,
      filterValues,
      onFilterChanged,
      allLocations,
      users,
      activeRole,
      currentUserID,
      dispatch,
      className,
      ...otherProps
    } = this.props;
    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {filterOrder.map(this.renderFilterColumn.bind(this))}
      </div>
    );
  }

  private renderFilterColumn(filters: FilterType[], index: number): React.ReactNode {
    return (
      <div className={styles.filterColumn} key={`filterColumn${index}`}>
        <div className={styles.nameColumn}>
          {filters.map((f, i) => {
            return (
              <div className={styles.filterRow} key={`${f}_${i}`}>
                <div className={styles.filterTitle}>{filterTypeNames[f]}</div>
              </div>
            );
          })}
        </div>
        <div className={styles.dropdownColumn}>{filters.map(this.renderDropdown.bind(this))}</div>
      </div>
    );
  }

  private renderDropdown(f: FilterType, index: number): React.ReactNode {
    return (
      <div className={styles.filterRow} key={`${index}_${f}`}>
        {this.renderDropdownType(f)}
      </div>
    );
  }

  private renderDropdownType(f: FilterType): React.ReactNode {
    switch (f) {
      case FilterType.AliveStatus: {
        return this.renderAliveStatusDropdown();
      }
      case FilterType.BusyStatus: {
        return this.renderBusyStatusDropdown();
      }
      case FilterType.Location: {
        return this.renderLocationDropdown();
      }
      case FilterType.Owner: {
        return this.renderOwnerDropdown();
      }
      case FilterType.Proficiency: {
        return this.renderProficiencyDropdown();
      }
      default: {
        return `${f} unsupported`;
      }
    }
  }

  private renderAliveStatusDropdown(): React.ReactNode {
    return (
      <select
        className={styles.filterDropdown}
        value={this.props.filterValues[FilterType.AliveStatus] ?? FilterValueAny}
        onChange={(e) => {
          const newValues: FilterValues = {
            ...this.props.filterValues,
            [FilterType.AliveStatus]: e.target.value,
          };
          this.props.onFilterChanged?.(newValues);
        }}
      >
        <option value={FilterValueAny}>{FilterValueAny}</option>
        <option value={"Alive"}>Alive</option>
        <option value={"Dead"}>Dead</option>
      </select>
    );
  }

  private renderBusyStatusDropdown(): React.ReactNode {
    return (
      <select
        className={styles.filterDropdown}
        value={this.props.filterValues[FilterType.BusyStatus] ?? FilterValueAny}
        onChange={(e) => {
          const newValues: FilterValues = {
            ...this.props.filterValues,
            [FilterType.BusyStatus]: e.target.value,
          };
          this.props.onFilterChanged?.(newValues);
        }}
      >
        <option value={FilterValueAny}>{FilterValueAny}</option>
        <option value={"Available"}>Available</option>
        <option value={"Busy"}>Busy</option>
      </select>
    );
  }

  private renderLocationDropdown(): React.ReactNode {
    return (
      <select
        className={styles.filterDropdown}
        value={this.props.filterValues[FilterType.Location] ?? FilterValueAny}
        onChange={(e) => {
          const newValues: FilterValues = {
            ...this.props.filterValues,
            [FilterType.Location]: e.target.value,
          };
          this.props.onFilterChanged?.(newValues);
        }}
      >
        <option value={FilterValueAny}>{FilterValueAny}</option>
        {this.getSortedLocations().map(({ id, name }) => {
          return (
            <option value={id} key={`location${id}`}>
              {name}
            </option>
          );
        })}
      </select>
    );
  }

  private getSortedLocations(): LocationData[] {
    const locations = Object.values(this.props.allLocations).sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return locations;
  }

  private renderOwnerDropdown(): React.ReactNode {
    return (
      <select
        className={styles.filterDropdown}
        value={this.props.filterValues[FilterType.Owner] ?? this.props.currentUserID.toString()}
        onChange={(e) => {
          const newValues: FilterValues = {
            ...this.props.filterValues,
            [FilterType.Owner]: e.target.value,
          };
          this.props.onFilterChanged?.(newValues);
        }}
      >
        <option value={FilterValueAny}>{FilterValueAny}</option>
        {this.getPermittedUsers().map(({ id, name }) => {
          return (
            <option value={id} key={`owner${id}`}>
              {name}
            </option>
          );
        })}
      </select>
    );
  }

  private getPermittedUsers(): UserData[] {
    const permittedUsers = Object.values(this.props.users)
      .filter((user) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return user.id === this.props.currentUserID;
        }
      })
      .sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

    return permittedUsers;
  }

  private renderProficiencyDropdown(): React.ReactNode {
    return (
      <select
        className={styles.filterDropdown}
        value={this.props.filterValues[FilterType.Proficiency] ?? FilterValueAny}
        onChange={(e) => {
          const newValues: FilterValues = {
            ...this.props.filterValues,
            [FilterType.Proficiency]: e.target.value,
          };
          this.props.onFilterChanged?.(newValues);
        }}
      >
        <option value={FilterValueAny}>{FilterValueAny}</option>
        {this.getSortedProficiencies().map((prof) => {
          return (
            <option value={prof.name} key={`prof${prof.name}`}>
              {prof.name}
            </option>
          );
        })}
      </select>
    );
  }

  private getSortedProficiencies(): AbilityDisplayData[] {
    const data: AbilityDisplayData[] = [];

    Object.values(AllProficiencies).forEach((def) => {
      // If the filter lists subtypes, iterate those.
      // If the filter doesn't list subtypes but the def does, iterate those.
      // If the def has no subtypes, just make a single displayData.
      let subtypesToIterate: string[] = def.subTypes ?? [];

      if (subtypesToIterate.length === 0) {
        // Single standard proficiency, no subtypes.
        data.push(this.buildDisplayDataForProficiency(def));
      } else {
        // Has subtype(s).  One entry for each.
        subtypesToIterate.forEach((subtype) => {
          data.push(this.buildDisplayDataForProficiency(def, subtype));
        });
      }
    });

    // Sort the proficiencies by name.
    data.sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return data;
  }

  private buildDisplayDataForProficiency(def: AbilityOrProficiency, subtype?: string): AbilityDisplayData {
    let displayName: string = def.name;
    if (subtype && subtype.length > 0) {
      displayName = `${def.name} (${subtype})`;
    }

    const data: AbilityDisplayData = {
      name: displayName,
      def,
      rank: 1,
      minLevel: 1,
      subtype,
    };
    return data;
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const allLocations = state.locations.locations;
  const { users } = state.user;
  const { activeRole } = state.hud;
  const currentUserID = state.user.currentUser.id;

  return {
    ...ownProps,
    allLocations,
    users,
    activeRole,
    currentUserID,
  };
}

export const FilterDropdowns = connect(mapStateToProps)(AFilterDropdowns);
