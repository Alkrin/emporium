import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./HenchmanHierarchySubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import ServerAPI, { CharacterData } from "../../serverAPI";
import {
  BonusCalculations,
  getMaxMinionCountForCharacter,
  getRecruitmentRollBonusForCharacter,
  randomInt,
} from "../../lib/characterUtils";
import DropTarget from "../DropTarget";
import TooltipSource from "../TooltipSource";
import { setHenchmaster } from "../../redux/charactersSlice";
import { showToaster } from "../../redux/toastersSlice";
import Draggable from "../Draggable";
import DraggableHandle from "../DraggableHandle";
import BonusTooltip from "../BonusTooltip";

const DropTypeMinion = "Minion";

interface State {
  selectedCharacterId: number;
  recruitmentRollResult: string;
}

interface ReactProps {}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AHenchmanHierarchySubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedCharacterId: 0,
      recruitmentRollResult: "",
    };
  }

  render(): React.ReactNode {
    const recruitmentRoll = getRecruitmentRollBonusForCharacter(this.state.selectedCharacterId);
    const hasConditionalBonuses = recruitmentRoll.conditionalSources.length > 0;

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{"Henchman Hierarchy"}</div>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.subtitleLabel}>{"All Characters"}</div>
            <div className={styles.allCharactersListContainer}>
              <div className={styles.allCharactersListSectionHeader}>{"Independents"}</div>
              {this.getSortedIndependents().map(this.renderCharacterRow.bind(this))}
              <div className={styles.allCharactersListSectionHeader}>{"Minions"}</div>
              {this.getSortedMinions().map(this.renderCharacterRow.bind(this))}
            </div>
          </div>
          {this.state.selectedCharacterId > 0 ? (
            <div className={styles.hierarchyRoot}>
              <div className={styles.subtitleLabel}>{`Henchmaster: ${
                this.props.allCharacters[this.state.selectedCharacterId].name
              }`}</div>
              <div className={styles.recruitmentRollContainer}>
                <TooltipSource
                  tooltipParams={{
                    id: "InitiativeExplanation",
                    content: () => {
                      return <BonusTooltip header={"Recruitment Roll Bonus"} calc={recruitmentRoll} />;
                    },
                  }}
                  className={styles.recruitmentRollTitle}
                >
                  {`Recruitment Roll Bonus : ${recruitmentRoll.totalBonus > 0 ? "+" : ""}${recruitmentRoll.totalBonus}`}
                  {hasConditionalBonuses ? <span className={styles.infoAsterisk}>*</span> : null}
                </TooltipSource>
                <div className={styles.rollDiceButton} onClick={this.onRollRecruitment.bind(this, recruitmentRoll)} />
                <div className={styles.recruitmentRollResult}>{this.state.recruitmentRollResult}</div>
              </div>
              <div className={styles.titleLabel}>{"Henchmen"}</div>
              {this.renderMinionSlots()}
            </div>
          ) : null}
        </div>
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderCharacterRow(character: CharacterData): React.ReactNode {
    const draggableId = `DragCharacter:${character.id}`;
    const selectedStyle = this.state.selectedCharacterId === character.id ? styles.selected : "";
    return (
      <Draggable
        className={`${styles.allCharactersListRow} ${selectedStyle}`}
        draggableId={draggableId}
        key={draggableId}
      >
        <DraggableHandle
          className={styles.characterRowDraggableHandle}
          draggableId={draggableId}
          dropTypes={[DropTypeMinion]}
          draggingRender={() => {
            return this.renderCharacterRowContents(character);
          }}
          dropHandler={(dropTargetIds) => {
            this.handleCharacterDropped(dropTargetIds[0], character);
          }}
          onClick={() => {
            this.setState({ selectedCharacterId: character.id, recruitmentRollResult: "" });
          }}
        ></DraggableHandle>
        {this.renderCharacterRowContents(character)}
      </Draggable>
    );
  }

  private onRollRecruitment(calc: BonusCalculations): void {
    // 2d6 + bonus.
    const total = randomInt(1, 6) + randomInt(1, 6) + calc.totalBonus;

    if (total <= 2) {
      this.setState({ recruitmentRollResult: `${total} : Refuse & Slander` });
    } else if (total <= 5) {
      this.setState({ recruitmentRollResult: `${total} : Refuse` });
    } else if (total <= 8) {
      this.setState({ recruitmentRollResult: `${total} : Try Again` });
    } else if (total <= 11) {
      this.setState({ recruitmentRollResult: `${total} : Accept` });
    } else if (total >= 12) {
      this.setState({ recruitmentRollResult: `${total} : Accept With Élan` });
    }
  }

  private async handleCharacterDropped(dropTargetId: string | null, character: CharacterData): Promise<void> {
    // If the character was dropped into open space, we don't have to do anything.
    if (!dropTargetId || dropTargetId.length === 0) {
      return;
    }

    const minionIndex = +dropTargetId.slice(6);
    const minions = this.getMinions(this.state.selectedCharacterId);

    // If there's already a minion in that slot, do nothing.
    if (minionIndex < minions.length) {
      return;
    }

    // If the character already has a henchmaster, do nothing.
    if (character.henchmaster_id !== 0) {
      this.showErrorToaster(
        `${character.name} is already the henchman of ${this.props.allCharacters[character.henchmaster_id].name}!`
      );
      return;
    }

    // If the dropped character is the henchmaster, do nothing.  Can't be your own minion!
    if (character.id === this.state.selectedCharacterId) {
      this.showErrorToaster("A character cannot be its own minion!");
      return;
    }

    // If setting this character as a minion would create a cycle in the graph, say no.
    if (!this.canBecomeMinion(character.id)) {
      this.showErrorToaster("Adding that character as a minion would create an infinite hench loop!");
      return;
    }

    const res = await ServerAPI.setHenchmaster(this.state.selectedCharacterId, character.id);
    if ("error" in res) {
      this.showErrorToaster("A server error occurred.  Henchman not assigned.");
    } else {
      this.props.dispatch?.(
        setHenchmaster({ masterCharacterId: this.state.selectedCharacterId, minionCharacterId: character.id })
      );
    }
  }

  private canBecomeMinion(potentialMinionCharacterId: number): boolean {
    const potentialMinion = this.props.allCharacters[potentialMinionCharacterId];
    // Starting from the currently selected character, we will climb up the hierarchy to make sure we haven't created a cycle.
    let currentBoss = this.props.allCharacters[this.state.selectedCharacterId];
    do {
      // If the current boss is already a minion of this potential minion, then there would be a cycle in the graph.
      if (currentBoss.henchmaster_id === potentialMinion.id) {
        return false;
      }
      // If the current boss we are inspecting (inside the henchman hierarchy) has no master, then there is no cycle in the graph.
      if (currentBoss.henchmaster_id === 0) {
        return true;
      }
      // Otherwise, climb up the hierarchy and check again.
      currentBoss = this.props.allCharacters[currentBoss.henchmaster_id];

      // TODO: Do we need to check the opposite direction as well?
    } while (currentBoss);

    return false;
  }

  private showErrorToaster(message: string): void {
    this.props.dispatch?.(
      showToaster({
        content: () => {
          return <div className={styles.errorToaster}>{message}</div>;
        },
      })
    );
  }

  private renderCharacterRowContents(character: CharacterData): React.ReactNode {
    const minions = this.getMinions(character.id);
    const maxMinions = getMaxMinionCountForCharacter(character.id);
    const countStyle = minions.length === maxMinions.totalBonus ? styles.full : "";
    return (
      <div className={styles.characterRowContentWrapper}>
        <div className={styles.allCharactersListName}>{character.name}</div>
        <div className={styles.allCharactersListLevel}>L{character.level}</div>
        <div
          className={`${styles.allCharactersListMinionCount} ${countStyle}`}
        >{`${minions.length}/${maxMinions.totalBonus}`}</div>
        <div className={`${styles.allCharactersListGender} ${styles[character.gender]}`}>{character.gender}</div>
      </div>
    );
  }

  private renderMinionSlots(): React.ReactNode[] {
    const maxMinions = getMaxMinionCountForCharacter(this.state.selectedCharacterId);
    const minions = this.getMinions(this.state.selectedCharacterId);
    const slots: React.ReactNode[] = [];
    for (let i = 0; i < maxMinions.totalBonus; ++i) {
      slots.push(this.renderMinionSlotRow(minions[i], i, minions));
    }
    return slots;
  }

  private renderMinionSlotRow(character: CharacterData, index: number, minions: CharacterData[]): React.ReactNode {
    return (
      <div className={styles.minionSlotRow} key={`minionSlotRow${index}`}>
        <DropTarget dropTypes={[DropTypeMinion]} dropId={`Minion${index}`} className={styles.minionSlot}>
          {character && this.renderCharacterRowContents(character)}
        </DropTarget>
        {character && (
          <div className={styles.cancelButton} onClick={this.onRemoveMinionClicked.bind(this, character.id)} />
        )}
      </div>
    );
  }

  private async onRemoveMinionClicked(minionCharacterId: number): Promise<void> {
    const res = await ServerAPI.setHenchmaster(0, minionCharacterId);
    if ("error" in res) {
      this.props.dispatch?.(
        showToaster({
          id: "ServerError",
          content: { title: "Server Error", message: res.error },
        })
      );
    } else {
      this.props.dispatch?.(setHenchmaster({ masterCharacterId: 0, minionCharacterId }));
    }
  }

  private getSortedIndependents(): CharacterData[] {
    const independents: CharacterData[] = Object.values(this.props.allCharacters).filter((character) => {
      const hasNoMaster = character.henchmaster_id === 0;
      const isAlive = !character.dead;
      // TODO: Filter for current player and active role?
      return hasNoMaster && isAlive;
    });

    independents.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return independents;
  }

  private getSortedMinions(): CharacterData[] {
    const minions: CharacterData[] = Object.values(this.props.allCharacters).filter((character) => {
      const isMinion = character.henchmaster_id !== 0;
      const isAlive = !character.dead;
      // TODO: Filter for current player and active role?
      return isMinion && isAlive;
    });

    minions.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return minions;
  }

  private getMinions(characterId: number): CharacterData[] {
    return Object.values(this.props.allCharacters).filter((character) => {
      return character.henchmaster_id === characterId;
    });
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  return {
    ...props,
    allCharacters,
  };
}

export const HenchmanHierarchySubPanel = connect(mapStateToProps)(AHenchmanHierarchySubPanel);
