import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectAdventurerDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { CharacterAlignment, CharacterData, emptyEquipmentData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";

interface State {
  selectedAdventurerId: number;
}

interface ReactProps {
  preselectedAdventurerId: number;
  onSelectionConfirmed: (adventurerId: number) => Promise<void>;
}

interface InjectedProps {
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectAdventurerDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedAdventurerId: props.preselectedAdventurerId,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Adventurer"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderAdventurerRow(
                {
                  id: 0,
                  user_id: this.props.currentUserId,
                  name: "---",
                  gender: "o",
                  alignment: CharacterAlignment.Lawful,
                  portrait_url: "",
                  class_name: "",
                  class_id: 0,
                  subclass_id: "",
                  level: 0,
                  strength: 0,
                  intelligence: 0,
                  will: 0,
                  dexterity: 0,
                  constitution: 0,
                  charisma: 0,
                  xp: 0,
                  hp: 0,
                  hit_dice: [],
                  henchmaster_id: 0,
                  remaining_cxp_deductible: 0,
                  cxp_deductible_date: "",
                  dead: false,
                  location_id: 0,
                  maintenance_paid: 0,
                  maintenance_date: "",
                  xp_reserve: 0,
                  proficiencies: [],
                  languages: [],
                  ...emptyEquipmentData,
                },
                -1
              )}
              {this.getSortedAdventurers().map(this.renderAdventurerRow.bind(this))}
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

  private renderAdventurerRow(adventurer: CharacterData, index: number): React.ReactNode {
    const selectedClass = adventurer.id === this.state.selectedAdventurerId ? styles.selected : "";
    const deadClass = adventurer.dead ? styles.dead : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass} ${deadClass}`}
        key={`adventurerRow${index}`}
        onClick={() => {
          this.setState({ selectedAdventurerId: adventurer.id });
        }}
      >
        <div className={styles.listName}>{adventurer.name}</div>
        <div className={styles.listLevel}>{adventurer.level ? `L${adventurer.level}` : ""}</div>
        <div className={styles.listClass}>{adventurer.class_name}</div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedAdventurerId);
    this.onCloseClicked();
  }

  private getSortedAdventurers(): CharacterData[] {
    const permittedAdventurers = Object.values(this.props.characters).filter((adventurer) => {
      return this.props.activeRole !== "player" || adventurer.user_id === this.props.currentUserId;
    });

    permittedAdventurers.sort((adventurerA, adventurerB) => {
      // Dead characters go last.
      const aDead = this.props.characters[adventurerA.id].dead;
      const bDead = this.props.characters[adventurerB.id].dead;
      if (aDead !== bDead) {
        if (aDead) {
          return 1;
        } else {
          return -1;
        }
      }

      // And an alphy sort when the others don't apply.
      const nameA = this.props.characters[adventurerA.id].name;
      const nameB = this.props.characters[adventurerB.id].name;

      return nameA.localeCompare(nameB);
    });

    return permittedAdventurers;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { characters } = state.characters;
  const currentUserId = state.user.currentUser.id;

  return {
    ...props,
    activeRole,
    characters,
    currentUserId,
  };
}

export const SelectAdventurerDialog = connect(mapStateToProps)(ASelectAdventurerDialog);
