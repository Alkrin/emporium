import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { CharacterData } from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { SavingThrowType } from "../../staticData/types/characterClasses";
import TooltipSource from "../TooltipSource";
import { AbilitiesList } from "./AbilitiesList";
import styles from "./CharacterSheet.module.scss";
import { EditEquipmentSubPanel } from "./EditEquipmentSubPanel";
import { EditHPDialog } from "./EditHPDialog";
import { EditProficienciesSubPanel } from "./EditProficienciesSubPanel";
import { EditXPDialog } from "./EditXPDialog";

interface ReactProps {
  characterId: number;
  exiting: boolean;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterSheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    return (
      <div className={`${styles.root} ${animationClass}`}>
        {this.props.characterId > 0 ? (
          <>
            <div
              className={styles.nameLabel}
            >{`${this.props.character.name}, L${this.props.character.level} ${this.props.character.class_name}`}</div>
            {this.renderStatsPanel()}
            {this.renderSavingThrowsPanel()}
            {this.renderSpeedPanel()}
            {this.renderEquipmentPanel()}
            {this.renderXPPanel()}
            {this.renderHPPanel()}
            {this.renderAbilitiesPanel()}
          </>
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
    );
  }

  private renderAbilitiesPanel(): React.ReactNode {
    return (
      <div className={styles.abilitiesPanel}>
        <div className={styles.row}>
          <div className={styles.abilitiesTitle}>{"Abilities and Proficiencies"}</div>
          <div className={styles.abilitiesEditButton} onClick={this.onEditAbilitiesClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <AbilitiesList characterId={this.props.character?.id ?? 0} />
      </div>
    );
  }

  private onEditAbilitiesClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "EditProficiencies",
        content: () => {
          return <EditProficienciesSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private renderXPPanel(): React.ReactNode {
    if (this.props.character) {
      const characterClass = AllClasses[this.props.character.class_name];
      const xpCap = characterClass.xpToLevel[this.props.character.level] ?? "∞";
      const needsLevelUp = this.props.character.xp >= xpCap;
      const levelUpStyle = needsLevelUp ? styles.levelUp : "";
      return (
        <div className={`${styles.xpPanel} ${levelUpStyle}`}>
          <div className={styles.row}>
            <div className={styles.xpTitle}>XP:</div>
            <div className={styles.xpNumbers}>
              <div className={`${styles.xpValue} ${levelUpStyle}`}>{this.props.character.xp}</div>
              <div className={styles.xpCap}>{`/ ${xpCap}`}</div>
            </div>
            <div className={styles.xpEditButton} onClick={this.onXPEditClicked.bind(this)} />
          </div>
          {needsLevelUp && (
            <div className={styles.levelUpButton} onClick={this.onLevelUpClicked.bind(this)}>
              Level Up!
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  }

  private renderHPPanel(): React.ReactNode {
    if (this.props.character) {
      const maxHP = this.props.character.hit_dice.reduce((a, b) => a + b, 0);
      const isDying = this.props.character.hp <= 0;
      const healthStyle = isDying ? styles.dying : "";
      return (
        <div className={`${styles.hpPanel} ${healthStyle}`}>
          <div className={styles.row}>
            <div className={styles.hpTitle}>HP:</div>
            <div className={styles.hpNumbers}>
              <div className={`${styles.hpValue} ${healthStyle}`}>{this.props.character.hp}</div>
              <div className={styles.hpCap}>{`/ ${maxHP}`}</div>
            </div>
            <div className={styles.hpEditButton} onClick={this.onHPEditClicked.bind(this)} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private onLevelUpClicked(): void {
    // TODO: Level Up dialog?
  }

  private onHPEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "hpEdit",
        content: () => {
          return <EditHPDialog />;
        },
        escapable: true,
      })
    );
  }

  private onXPEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "xpEdit",
        content: () => {
          return <EditXPDialog />;
        },
        escapable: true,
      })
    );
  }

  private renderSpeedPanel(): React.ReactNode {
    if (this.props.character) {
      // TODO: Calculate based on Encumbrance and the Running proficiency.
      const baseSpeed = 40;
      // TODO: Calculate encumbrance based on equipment slots.
      const fullStoneEncumbrance = 0;
      const partialStoneEncumbrance = 0;
      return (
        <div className={styles.speedPanel}>
          <div className={styles.row}>
            <div className={styles.speedTitle}>Speed</div>
            <div className={styles.speedValue}>{`${baseSpeed}' / ${baseSpeed * 3}'`}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.speedTitle}>Encumbrance</div>
            <div className={styles.speedValue}>{`${fullStoneEncumbrance}  ${partialStoneEncumbrance}/6`}</div>
            <div className={styles.speedStone}>stone</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderEquipmentPanel(): React.ReactNode {
    const acValue: number = 0;
    return (
      <div className={styles.equipmentPanel}>
        <div className={styles.row}>
          <div className={styles.abilitiesTitle}>{"Equipment"}</div>
          <div className={styles.equipmentEditButton} onClick={this.onEditEquipmentClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <div className={styles.row}>
          <div className={styles.acTitle}>AC:</div>
          <div className={styles.valueText}>{acValue}</div>
        </div>
      </div>
    );
  }

  private onEditEquipmentClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "EditEquipment",
        content: () => {
          return <EditEquipmentSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private renderSavingThrowsPanel(): React.ReactNode {
    return (
      <div className={styles.savingThrowsPanel}>
        <div className={styles.savingThrowsText}>Saves</div>
        <div className={styles.horizontalLine} />
        {this.renderSavingThrowsRow("Pet & Par", SavingThrowType.PetrificationAndParalysis)}
        {this.renderSavingThrowsRow("Psn & Dth", SavingThrowType.PoisonAndDeath)}
        {this.renderSavingThrowsRow("Blst & Br", SavingThrowType.BlastAndBreath)}
        {this.renderSavingThrowsRow("Stf & Wnd", SavingThrowType.StaffsAndWands)}
        {this.renderSavingThrowsRow("Spells", SavingThrowType.Spells)}
      </div>
    );
  }

  private renderSavingThrowsRow(name: string, type: SavingThrowType): React.ReactNode {
    if (this.props.character) {
      const characterClass = AllClasses[this.props.character.class_name];
      const baseValue = characterClass.savingThrows[type][this.props.character.level - 1];

      // TODO: Include things like Familiar (which is conditional?) or Divine Blessing proficiency bonuses.
      // TODO: Conditionals from items or consumables? Those herbs that increase your poison save?
      const finalValue = baseValue;
      return (
        <TooltipSource className={styles.row} tooltipParams={{ id: `stRow${name}`, content: type }}>
          <div className={styles.savingThrowsName}>{name}</div>
          <div className={styles.savingThrowsValue}>{finalValue}</div>
        </TooltipSource>
      );
    } else {
      return null;
    }
  }

  private renderStatsPanel(): React.ReactNode {
    return (
      this.props.character && (
        <div className={styles.statsPanel}>
          {this.renderStatPane("STR", this.props.character.strength, this.renderStrengthTooltip.bind(this))}
          {this.renderStatPane("INT", this.props.character.intelligence, this.renderIntelligenceTooltip.bind(this))}
          {this.renderStatPane("WIS", this.props.character.wisdom, this.renderWisdomTooltip.bind(this))}
          {this.renderStatPane("DEX", this.props.character.dexterity, this.renderDexterityTooltip.bind(this))}
          {this.renderStatPane("CON", this.props.character.constitution, this.renderConstitutionTooltip.bind(this))}
          {this.renderStatPane("CHA", this.props.character.charisma, this.renderCharismaTooltip.bind(this))}
        </div>
      )
    );
  }

  private renderStatPane(name: string, value: number, renderTooltip: () => React.ReactNode): React.ReactNode {
    const bonus = this.bonusForStat(value);
    const bonusText = `${bonus > 0 ? "+" : ""}${bonus}`;

    return (
      <TooltipSource className={styles.statPanel} tooltipParams={{ id: `${name}Tooltip`, content: renderTooltip }}>
        <div className={styles.statName}>{name}</div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statBonus}>{bonusText}</div>
      </TooltipSource>
    );
  }

  private renderStrengthTooltip(): React.ReactNode {
    return "Strength";
  }

  private renderIntelligenceTooltip(): React.ReactNode {
    return "Intelligence";
  }

  private renderWisdomTooltip(): React.ReactNode {
    return "Wisdom";
  }

  private renderDexterityTooltip(): React.ReactNode {
    return "Dexterity";
  }

  private renderConstitutionTooltip(): React.ReactNode {
    return "Constitution";
  }

  private renderCharismaTooltip(): React.ReactNode {
    return "Charisma";
  }

  private bonusForStat(value: number) {
    if (value <= 3) return -3;
    if (value <= 5) return -2;
    if (value <= 8) return -1;
    if (value <= 12) return 0;
    if (value <= 15) return 1;
    if (value <= 17) return 2;
    if (value <= 18) return 3;

    return 0;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    character: state.characters.characters[props.characterId ?? 1] ?? null,
  };
}

export const CharacterSheet = connect(mapStateToProps)(ACharacterSheet);
