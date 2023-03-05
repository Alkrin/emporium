import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { CharacterData } from "../../serverAPI";
import TooltipSource from "../TooltipSource";
import styles from "./CharactersList.module.scss";
import { CreateCharacterSubPanel } from "./CreateCharacterSubPanel";

interface State {
  filterOwnerId: number;
  filterLocationId: number; // Location or Activity?
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharactersList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filterOwnerId: -1,
      filterLocationId: -1,
    };
  }

  render(): React.ReactNode {
    const characters = this.sortPermittedCharacters();
    const ownerName: string = this.state.filterOwnerId === -1 ? "Any" : "WIP";
    const locationName: string =
      this.state.filterLocationId === -1 ? "Any" : "WIP";

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div
            className={styles.newCharacterButton}
            onClick={this.onCreateNewClicked.bind(this)}
          >
            Add New Character
          </div>
          Right-click to set Filters
          <div className={styles.filtersContainer}>
            <TooltipSource
              className={styles.filterButton}
              tooltipParams={{ id: "OwnerFilter", content: "Owner" }}
            ></TooltipSource>
            <div className={styles.filterText}>{`Owner: ${ownerName}`}</div>
            <TooltipSource
              className={styles.filterButton}
              tooltipParams={{ id: "LocationFilter", content: "Location" }}
            ></TooltipSource>
            <div
              className={styles.filterText}
            >{`Location: ${locationName}`}</div>
          </div>
        </div>
        <div className={styles.listContainer}>
          {characters.map((character, index) => {
            return (
              <div className={styles.listRow} key={`charRow${index}`}>
                {character.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  private sortPermittedCharacters(): CharacterData[] {
    const permittedCharacters = Object.values(this.props.characters).filter(
      (character) => {
        return (
          this.props.activeRole !== "player" ||
          character.userId === this.props.currentUserId
        );
      }
    );

    const filteredCharacters = permittedCharacters.filter((character) => {
      const matchesOwner =
        this.state.filterOwnerId === -1 ||
        character.userId === this.state.filterOwnerId;

      // TODO: Update this once locations are implemented.
      const matchesLocation = this.state.filterLocationId === -1 || true;

      return matchesOwner && matchesLocation;
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
  return {
    ...props,
    characters: state.characters.characters,
    activeRole,
    currentUserId: state.user.currentUser.id,
  };
}

export const CharactersList = connect(mapStateToProps)(ACharactersList);
