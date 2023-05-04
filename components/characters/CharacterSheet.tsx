import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { CharacterData, ItemData, ItemDefData } from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { SavingThrowType } from "../../staticData/types/characterClasses";
import TooltipSource from "../TooltipSource";
import { AbilitiesList } from "./AbilitiesList";
import styles from "./CharacterSheet.module.scss";
import { EditEquipmentSubPanel } from "./EditEquipmentSubPanel";
import { EditHPDialog } from "./EditHPDialog";
import { EditProficienciesSubPanel } from "./EditProficienciesSubPanel";
import { EditXPDialog } from "./EditXPDialog";
import { Dictionary } from "../../lib/dictionary";
import { Stones, StonesToNumber, getTotalEquippedWeight } from "../../lib/itemUtils";
import { getBonusForStat, getCharacterMaxEncumbrance, getCharacterMaxHP } from "../../lib/characterUtils";

interface ReactProps {
  characterId: number;
  exiting: boolean;
}

interface InjectedProps {
  allItems: Dictionary<ItemData>;
  allItemDefs: Dictionary<ItemDefData>;
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
      const maxHP = getCharacterMaxHP(this.props.character);
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

  private getBaseSpeedForEncumbrance(encumbrance: Stones): number {
    // Calculate speed based on Encumbrance.
    // TODO: Running proficiency.  Plus, Thrassians are always at 20 or less?
    const maxEncumbrance: Stones = getCharacterMaxEncumbrance(this.props.character);

    let speed = 40;

    if (StonesToNumber(encumbrance) > StonesToNumber(maxEncumbrance)) {
      speed = 0;
    } else if (StonesToNumber(encumbrance) > StonesToNumber([10, 0])) {
      speed = 10;
    } else if (StonesToNumber(encumbrance) > StonesToNumber([7, 0])) {
      speed = 20;
    } else if (StonesToNumber(encumbrance) > StonesToNumber([5, 0])) {
      speed = 30;
    }

    return speed;
  }

  private renderSpeedPanel(): React.ReactNode {
    if (this.props.character) {
      // Calculate encumbrance based on equipment slots.
      const encumbrance = getTotalEquippedWeight(this.props.character, this.props.allItems, this.props.allItemDefs);
      const [fullStoneEncumbrance, partialStoneEncumbrance] = encumbrance;
      const speed = this.getBaseSpeedForEncumbrance(encumbrance);

      return (
        <TooltipSource
          tooltipParams={{
            id: "SpeedExplanation",
            content: this.renderSpeedTooltip.bind(this),
          }}
          className={styles.speedPanel}
        >
          <div className={styles.row}>
            <div className={styles.speedTitle}>Speed</div>
            <div className={styles.speedValue}>{`${speed}' / ${speed * 3}'`}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.speedTitle}>Encumbrance</div>
            <div className={styles.speedValue}>{`${fullStoneEncumbrance}${
              partialStoneEncumbrance > 0 ? `  ${partialStoneEncumbrance}/6` : ""
            }`}</div>
            <div className={styles.speedStone}>stone</div>
          </div>
        </TooltipSource>
      );
    } else {
      return null;
    }
  }

  private renderEquipmentPanel(): React.ReactNode {
    const equippedArmorAC =
      this.props.allItemDefs[this.props.allItems[this.props.character?.slot_armor]?.def_id]?.ac ?? 0;
    const equippedShieldAC =
      this.props.allItemDefs[this.props.allItems[this.props.character?.slot_shield]?.def_id]?.ac ?? 0;
    const dexBonus = getBonusForStat(this.props.character.dexterity);
    // TODO: Proficiencies and abilities that grant armor.
    // TODO: Conditional boosts?
    const acValue: number = equippedArmorAC + equippedShieldAC + dexBonus;
    return (
      <div className={styles.equipmentPanel}>
        <div className={styles.row}>
          <div className={styles.abilitiesTitle}>{"Equipment"}</div>
          <div className={styles.equipmentEditButton} onClick={this.onEditEquipmentClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <TooltipSource
          tooltipParams={{
            id: "ACExplanation",
            content: this.renderACTooltip.bind(this),
          }}
          className={styles.row}
        >
          <div className={styles.acTitle}>AC:</div>
          <div className={styles.valueText}>{acValue}</div>
        </TooltipSource>
      </div>
    );
  }

  private renderACTooltip(): React.ReactNode {
    const equippedArmor = this.props.allItemDefs[this.props.allItems[this.props.character?.slot_armor]?.def_id];
    const equippedArmorAC = equippedArmor?.ac ?? 0;

    const equippedShield = this.props.allItemDefs[this.props.allItems[this.props.character?.slot_shield]?.def_id];
    const equippedShieldAC = equippedShield?.ac ?? 0;

    const dexBonus = getBonusForStat(this.props.character.dexterity);

    // TODO: Proficiencies and abilities that grant armor.
    // TODO: Conditional boosts?

    const acValue: number = equippedArmorAC + equippedShieldAC + dexBonus;

    return (
      <div className={styles.acTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.acTooltipTitle}>Total AC:</div>
          <div className={styles.acTooltipValue}>{acValue}</div>
        </div>
        <div className={styles.acTooltipDivider} />
        {equippedArmor && (
          <div className={styles.acTooltipSourceRow}>
            <div className={styles.acTooltipSource}>{equippedArmor.name}</div>
            <div className={styles.acTooltipValue}>{equippedArmor.ac}</div>
          </div>
        )}
        {equippedShield && (
          <div className={styles.acTooltipSourceRow}>
            <div className={styles.acTooltipSource}>{equippedShield.name}</div>
            <div className={styles.acTooltipValue}>{equippedShield.ac}</div>
          </div>
        )}
        <div className={styles.acTooltipSourceRow}>
          <div className={styles.acTooltipSource}>Dex Bonus</div>
          <div className={styles.acTooltipSourceValue}>{`${dexBonus > 0 ? "+" : ""}${dexBonus}`}</div>
        </div>
      </div>
    );
  }

  private renderSpeedTooltip(): React.ReactNode {
    const maxEncumbrance: Stones = getCharacterMaxEncumbrance(this.props.character);
    const encumbrance = getTotalEquippedWeight(this.props.character, this.props.allItems, this.props.allItemDefs);
    const baseSpeed = this.getBaseSpeedForEncumbrance(encumbrance);
    // TODO: Running?  Thrassians?
    const lowEncumbranceStyle = baseSpeed === 40 ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const midEncumbranceStyle = baseSpeed === 30 ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const highEncumbranceStyle = baseSpeed === 20 ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const maxEncumbranceStyle = baseSpeed === 10 ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const immobileStyle = baseSpeed === 0 ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;

    return (
      <div className={styles.speedTooltipRoot}>
        <div className={styles.speedTooltipEncumbranceColumn}>
          <div className={styles.speedTooltipTitle}>Encumbrance</div>
          <div className={lowEncumbranceStyle}>5 stone or less</div>
          <div className={midEncumbranceStyle}>7 stone or less</div>
          <div className={highEncumbranceStyle}>10 stone or less</div>
          <div className={maxEncumbranceStyle}>{`${maxEncumbrance[0]} stone or less`}</div>
          <div className={immobileStyle}>{`More than ${maxEncumbrance[0]} stone`}</div>
        </div>
        <div className={styles.speedTooltipSpeedColumn}>
          <div className={styles.speedTooltipTitle}>Speed</div>
          <div className={lowEncumbranceStyle}>40' / 120'</div>
          <div className={midEncumbranceStyle}>30' / 90'</div>
          <div className={highEncumbranceStyle}>20' / 60'</div>
          <div className={maxEncumbranceStyle}>10' / 30'</div>
          <div className={immobileStyle}>0' / 0'</div>
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
    const bonus = getBonusForStat(value);
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
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allItems } = state.items;
  const allItemDefs = state.gameDefs.items;
  return {
    ...props,
    allItems,
    allItemDefs,
    character: state.characters.characters[props.characterId ?? 1] ?? null,
  };
}

export const CharacterSheet = connect(mapStateToProps)(ACharacterSheet);
