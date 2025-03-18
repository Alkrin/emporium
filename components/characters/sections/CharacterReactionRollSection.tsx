import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterReactionRollSection.module.scss";
import {
  AbilityComponentInstance,
  getStatBonusForValue,
  getBonusString,
  getCharacterStatv2,
  getAbilityComponentInstanceSourceName,
  BonusCalculations,
} from "../../../lib/characterUtils";
import { CharacterStat } from "../../../staticData/types/characterClasses";
import {
  AbilityComponentReactionRollBonusStatic,
  AbilityComponentReactionRollBonusStaticData,
} from "../../../staticData/abilityComponents/AbilityComponentReactionRollBonusStatic";
import {
  AbilityComponentReactionRollBonusConditional,
  AbilityComponentReactionRollBonusConditionalData,
} from "../../../staticData/abilityComponents/AbilityComponentReactionRollBonusConditional";
import { TooltipBonusCalculationsPanel } from "../../TooltipBonusCalculationsPanel";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterReactionRollSection extends React.Component<Props> {
  render(): React.ReactNode {
    const calc = this.getReactionRollCalculations();

    return (
      <TooltipSource
        className={styles.root}
        tooltipParams={{
          id: "ReactionRollExplanation",
          content: this.renderTooltip.bind(this, calc),
        }}
      >
        <div className={styles.title}>{"Reaction Roll"}</div>
        <div className={styles.valueDisplay}>{getBonusString(calc.bonus)}</div>
        {calc.conditionalSources.length > 0 ? <div className={styles.infoAsterisk}>{"*"}</div> : null}
      </TooltipSource>
    );
  }

  private renderTooltip(data: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.combatTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"Reaction Roll"}</div>
          <div className={styles.tooltipValue}>{getBonusString(data.bonus)}</div>
        </div>
        <TooltipBonusCalculationsPanel calc={data} />
      </div>
    );
  }

  private getReactionRollCalculations(): BonusCalculations {
    const { character, activeComponents } = this.props;

    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Charisma bonus is always displayed, even if it's a zero.
    const cha = getCharacterStatv2(character, CharacterStat.Charisma, activeComponents);
    const chaBonus = getStatBonusForValue(cha);
    calc.bonus += chaBonus;
    calc.sources.push({ name: CharacterStat.Charisma, value: chaBonus });

    // Reaction Roll Bonuses
    (activeComponents[AbilityComponentReactionRollBonusStatic.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentReactionRollBonusStaticData;
        const name = getAbilityComponentInstanceSourceName(instance);
        calc.sources.push({ name, value: instanceData.bonus });
        calc.bonus += instanceData.bonus;
      }
    );

    // Conditional Reaction Roll Bonuses
    (activeComponents[AbilityComponentReactionRollBonusConditional.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentReactionRollBonusConditionalData;
        const name = getAbilityComponentInstanceSourceName(instance);
        calc.conditionalSources.push({
          name,
          value: instanceData.bonus_by_rank[instance.rank - 1],
          condition: instanceData.condition,
        });
      }
    );

    return calc;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;

  return {
    ...props,
    character,
  };
}

export const CharacterReactionRollSection = connect(mapStateToProps)(ACharacterReactionRollSection);
