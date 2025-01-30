import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./CharacterEquipmentSection.module.scss";
import { AbilityDefData, CharacterClassv2, CharacterData, ItemData, ItemDefData } from "../../../serverAPI";
import { AbilityComponentInstance, BonusCalculations, getBonusForStat } from "../../../lib/characterUtils";
import { EditButton } from "../../EditButton";
import TooltipSource from "../../TooltipSource";
import { showSubPanel } from "../../../redux/subPanelsSlice";
import { EditEquipmentSubPanel } from "../dialogs/EditEquipmentSubPanel";
import BonusTooltip from "../../BonusTooltip";
import { AbilityComponentArmorStatic } from "../../../staticData/abilityComponents/AbilityComponentArmorStatic";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  characterClass: CharacterClassv2;
  itemDefs: Record<number, ItemDefData>;
  allItems: Record<number, ItemData>;
  abilityDefs: Record<number, AbilityDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterEquipmentSection extends React.Component<Props> {
  render(): React.ReactNode {
    let calc = this.getArmorBonusCalculations();

    return (
      <div className={styles.root}>
        <div className={styles.centeredRow}>
          <div className={styles.equipmentTitle}>{"Equipment"}</div>
          <EditButton className={styles.equipmentEditButton} onClick={this.onEditEquipmentClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <TooltipSource
          tooltipParams={{
            id: "ACExplanation",
            content: () => {
              return <BonusTooltip header={"AC"} calc={calc} isFlatValue={true} />;
            },
          }}
          className={styles.centeredRow}
        >
          <div className={styles.acTitle}>{"AC:"}</div>
          <div className={styles.valueText}>
            {calc.totalBonus}
            {calc.conditionalSources.length > 0 ? <span className={styles.infoAsterisk}>*</span> : null}
          </div>
        </TooltipSource>
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

  private getArmorBonusCalculations(): BonusCalculations {
    const { character, itemDefs, abilityDefs, allItems, activeComponents } = this.props;
    const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
    if (!character) {
      return calc;
    } else {
      const totalDexterity = character.dexterity;
      // TODO: Dex bonuses from components?
      calc.totalBonus = getBonusForStat(totalDexterity);
      calc.sources.push(["Dex Bonus", calc.totalBonus]);

      const equippedArmor = itemDefs[allItems[character?.slot_armor]?.def_id];
      if (equippedArmor) {
        const equippedArmorAC = (equippedArmor?.ac ?? 0) + (equippedArmor?.magic_bonus ?? 0);
        calc.totalBonus += equippedArmorAC;
        calc.sources.push([equippedArmor.name, equippedArmorAC]);
      }

      const equippedShield = itemDefs[allItems[character?.slot_shield]?.def_id];
      if (equippedShield) {
        const equippedShieldAC = (equippedShield?.ac ?? 0) + (equippedShield?.magic_bonus ?? 0);
        calc.totalBonus += equippedShieldAC;
        calc.sources.push([equippedShield.name, equippedShieldAC]);
      }

      // Ability components that grant armor.
      if ((activeComponents[AbilityComponentArmorStatic.id]?.length ?? 0) > 0) {
        activeComponents[AbilityComponentArmorStatic.id].forEach((instance) => {
          calc.totalBonus += instance.data.bonus;
          let sourceName = "Unknown";
          if (abilityDefs[instance.abilityId]) {
            sourceName = abilityDefs[instance.abilityId].name;
          }
          // TODO: sourceName from items?
          calc.sources.push([sourceName, instance.data.bonus]);
        });
      }

      return calc;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { items: itemDefs, abilities: abilityDefs } = state.gameDefs;
  const { allItems } = state.items;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  const characterClass = state.gameDefs.characterClasses[character?.class_id] ?? null;
  return {
    ...props,
    character,
    characterClass,
    itemDefs,
    allItems,
    abilityDefs,
  };
}

export const CharacterEquipmentSection = connect(mapStateToProps)(ACharacterEquipmentSection);
