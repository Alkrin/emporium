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
import {
  AbilityComponentProficiencyRollMultiTarget,
  AbilityComponentProficiencyRollMultiTargetData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRollMultiTarget";
import { ExpandableSection } from "../../ExpandableSection";
import {
  AbilityComponentProficiencyRollBonusByRank,
  AbilityComponentProficiencyRollBonusByRankData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRollBonusByRank";

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

    const combinedRolls = this.getCombinedRolls();
    if (Object.keys(combinedRolls).length > 0) {
      const orderedRollNames = Object.keys(combinedRolls).sort((aName, bName) => {
        return aName.localeCompare(bName);
      });

      return (
        <div className={styles.root}>
          <div className={styles.centeredRow}>
            <div className={styles.title}>{"Proficiency Rolls"}</div>
          </div>
          <div className={styles.horizontalLine} />
          {orderedRollNames.map((rollName) => combinedRolls[rollName]).map(this.renderProficiencyRoll.bind(this))}
        </div>
      );
    } else {
      // This should never happen, as all character classes should grant the Adventuring proficiency, which gives a
      // handful of proficiency rolls.
      return null;
    }
  }

  private getCombinedRolls(): Record<string, AbilityComponentInstance[]> {
    const { activeComponents } = this.props;
    const combinedRolls: Record<string, AbilityComponentInstance[]> = {};

    // Combine any instances that map to the same proficiencyRoll.  This allows us to combine rolls coming from different
    // sources (e.g. one rank from an item and one rank from a learned proficiency).

    // Single Target Rolls
    activeComponents[AbilityComponentProficiencyRoll.id].forEach((instance) => {
      const rollName = this.makeRollName(instance);
      if (!combinedRolls[rollName]) {
        combinedRolls[rollName] = [];
      }
      combinedRolls[rollName].push(instance);
    });

    // Multi Target Rolls
    activeComponents[AbilityComponentProficiencyRollMultiTarget.id].forEach((instance) => {
      const rollName = this.makeRollName(instance);
      if (!combinedRolls[rollName]) {
        combinedRolls[rollName] = [];
      }
      combinedRolls[rollName].push(instance);
    });

    // Note that it is a data error to have a Proficiency Roll be both single target and multi target.

    return combinedRolls;
  }

  private makeRollName(instance: AbilityComponentInstance): string {
    const instanceData = instance.data as AbilityComponentProficiencyRollData;
    const baseName = this.props.allProficiencyRolls[instanceData.proficiency_roll_id].name;

    return instance.subtype.length > 0 ? `${baseName} (${instance.subtype})` : baseName;
  }

  private renderProficiencyRoll(instances: AbilityComponentInstance[], index: number): React.ReactNode {
    if (instances[0].abilityComponentId === AbilityComponentProficiencyRoll.id) {
      // Single target
      return this.renderProficiencyRollRow(instances, index);
    } else if (instances[0].abilityComponentId === AbilityComponentProficiencyRollMultiTarget.id) {
      // Multi target
      const instanceData = instances[0].data as AbilityComponentProficiencyRollMultiTargetData;
      const rollDef = this.props.allProficiencyRolls[instances[0].data.proficiency_roll_id];
      const rollName = this.makeRollName(instances[0]);
      return (
        <ExpandableSection
          key={`RollMulti${index}`}
          renderHeader={() => {
            return (
              <TooltipSource
                className={styles.listRow}
                key={`proficiencyRollMulti${index}`}
                tooltipParams={{
                  id: rollDef.name,
                  content: () => {
                    return (
                      <div className={styles.tooltipRoot}>
                        <div className={styles.tooltipHeader}>
                          <div className={styles.tooltipTitle}>{rollName}</div>
                        </div>
                        <div className={styles.tooltipText}>{rollDef.description}</div>
                      </div>
                    );
                  },
                }}
              >
                <div className={styles.listName}>{rollName}</div>
              </TooltipSource>
            );
          }}
        >
          {instanceData.targets.map((target, rollIndex) => {
            return this.renderProficiencyRollRow(instances, index, rollIndex);
          })}
        </ExpandableSection>
      );
    }
  }

  private renderProficiencyRollRow(
    instances: AbilityComponentInstance[],
    index: number,
    rollIndex: number = -1
  ): React.ReactNode {
    const isMultiTarget = rollIndex !== -1;
    const rollDef = this.props.allProficiencyRolls[instances[0].data.proficiency_roll_id];
    const totalRank = instances.reduce<number>((rankSoFar: number, instance: AbilityComponentInstance) => {
      if (isMultiTarget) {
        const instanceData = instance.data as AbilityComponentProficiencyRollMultiTargetData;
        // Only component instances that use target_by_rank count towards our rank total.
        if ((instanceData.targets[rollIndex].target_by_rank?.[0] ?? 0) > 0) {
          return rankSoFar + instance.rank;
        }
        return rankSoFar;
      } else {
        const instanceData = instance.data as AbilityComponentProficiencyRollData;
        // Only component instances that use target_by_rank count towards our rank total.
        if ((instanceData.target_by_rank?.[0] ?? 0) > 0) {
          return rankSoFar + instance.rank;
        }
        return rankSoFar;
      }
    }, 0);

    // A proficiency roll is either based on Rank or Level.
    const rankRoll = instances.reduce<number>((lowestSoFar, instance) => {
      if (isMultiTarget) {
        const instanceData = instance.data as AbilityComponentProficiencyRollMultiTargetData;
        return Math.min(lowestSoFar, instanceData.targets[rollIndex].target_by_rank[totalRank - 1] ?? 99);
      } else {
        const instanceData = instance.data as AbilityComponentProficiencyRollData;
        return Math.min(lowestSoFar, instanceData.target_by_rank[totalRank - 1] ?? 99);
      }
    }, 99);
    const levelRoll = instances.reduce<number>((lowestSoFar, instance) => {
      if (isMultiTarget) {
        const instanceData = instance.data as AbilityComponentProficiencyRollMultiTargetData;
        return Math.min(
          lowestSoFar,
          instanceData.targets[rollIndex].target_by_level[this.props.character.level - 1] ?? 99
        );
      } else {
        const instanceData = instance.data as AbilityComponentProficiencyRollData;
        return Math.min(lowestSoFar, instanceData.target_by_level[this.props.character.level - 1] ?? 99);
      }
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

    let rollName = "";
    if (isMultiTarget) {
      const instanceData = instances[0].data as AbilityComponentProficiencyRollMultiTargetData;
      rollName = instanceData.targets[rollIndex].name;
    } else {
      rollName = this.makeRollName(instances[0]);
    }

    return (
      <TooltipSource
        className={isMultiTarget ? styles.listRowMulti : styles.listRow}
        key={`proficiencyRollRow${index}:${rollIndex}`}
        tooltipParams={{
          id: rollDef.name,
          content: () => {
            return (
              <div className={styles.tooltipRoot}>
                <div className={styles.tooltipHeader}>
                  <div className={styles.tooltipTitle}>{rollName}</div>
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
        <div className={styles.listName}>{rollName}</div>
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

    (activeComponents[AbilityComponentProficiencyRollBonusByRank.id] ?? []).forEach(
      (instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentProficiencyRollBonusByRankData;
        if (instanceData.proficiency_roll_id === rollDef.id) {
          const name = getAbilityComponentInstanceSourceName(instance);
          const bonus: number = instanceData.bonus_by_rank[instance.rank - 1] ?? 0;
          calc.sources.push({ name, value: bonus });
          calc.bonus += bonus;
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
