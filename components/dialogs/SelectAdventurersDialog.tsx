import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectAdventurersDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ActivityData, CharacterData, LocationData, UserData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";
import { AbilityOrProficiency } from "../../staticData/types/abilitiesAndProficiencies";
import { AbilityDisplayData } from "../characters/EditProficienciesSubPanel";
import { AllProficiencies } from "../../staticData/proficiencies/AllProficiencies";
import { isProficiencyUnlockedForCharacter } from "../../lib/characterUtils";
import dateFormat from "dateformat";

interface State {
  startDate: string;
  endDate: string;
  selectedAdventurerIDs: number[];
  filterOwnerId: number;
  filterLocationId: number;
  filterStatus: string;
  filterProficiencyId: string;
}

interface ReactProps {
  preselectedAdventurerIDs: number[];
  currentDateOverride?: string;
  onSelectionConfirmed: (adventurerIDs: number[]) => void;
}

interface InjectedProps {
  currentUserID: number;
  allCharacters: Dictionary<CharacterData>;
  allLocations: Dictionary<LocationData>;
  activeRole: UserRole;
  activities: Dictionary<ActivityData>;
  users: Dictionary<UserData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectAdventurersDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const currentDate = this.props.currentDateOverride ?? dateFormat(new Date(), "yyyy-mm-dd");

    this.state = {
      startDate: currentDate,
      endDate: currentDate,
      selectedAdventurerIDs: [...props.preselectedAdventurerIDs],
      filterOwnerId: -1,
      filterLocationId: -1,
      filterStatus: "Available",
      filterProficiencyId: "",
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Adventurers"}</div>
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
          <div className={styles.row}>
            <div className={styles.filterText}>Status</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterStatus}
              onChange={(e) => {
                this.setState({ filterStatus: e.target.value });
              }}
            >
              <option value={"Available"}>Available</option>
              <option value={"Busy"}>Busy</option>
            </select>
          </div>
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
          <div className={styles.row}>
            <div className={styles.filterText}>Proficiency</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterProficiencyId}
              onChange={(e) => {
                this.setState({ filterProficiencyId: e.target.value });
              }}
            >
              <option value={""}>Any</option>
              {this.getSortedProficiencies().map((prof) => {
                return (
                  <option value={prof.name} key={`prof${prof.name}`}>
                    {prof.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={styles.participantsSection}>
          <div className={styles.participantsContainer}>
            <div className={styles.normalText}>Participants</div>
            <div className={styles.participantsListContainer}>
              {this.getSortedParticipants().map(this.renderParticipantRow.bind(this))}
            </div>
          </div>
          <div className={styles.participantsContainer}>
            <div className={styles.normalText}>Adventurers</div>
            <div className={styles.adventurersListContainer}>
              {this.getSortedAdventurers().map(this.renderAdventurerRow.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          Confirm Selection
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Cancel
        </div>
      </div>
    );
  }

  private renderParticipantRow(character: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`participantRow${index}`}>
        <div className={styles.listLevel}>L{character.level}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.listName}>{character.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onRemoveParticipant.bind(this, character)}>
          -
        </div>
      </div>
    );
  }

  private renderAdventurerRow(character: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`adventurerRow${index}`}>
        <div className={styles.listLevel}>L{character.level}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.listName}>{character.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onAddParticipant.bind(this, character)}>
          +
        </div>
      </div>
    );
  }

  private onAddParticipant(character: CharacterData): void {
    const selectedAdventurerIDs = [...this.state.selectedAdventurerIDs, character.id];
    this.setState({ selectedAdventurerIDs });
  }

  private onRemoveParticipant(character: CharacterData): void {
    const selectedAdventurerIDs = this.state.selectedAdventurerIDs.filter((aid) => {
      return aid !== character.id;
    });
    this.setState({ selectedAdventurerIDs });
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

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedAdventurerIDs);
    this.onCloseClicked();
  }

  private getSortedParticipants(): CharacterData[] {
    const p: CharacterData[] = this.state.selectedAdventurerIDs.map((aid) => {
      return this.props.allCharacters[aid];
    });

    // Sort by level, then by name.
    p.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return p;
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

  private getSortedAdventurers(): CharacterData[] {
    const p: CharacterData[] = Object.values(this.props.allCharacters).filter((character) => {
      // Exclude the dead.
      if (character.dead) {
        return false;
      }
      // Exclude characters that are already participants.
      if (
        !!this.state.selectedAdventurerIDs.find((aid) => {
          return character.id === aid;
        })
      ) {
        return false;
      }

      // Apply Owner filter.
      if (this.state.filterOwnerId > -1 && character.user_id !== this.state.filterOwnerId) {
        return false;
      }

      // Apply Location filter.
      if (this.state.filterLocationId > -1 && character.location_id !== this.state.filterLocationId) {
        return false;
      }

      // Apply Status filter.
      const conflictingActivity = Object.values(this.props.activities).find((activity) => {
        // Look at other activities this character is/was part of.
        if (
          !activity.participants.find((p) => {
            return character.id === p.characterId;
          })
        ) {
          return false;
        }
        // Would any of those overlap with the date we are checking?
        const startTime = new Date(this.state.startDate).getTime();
        const endTime = new Date(this.state.endDate).getTime();
        const activityStartTime = new Date(activity.start_date).getTime();
        const activityEndTime = new Date(activity.end_date).getTime();

        return Math.max(startTime, activityStartTime) <= Math.min(endTime, activityEndTime);
      });
      if (this.state.filterStatus === "Busy" && !conflictingActivity) {
        return false;
      }
      if (this.state.filterStatus === "Available" && !!conflictingActivity) {
        return false;
      }

      // Apply Proficiency filter.
      if (this.state.filterProficiencyId.length > 0) {
        let subtype: string | undefined = undefined;
        const subtypeMatch = this.state.filterProficiencyId.match(/\(([^)]+)\)/);
        if (subtypeMatch) {
          subtype = subtypeMatch[1];
        }

        let profId: string = "";
        if ((subtype?.length ?? 0) > 0) {
          profId = this.state.filterProficiencyId.slice(0, this.state.filterProficiencyId.indexOf("(")).trim();
        } else {
          profId = this.state.filterProficiencyId;
        }

        if (!isProficiencyUnlockedForCharacter(character.id, profId, subtype)) {
          return false;
        }
      }

      return true;
    });

    // Sort by level, then by name.
    p.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return p;
  }

  private getSortedLocations(): LocationData[] {
    const locations = Object.values(this.props.allLocations).sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return locations;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities } = state.activities;
  const allCharacters = state.characters.characters;
  const allLocations = state.locations.locations;
  const { activeRole } = state.hud;
  const { users } = state.user;
  return {
    ...props,
    currentUserID: state.user.currentUser.id,
    allCharacters,
    allLocations,
    activeRole,
    activities,
    users,
  };
}

export const SelectAdventurersDialog = connect(mapStateToProps)(ASelectAdventurersDialog);
