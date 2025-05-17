import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterTroopLeadershipSection.module.scss";
import {
  AbilityComponentInstance,
  BonusCalculations,
  getAbilityComponentInstanceSourceName,
  getCharacterStatv2,
  getStatBonusForValue,
} from "../../../lib/characterUtils";
import { CharacterStat } from "../../../staticData/types/characterClasses";
import {
  AbilityComponentTroopLeadershipBonusStatic,
  AbilityComponentTroopLeadershipBonusStaticData,
} from "../../../staticData/abilityComponents/AbilityComponentTroopLeadershipBonusStatic";
import BonusTooltip from "../../BonusTooltip";
import { TooltipBonusCalculationsPanel } from "../../TooltipBonusCalculationsPanel";
import {
  AbilityComponentTroopStrategyBonus,
  AbilityComponentTroopStrategyBonusData,
} from "../../../staticData/abilityComponents/AbilityComponentTroopStrategyBonus";
import {
  AbilityComponentTroopMoraleBonusStatic,
  AbilityComponentTroopMoraleBonusStaticData,
} from "../../../staticData/abilityComponents/AbilityComponentTroopMoraleBonusStatic";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterTroopLeadershipSection extends React.Component<Props> {
  render(): React.ReactNode {
    const leadershipCalc = this.calculateLeadershipAbility();
    const strategicCalc = this.calculateStrategicAbility();
    const moraleCalc = this.calculateMoraleModifier();

    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Troop Leadership"}</div>
        <div className={styles.horizontalLine} />
        <TooltipSource
          className={styles.centeredRow}
          tooltipParams={{ id: "Leadership", content: this.renderLeadershipTooltip.bind(this, leadershipCalc) }}
        >
          <div className={styles.categoryTitle}>{"Leadership Ability"}</div>
          <div className={styles.categoryValue}>{leadershipCalc.bonus}</div>
        </TooltipSource>
        <TooltipSource
          className={styles.centeredRow}
          tooltipParams={{ id: "Strategic", content: this.renderStrategicTooltip.bind(this, strategicCalc) }}
        >
          <div className={styles.categoryTitle}>{"Strategic Ability"}</div>
          <div className={styles.categoryValue}>{`${strategicCalc.bonus > 0 ? "+" : ""}${strategicCalc.bonus}`}</div>
        </TooltipSource>
        <TooltipSource
          className={styles.centeredRow}
          tooltipParams={{ id: "Morale", content: this.renderMoraleTooltip.bind(this, moraleCalc) }}
        >
          <div className={styles.categoryTitle}>{"Morale Modifier"}</div>
          <div className={styles.categoryValue}>{`${moraleCalc.bonus > 0 ? "+" : ""}${moraleCalc.bonus}`}</div>
        </TooltipSource>
      </div>
    );
  }

  private calculateLeadershipAbility(): BonusCalculations {
    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Base
    calc.bonus = 4;
    calc.sources.push({ name: "Base", value: 4 });

    // Charisma Bonus
    const chaValue = getCharacterStatv2(this.props.character, CharacterStat.Charisma, this.props.activeComponents);
    const chaBonus = getStatBonusForValue(chaValue);
    calc.bonus += chaBonus;
    calc.sources.push({ name: "Charisma Bonus", value: chaBonus });

    // Leadership Ability bonus (e.g. Leadership Proficiency)
    this.props.activeComponents[AbilityComponentTroopLeadershipBonusStatic.id]?.forEach((instance) => {
      const instanceData = instance.data as AbilityComponentTroopLeadershipBonusStaticData;
      calc.bonus += instanceData.bonus;
      calc.sources.push({ name: getAbilityComponentInstanceSourceName(instance), value: instanceData.bonus });
    });

    // Cap of +8.
    if (calc.bonus > 8) {
      calc.sources.push({ name: "Max Leadership Ability is 8", value: 8 - calc.bonus });
      calc.bonus = 8;
    }

    // Conditional penalty if serving as an Adjutant (e.g. you do the practical leading, but technically someone else is the leader)
    calc.conditionalSources.push({ name: "Delegation Penalty", value: -1, condition: "If serving as an adjutant" });

    return calc;
  }

  private calculateStrategicAbility(): BonusCalculations {
    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Int and Will Bonuses
    const intValue = getCharacterStatv2(this.props.character, CharacterStat.Intelligence, this.props.activeComponents);
    const intMod = getStatBonusForValue(intValue);
    const willValue = getCharacterStatv2(this.props.character, CharacterStat.Will, this.props.activeComponents);
    const willMod = getStatBonusForValue(willValue);

    // Military Strategy bonuses.
    this.props.activeComponents[AbilityComponentTroopStrategyBonus.id]?.forEach((instance) => {
      const instanceData = instance.data as AbilityComponentTroopStrategyBonusData;
      const bonus = instanceData.bonus_by_rank[instance.rank];
      calc.bonus += bonus;
      calc.sources.push({ name: getAbilityComponentInstanceSourceName(instance), value: bonus });
    });

    // Wisdom (better of Int and Will bonuses, never negative)
    const wisdom = Math.max(0, intMod, willMod);
    calc.bonus += wisdom;
    calc.sources.push({ name: "Wisdom (Better of Will/Int Bonuses)", value: wisdom });

    // Foolishness (worse of Int and Will penalties, never positive)
    const foolishness = Math.min(0, intMod, willMod);
    calc.bonus += foolishness;
    calc.sources.push({ name: "Foolishness (Worse of Will/Int Penalties)", value: foolishness });

    // Cap of +6.
    if (calc.bonus > 6) {
      calc.sources.push({ name: "Max Strategic Ability is 6", value: 6 - calc.bonus });
      calc.bonus = 6;
    }
    // Floor of -3.
    if (calc.bonus < -3) {
      calc.sources.push({ name: "Min Strategic Ability is -3", value: -3 - calc.bonus });
      calc.bonus = -3;
    }

    // Conditional penalty if serving as an Adjutant (e.g. you do the practical leading, but technically someone else is the leader)
    calc.conditionalSources.push({ name: "Delegation Penalty", value: -1, condition: "If serving as an adjutant" });

    return calc;
  }

  private calculateMoraleModifier(): BonusCalculations {
    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Charisma Bonus
    const chaValue = getCharacterStatv2(this.props.character, CharacterStat.Charisma, this.props.activeComponents);
    const chaBonus = getStatBonusForValue(chaValue);
    calc.bonus += chaBonus;
    calc.sources.push({ name: "Charisma Bonus", value: chaBonus });

    // Command bonuses.
    this.props.activeComponents[AbilityComponentTroopMoraleBonusStatic.id]?.forEach((instance) => {
      const instanceData = instance.data as AbilityComponentTroopMoraleBonusStaticData;
      calc.bonus += instanceData.bonus;
      calc.sources.push({ name: getAbilityComponentInstanceSourceName(instance), value: instanceData.bonus });
    });

    // Conditional penalty if serving as an Adjutant (e.g. you do the practical leading, but technically someone else is the leader)
    calc.conditionalSources.push({ name: "Delegation Penalty", value: -1, condition: "If serving as an adjutant" });

    return calc;
  }

  private renderLeadershipTooltip(calc: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{"Leadership Ability"}</div>
          <div className={styles.tooltipValue}>{calc.bonus}</div>
        </div>
        <div className={styles.tooltipText}>{"The maximum number of units this\ncharacter can control."}</div>
        <TooltipBonusCalculationsPanel calc={calc} />
      </div>
    );
  }

  private renderStrategicTooltip(calc: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{"Strategic Ability"}</div>
          <div className={styles.tooltipValue}>{`${calc.bonus > 0 ? "+" : ""}${calc.bonus}`}</div>
        </div>
        <div className={styles.tooltipText}>
          {"Added to troop initiative rolls.\nGrants +0.5/1 BR to troops led at +3/+5 Strategic Ability."}
        </div>
        <TooltipBonusCalculationsPanel calc={calc} />
      </div>
    );
  }

  private renderMoraleTooltip(calc: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{"Morale Modifier"}</div>
          <div className={styles.tooltipValue}>{`${calc.bonus > 0 ? "+" : ""}${calc.bonus}`}</div>
        </div>
        <div className={styles.tooltipText}>{"Affects Unit Morale rolls, but not Unit Loyalty rolls."}</div>
        <TooltipBonusCalculationsPanel calc={calc} />
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    character,
  };
}

export const CharacterTroopLeadershipSection = connect(mapStateToProps)(ACharacterTroopLeadershipSection);
