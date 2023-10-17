import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { setActiveCharacterId } from "../../redux/charactersSlice";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { CharacterData, UserData } from "../../serverAPI";
import styles from "./CharactersList.module.scss";
import { CreateCharacterSubPanel } from "./CreateCharacterSubPanel";

type AliveOrDead = "Alive" | "Dead";

interface State {
  filterOwnerId: number;
  filterLocationId: number; // Location or Activity?
  filterAliveOrDead: AliveOrDead;
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  users: Dictionary<UserData>;
  activeCharacterId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharactersList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filterOwnerId: -1,
      filterLocationId: -1,
      filterAliveOrDead: "Alive",
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
            </select>
          </div>
          <div className={styles.filtersContainer}>
            <div className={styles.filterText}>Status</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterAliveOrDead}
              onChange={(e) => {
                this.setState({ filterAliveOrDead: e.target.value as AliveOrDead });
              }}
            >
              <option value={"Alive"}>Alive</option>
              <option value={"Dead"}>Dead</option>
            </select>
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
    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
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

  private sortPermittedCharacters(): CharacterData[] {
    const permittedCharacters = Object.values(this.props.characters).filter((character) => {
      return this.props.activeRole !== "player" || character.user_id === this.props.currentUserId;
    });

    const filteredCharacters = permittedCharacters.filter((character) => {
      const matchesOwner = this.state.filterOwnerId === -1 || character.user_id === this.state.filterOwnerId;
      const matchesAliveOrDead =
        (this.state.filterAliveOrDead === "Alive" && !character.dead) ||
        (this.state.filterAliveOrDead === "Dead" && character.dead);

      // TODO: Update this once locations are implemented.
      const matchesLocation = this.state.filterLocationId === -1 || true;

      return matchesOwner && matchesAliveOrDead && matchesLocation;
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
  const { users } = state.user;
  const { activeCharacterId } = state.characters;
  return {
    ...props,
    characters: state.characters.characters,
    activeRole,
    currentUserId: state.user.currentUser.id,
    users,
    activeCharacterId,
  };
}

export const CharactersList = connect(mapStateToProps)(ACharactersList);
