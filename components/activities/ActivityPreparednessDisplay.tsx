import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { ActivityAdventurerParticipant, CharacterData, ItemData, ItemDefData } from "../../serverAPI";
import styles from "./ActivityPreparednessDisplay.module.scss";
import TooltipSource from "../TooltipSource";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { SpellType } from "../../staticData/types/characterClasses";
import { getAllCharacterAssociatedItemIds, isProficiencyUnlockedForCharacter } from "../../lib/characterUtils";
import { ProficiencyLayOnHands } from "../../staticData/proficiencies/ProficiencyLayOnHands";
import { Tag } from "../../lib/tags";

interface ReactProps {
  participants: ActivityAdventurerParticipant[];
  cellSizeVmin: number;
}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  allItems: Dictionary<ItemData>;
  itemDefs: Dictionary<ItemDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivityPreparednessDisplay extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        {this.renderPartySizeCell()}
        {this.renderArcaneCell()}
        {this.renderDivineCell()}
        {this.renderTurnUndeadCell()}
        {this.renderSneakCell()}
        {this.renderTrapsCell()}
        {this.renderMagicWeaponCell()}
        {this.renderSilverWeaponCell()}
      </div>
    );
  }

  private getCellStyle() {
    return { width: `${this.props.cellSizeVmin}vmin`, height: `${this.props.cellSizeVmin}vmin` };
  }

  private renderCountDisplay(count: number): React.ReactNode {
    if (count === 0) {
      return (
        <div className={styles.zeroCountIndicator} style={{ fontSize: `${this.props.cellSizeVmin * 0.22}vmin` }}>
          X
        </div>
      );
    } else {
      const dots: React.ReactNode[] = [];

      let angle = Math.PI / 2; // Wherever the top is, then rotate around clockwise.
      for (let i = 0; i < count && i < 8; ++i) {
        const left = 50 + Math.cos(angle) * 40;
        const top = 50 - Math.sin(angle) * 40;
        dots.push(
          <div className={styles.countIndicator} key={`dot${i}`} style={{ left: `${left}%`, top: `${top}%` }} />
        );
        angle -= Math.PI / 4;
      }

      return dots;
    }
  }

  private renderPartySizeCell(): React.ReactNode {
    let bonusText = "+0";
    if (this.props.participants.length >= 8) {
      bonusText = "+2";
    } else if (this.props.participants.length >= 5) {
      bonusText = "+1";
    }
    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "PartySizeCell",
          content: () => {
            return this.renderCellTooltip(
              "Party Size Bonus",
              this.props.participants.map((p) => {
                return p.characterId;
              })
            );
          },
        }}
      >
        <div className={styles.cellIcon}>
          <div className={styles.partySizeBonus} style={{ fontSize: `${this.props.cellSizeVmin * 0.32}vmin` }}>
            {bonusText}
          </div>
        </div>
        {this.renderCountDisplay(this.props.participants.length)}
      </TooltipSource>
    );
  }

  private renderArcaneCell(): React.ReactNode {
    const arcaneParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.isArcane;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "ArcaneCell",
          content: () => {
            return this.renderCellTooltip("Arcane Casters", arcaneParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconArcaneMagic.png"} />
        {this.renderCountDisplay(arcaneParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderDivineCell(): React.ReactNode {
    const divineParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.isDivine;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "DivineCell",
          content: () => {
            return this.renderCellTooltip("Divine Spell Users", divineParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconHealingMagic.png"} />
        {this.renderCountDisplay(divineParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderTurnUndeadCell(): React.ReactNode {
    const turnParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.canTurnUndead;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "TurnUndeadCell",
          content: () => {
            return this.renderCellTooltip("Turn Undead", turnParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconTurnUndead.png"} />
        {this.renderCountDisplay(turnParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderSneakCell(): React.ReactNode {
    const sneakParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.canSneak;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "SneakCell",
          content: () => {
            return this.renderCellTooltip("Sneak / Hide", sneakParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconSneak.png"} />
        {this.renderCountDisplay(sneakParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderTrapsCell(): React.ReactNode {
    const trapsParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.canFindTraps;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "TrapsCell",
          content: () => {
            return this.renderCellTooltip("Find / Remove Traps", trapsParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconTrapFinding.png"} />
        {this.renderCountDisplay(trapsParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderMagicWeaponCell(): React.ReactNode {
    const magicWeaponParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.hasMagicWeapons;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "MagicWeaponsCell",
          content: () => {
            return this.renderCellTooltip("Magic Weapons", magicWeaponParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconMagicWeapon.png"} />
        {this.renderCountDisplay(magicWeaponParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderSilverWeaponCell(): React.ReactNode {
    const silverWeaponParticipantIds: number[] = this.props.participants
      .filter((p) => {
        return p.hasSilverWeapons;
      })
      .map((p) => {
        return p.characterId;
      });

    return (
      <TooltipSource
        className={styles.cellContainer}
        style={this.getCellStyle()}
        tooltipParams={{
          id: "SilverWeaponsCell",
          content: () => {
            return this.renderCellTooltip("Silver Weapons", silverWeaponParticipantIds);
          },
        }}
      >
        <img className={styles.cellIcon} src={"/images/IconSilverWeapon.png"} />
        {this.renderCountDisplay(silverWeaponParticipantIds.length)}
      </TooltipSource>
    );
  }

  private renderCellTooltip(name: string, participants: number[]): React.ReactNode {
    return (
      <div className={styles.cellTooltipContainer}>
        <div className={styles.cellTooltipTitle}>{name}</div>
        {participants.map((pid) => {
          const participant = this.props.allCharacters[pid];
          return (
            <div className={styles.cellTooltipRow} key={`row${pid}`}>
              {participant.name}
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const allItems = state.items.allItems;
  const itemDefs = state.gameDefs.items;
  return {
    ...props,
    allCharacters,
    allItems,
    itemDefs,
  };
}

export const ActivityPreparednessDisplay = connect(mapStateToProps)(AActivityPreparednessDisplay);
