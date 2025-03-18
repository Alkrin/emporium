import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData, ProficiencyRollData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterProficiencyRollsSection.module.scss";
import {
  AbilityComponentInstance,
  getStatBonusForValue,
  getCharacterStatv2,
  getAbilityComponentInstanceSourceName,
  ValueSource,
  ConditionalValueSource,
} from "../../../lib/characterUtils";
import {
  AbilityComponentProficiencyRoll,
  AbilityComponentProficiencyRollData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRoll";
import {
  AbilityComponentProficiencyRollBonusStatic,
  AbilityComponentProficiencyRollBonusStaticData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRollBonusStatic";
import {
  AbilityComponentProficiencyRollBonusConditional,
  AbilityComponentProficiencyRollBonusConditionalData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRollBonusConditional";
import { TooltipBonusCalculationsPanel } from "../../TooltipBonusCalculationsPanel";

interface ProficiencyRollCalculations {
  bonus: number;
  sources: ValueSource[];
  conditionalSources: ConditionalValueSource[];
}

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  allProficiencyRolls: Record<number, ProficiencyRollData>;
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterProficiencyRollsSection extends React.Component<Props> {
  render(): React.ReactNode {
    const { activeComponents } = this.props;

    if ((activeComponents[AbilityComponentProficiencyRoll.id]?.length ?? 0) > 0) {
      // Combine any instances that map to the same proficiencyRoll.  This allows us to combine rolls coming from different
      // sources (e.g. one rank from an item and one rank from a learned proficiency).
      const combinedRolls: Record<string, AbilityComponentInstance[]> = {};
      activeComponents[AbilityComponentProficiencyRoll.id].forEach((instance) => {
        const rollName = this.makeRollName(instance);
        if (!combinedRolls[rollName]) {
          combinedRolls[rollName] = [];
        }
        combinedRolls[rollName].push(instance);
      });

      const orderedRollNames = Object.keys(combinedRolls).sort((aName, bName) => {
        return aName.localeCompare(bName);
      });

      return (
        <div className={styles.root}>
          <div className={styles.centeredRow}>
            <div className={styles.title}>{"Proficiency Rolls"}</div>
          </div>
          <div className={styles.horizontalLine} />
          {orderedRollNames.map((rollName) => combinedRolls[rollName]).map(this.renderProficiencyRollRow.bind(this))}
        </div>
      );
    } else {
      // This should never happen, as all character classes should grant the Adventuring proficiency, which gives a
      // handful of proficiency rolls.
      return null;
    }
  }

  private makeRollName(instance: AbilityComponentInstance): string {
    const instanceData = instance.data as AbilityComponentProficiencyRollData;
    const baseName = this.props.allProficiencyRolls[instanceData.proficiency_roll_id].name;

    return instance.subtype.length > 0 ? `${baseName} (${instance.subtype})` : baseName;
  }

  private renderProficiencyRollRow(instances: AbilityComponentInstance[], index: number): React.ReactNode {
    const rollDef = this.props.allProficiencyRolls[instances[0].data.proficiency_roll_id];
    const totalRank = instances.reduce<number>((rankSoFar: number, instance: AbilityComponentInstance) => {
      const instanceData = instance.data as AbilityComponentProficiencyRollData;
      // Only component instances that use target_by_rank count towards our rank total.
      if ((instanceData.target_by_rank?.[0] ?? 0) > 0) {
        return rankSoFar + instance.rank;
      }
      return rankSoFar;
    }, 0);

    // A proficiency roll is either based on Rank or Level.
    const rankRoll = instances.reduce<number>((lowestSoFar, instance) => {
      const instanceData = instance.data as AbilityComponentProficiencyRollData;
      return Math.min(lowestSoFar, instanceData.target_by_rank[totalRank - 1] ?? 99);
    }, 99);
    const levelRoll = instances.reduce<number>((lowestSoFar, instance) => {
      const instanceData = instance.data as AbilityComponentProficiencyRollData;
      return Math.min(lowestSoFar, instanceData.target_by_level[this.props.character.level - 1] ?? 99);
    }, 99);
    // The character gets whichever is best.
    const baseTargetRoll = Math.min(rankRoll, levelRoll);
    let finalTargetRoll = baseTargetRoll;

    // If the target is still 99, then they don't actually have that proficiency roll.  This allows us to
    // set up rolls that are only available at certain proficiency ranks, e.g. Healing only lets you roll
    // to Neutralize Poison at Rank 2+.
    if (finalTargetRoll >= 99) {
      return null;
    }

    const calc = this.getProficiencyRollCalculations(rollDef);

    finalTargetRoll -= calc.bonus;

    return (
      <TooltipSource
        className={styles.listRow}
        key={`proficiencyRollRow${index}`}
        tooltipParams={{
          id: rollDef.name,
          content: () => {
            return (
              <div className={styles.tooltipRoot}>
                <div className={styles.tooltipHeader}>
                  <div className={styles.tooltipTitle}>{this.makeRollName(instances[0])}</div>
                  <div className={styles.tooltipValue}>{`${finalTargetRoll}+`}</div>
                </div>
                <div className={styles.tooltipText}>{rollDef.description}</div>
                <div className={styles.tooltipConditionalHeader}>{"Base Target"}</div>
                <div className={styles.tooltipDivider} />
                {instances.map((instance, index) => {
                  return (
                    <div className={styles.tooltipSourceRow} key={index}>
                      <div className={styles.tooltipSource}>{getAbilityComponentInstanceSourceName(instance)}</div>
                      <div className={styles.tooltipSourceValue}>{`${baseTargetRoll}+`}</div>
                    </div>
                  );
                })}
                <TooltipBonusCalculationsPanel calc={calc} />
              </div>
            );
          },
        }}
      >
        <div className={styles.listName}>{this.makeRollName(instances[0])}</div>
        <div className={styles.tooltipValue}>{`${finalTargetRoll}+`}</div>
        {calc.conditionalSources.length > 0 ? <div className={styles.infoAsterisk}>{"*"}</div> : null}
      </TooltipSource>
    );
  }

  private getProficiencyRollCalculations(rollDef: ProficiencyRollData): ProficiencyRollCalculations {
    const { character, activeComponents } = this.props;

    const calc: ProficiencyRollCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Stat-based bonuses.
    if (!!rollDef.stat && rollDef.stat != "---") {
      // The stat bonus is always displayed, even if it's a zero.
      const statValue = getCharacterStatv2(character, rollDef.stat, activeComponents);
      const statBonus = getStatBonusForValue(statValue) * rollDef.bonus_multiplier;
      calc.bonus += statBonus;
      calc.sources.push({ name: rollDef.stat, value: statBonus });
    }

    // Proficiency Roll Bonuses
    (activeComponents[AbilityComponentProficiencyRollBonusStatic.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentProficiencyRollBonusStaticData;
        if (instanceData.proficiency_roll_id === rollDef.id) {
          const name = getAbilityComponentInstanceSourceName(instance);
          calc.sources.push({ name, value: instanceData.bonus });
          calc.bonus += instanceData.bonus;
        }
      }
    );

    // Conditional Proficiency Roll Bonuses
    (activeComponents[AbilityComponentProficiencyRollBonusConditional.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentProficiencyRollBonusConditionalData;
        if (instanceData.proficiency_roll_id === rollDef.id) {
          const name = getAbilityComponentInstanceSourceName(instance);
          calc.conditionalSources.push({
            name,
            value: instanceData.bonus_by_rank[instance.rank - 1],
            condition: instanceData.condition,
          });
        }
      }
    );

    return calc;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { proficiencyRolls: allProficiencyRolls } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    allProficiencyRolls,
    character,
  };
}

export const CharacterProficiencyRollsSection = connect(mapStateToProps)(ACharacterProficiencyRollsSection);
