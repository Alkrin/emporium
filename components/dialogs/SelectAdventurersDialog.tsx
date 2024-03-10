import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectAdventurersDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ActivityData, CharacterData, UserData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";
import dateFormat from "dateformat";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAny,
  FilterValueBusyStatus,
  FilterValues,
  isFilterMetBusyStatus,
  isFilterMetLocation,
  isFilterMetOwner,
  isFilterMetProficiency,
} from "../FilterDropdowns";

interface State {
  startDate: string;
  endDate: string;
  selectedAdventurerIDs: number[];
  filters: FilterValues;
}

interface ReactProps {
  preselectedAdventurerIDs: number[];
  currentDateOverride?: string;
  onSelectionConfirmed: (adventurerIDs: number[]) => void;
}

interface InjectedProps {
  currentUserID: number;
  allCharacters: Dictionary<CharacterData>;
  activeRole: UserRole;
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
      filters: {
        [FilterType.Owner]: FilterValueAny,
        [FilterType.Location]: FilterValueAny,
        [FilterType.BusyStatus]: FilterValueBusyStatus.Available,
        [FilterType.Proficiency]: FilterValueAny,
      },
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
          <FilterDropdowns
            filterOrder={[[FilterType.Owner, FilterType.BusyStatus, FilterType.Location, FilterType.Proficiency]]}
            filterValues={this.state.filters}
            onFilterChanged={(filters) => {
              this.setState({ filters });
            }}
          />
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

  private getSortedAdventurers(): CharacterData[] {
    const permittedCharacters = Object.values(this.props.allCharacters).filter((character) => {
      return this.props.activeRole !== "player" || character.user_id === this.props.currentUserID;
    });

    const p: CharacterData[] = permittedCharacters.filter((character) => {
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
      if (!isFilterMetOwner(this.state.filters, character.user_id)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, character.location_id)) {
        return false;
      }

      // Apply Status filter.
      if (!isFilterMetBusyStatus(this.state.filters, character.id, this.state.startDate, this.state.endDate)) {
        return false;
      }

      // Apply Proficiency filter.
      if (!isFilterMetProficiency(this.state.filters, character.id)) {
        return false;
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
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const { activeRole } = state.hud;
  return {
    ...props,
    currentUserID: state.user.currentUser.id,
    allCharacters,
    activeRole,
  };
}

export const SelectAdventurersDialog = connect(mapStateToProps)(ASelectAdventurersDialog);
