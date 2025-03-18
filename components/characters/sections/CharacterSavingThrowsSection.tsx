import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterClassv2, CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterSavingThrowsSection.module.scss";
import {
  AbilityComponentInstance,
  BonusCalculations,
  getAbilityComponentInstanceSourceName,
} from "../../../lib/characterUtils";
import { SavingThrowType, sortedSavingThrowTypes } from "../../../staticData/types/characterClasses";
import { TooltipBonusCalculationsPanel } from "../../TooltipBonusCalculationsPanel";
import {
  AbilityComponentSavingThrowBonusStatic,
  AbilityComponentSavingThrowBonusStaticData,
} from "../../../staticData/abilityComponents/AbilityComponentSavingThrowBonusStatic";
import {
  AbilityComponentSavingThrowBonusConditional,
  AbilityComponentSavingThrowBonusConditionalData,
} from "../../../staticData/abilityComponents/AbilityComponentSavingThrowBonusConditional";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  characterClass: CharacterClassv2;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterSavingThrowsSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.savingThrowsText}>{"Saves"}</div>
        <div className={styles.horizontalLine} />
        {sortedSavingThrowTypes.map(this.renderThrowRow.bind(this))}
      </div>
    );
  }

  private renderThrowRow(throwType: SavingThrowType, index: number): React.ReactNode {
    const calc: BonusCalculations = this.getBonusCalculations(throwType);
    const baseThrow = this.props.characterClass.saving_throws[throwType][this.props.character.level - 1];
    // Bonuses effectively reduce the target value, so we subtract instead of adding.
    const finalThrow = baseThrow - calc.bonus;

    return (
      <TooltipSource
        className={styles.row}
        tooltipParams={{
          id: `${throwType}Tooltip`,
          content: this.renderTooltip.bind(this, throwType, calc, baseThrow),
        }}
        key={index}
      >
        <div className={styles.savingThrowsName}>{throwType}</div>
        <div className={styles.savingThrowsValue}>
          {`${finalThrow}+`}
          {calc.conditionalSources.length > 0 || calc.sources.length > 0 ? (
            <span className={styles.infoAsterisk}>{"*"}</span>
          ) : null}
        </div>
      </TooltipSource>
    );
  }

  private renderTooltip(throwType: SavingThrowType, calc: BonusCalculations, baseThrow: number): React.ReactNode {
    return (
      <div className={styles.combatTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{throwType}</div>
          <div className={styles.tooltipValue}>{`${baseThrow - calc.bonus}+`}</div>
        </div>
        <div className={styles.tooltipDivider} />
        <div className={styles.tooltipSourceRow}>
          <div className={styles.tooltipSource}>{"Base Target"}</div>
          <div className={styles.tooltipSourceValue}>{`${baseThrow}+`}</div>
        </div>
        <TooltipBonusCalculationsPanel calc={calc} />
      </div>
    );
  }

  private getBonusCalculations(throwType: SavingThrowType): BonusCalculations {
    const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };

    // Reaction Roll Bonuses
    (this.props.activeComponents[AbilityComponentSavingThrowBonusStatic.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentSavingThrowBonusStaticData;
        if (instanceData.throw_types.includes(throwType)) {
          const name = getAbilityComponentInstanceSourceName(instance);
          calc.sources.push({ name, value: instanceData.bonus });
          calc.bonus += instanceData.bonus;
        }
      }
    );

    // Conditional Reaction Roll Bonuses
    (this.props.activeComponents[AbilityComponentSavingThrowBonusConditional.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentSavingThrowBonusConditionalData;
        if (instanceData.throw_types.includes(throwType)) {
          const name = getAbilityComponentInstanceSourceName(instance);
          calc.conditionalSources.push({
            name,
            value: instanceData.bonus,
            condition: instanceData.condition,
          });
        }
      }
    );

    return calc;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  const characterClass = state.gameDefs.characterClasses[character?.class_id ?? 0] ?? null;

  return {
    ...props,
    character,
    characterClass,
  };
}

export const CharacterSavingThrowsSection = connect(mapStateToProps)(ACharacterSavingThrowsSection);
