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
  ValueSource,
  getAbilityComponentInstanceSourceName,
  ConditionalValueSource,
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

interface ReactionRollData {
  bonus: number;
  sources: ValueSource[];
  conditionalSources: ConditionalValueSource[];
}

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
    const data = this.getReactionRollData();

    return (
      <TooltipSource
        className={styles.root}
        tooltipParams={{
          id: "ReactionRollExplanation",
          content: this.renderTooltip.bind(this, data),
        }}
      >
        <div className={styles.title}>{"Reaction Roll"}</div>
        <div className={styles.valueDisplay}>{getBonusString(data.bonus)}</div>
        {data.conditionalSources.length > 0 ? <div className={styles.infoAsterisk}>{"*"}</div> : null}
      </TooltipSource>
    );
  }

  private renderTooltip(data: ReactionRollData): React.ReactNode {
    return (
      <div className={styles.combatTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"Reaction Roll"}</div>
          <div className={styles.tooltipValue}>{getBonusString(data.bonus)}</div>
        </div>
        <div className={styles.tooltipDivider} />
        {data.sources.map(({ name, value }) => {
          return (
            <div className={styles.tooltipSourceRow} key={name}>
              <div className={styles.tooltipSource}>{name}</div>
              <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
            </div>
          );
        })}
        {data.conditionalSources.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>{"Conditional Bonuses"}</div>
            <div className={styles.tooltipDivider} />
            {data.conditionalSources.map(({ name, value, condition }) => {
              return (
                <div className={styles.tooltipSourceRow} key={name}>
                  <div className={styles.column}>
                    <div className={styles.tooltipSource}>{name}</div>
                    <div className={styles.tooltipCondition}>{`\xa0\xa0\xa0\xa0${condition}`}</div>
                  </div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }

  private getReactionRollData(): ReactionRollData {
    const { character, activeComponents } = this.props;

    const data: ReactionRollData = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Charisma bonus is always displayed, even if it's a zero.
    const cha = getCharacterStatv2(character, CharacterStat.Charisma, activeComponents);
    const chaBonus = getStatBonusForValue(cha);
    data.bonus += chaBonus;
    data.sources.push({ name: CharacterStat.Charisma, value: chaBonus });

    // Reaction Roll Bonuses
    (activeComponents[AbilityComponentReactionRollBonusStatic.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentReactionRollBonusStaticData;
        const name = getAbilityComponentInstanceSourceName(instance);
        data.sources.push({ name, value: instanceData.bonus });
        data.bonus += instanceData.bonus;
      }
    );

    // Conditional Reaction Roll Bonuses
    (activeComponents[AbilityComponentReactionRollBonusConditional.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentReactionRollBonusConditionalData;
        const name = getAbilityComponentInstanceSourceName(instance);
        data.conditionalSources.push({ name, value: instanceData.bonus, condition: instanceData.condition });
      }
    );

    return data;
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
