import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { setActiveCharacterId } from "../../redux/charactersSlice";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { CharacterData } from "../../serverAPI";
import styles from "./CharactersList.module.scss";
import { CreateCharacterSubPanel } from "./CreateCharacterSubPanel";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAliveStatus,
  FilterValueAny,
  FilterValues,
  isFilterMetAliveStatus,
  isFilterMetLocation,
  isFilterMetOwner,
  isFilterMetProficiency,
} from "../FilterDropdowns";

interface State {
  filters: FilterValues;
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  activeCharacterId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharactersList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        [FilterType.Owner]: FilterValueAny,
        [FilterType.Location]: FilterValueAny,
        [FilterType.AliveStatus]: FilterValueAliveStatus.Alive,
        [FilterType.Proficiency]: FilterValueAny,
      },
    };
  }

  render(): React.ReactNode {
    const characters = this.sortPermittedCharacters();

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.newCharacterButton} onClick={this.onCreateNewClicked.bind(this)}>
            Add New Character
          </div>
          Filters
          <div className={styles.filtersContainer}>
            <FilterDropdowns
              filterOrder={[
                [FilterType.Owner, FilterType.AliveStatus],
                [FilterType.Location, FilterType.Proficiency],
              ]}
              filterValues={this.state.filters}
              onFilterChanged={(filters) => {
                this.setState({ filters });
              }}
            />
          </div>
        </div>
        <div className={styles.listContainer}>
          {characters.map((character, index) => {
            return this.renderCharacterRow(character, index);
          })}
        </div>
      </div>
    );
  }

  private renderCharacterRow(character: CharacterData, index: number): React.ReactNode {
    const selectedClass = character.id === this.props.activeCharacterId ? styles.selected : "";

    const characterClass = AllClasses[character.class_name];
    const xpCap = characterClass.xpToLevel[character.level] ?? "∞";
    const needsLevelUp = character.xp >= xpCap;
    const levelUpClass = needsLevelUp ? styles.levelUp : "";

    return (
      <div
        className={`${styles.listRow} ${selectedClass} ${levelUpClass}`}
        key={`charRow${index}`}
        onClick={this.onCharacterRowClick.bind(this, character.id)}
      >
        <div className={styles.listName}>{character.name}</div>
        <div className={styles.listLevel}>L{character.level}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.editButton} onClick={this.onCharacterEditClick.bind(this, character.id)} />
      </div>
    );
  }

  private onCharacterRowClick(characterId: number): void {
    if (this.props.activeCharacterId !== characterId) {
      this.props.dispatch?.(setActiveCharacterId(characterId));
    }
  }

  private onCharacterEditClick(characterId: number): void {
    // Editing also selects the character.
    this.onCharacterRowClick(characterId);
    // Open the characterCreator in edit mode.
    this.props.dispatch?.(
      showSubPanel({
        id: "EditCharacter",
        content: () => {
          return <CreateCharacterSubPanel isEditMode />;
        },
        escapable: true,
      })
    );
  }

  private sortPermittedCharacters(): CharacterData[] {
    const permittedCharacters = Object.values(this.props.characters).filter((character) => {
      return this.props.activeRole !== "player" || character.user_id === this.props.currentUserId;
    });

    const filteredCharacters = permittedCharacters.filter((character) => {
      // Apply Owner filter.
      if (!isFilterMetOwner(this.state.filters, character.user_id)) {
        return false;
      }

      // Apply Alive/Dead filter.
      if (!isFilterMetAliveStatus(this.state.filters, character)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, character.location_id)) {
        return false;
      }

      // Apply Proficiency filter.
      if (!isFilterMetProficiency(this.state.filters, character.id)) {
        return false;
      }

      return true;
    });

    filteredCharacters.sort((charA, charB) => {
      return charA.name.localeCompare(charB.name);
    });

    return filteredCharacters;
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateNewCharacter",
        content: () => {
          return <CreateCharacterSubPanel />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { activeCharacterId } = state.characters;

  return {
    ...props,
    characters: state.characters.characters,
    activeRole,
    currentUserId: state.user.currentUser.id,
    activeCharacterId,
  };
}

export const CharactersList = connect(mapStateToProps)(ACharactersList);
