import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { AbilityDefData, CharacterData, ProficiencyRollData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterProficiencyRollsSection.module.scss";
import { AbilityComponentInstance, getBonusForStat, getCharacterStat } from "../../../lib/characterUtils";
import { buildAbilityName } from "../../../lib/stringUtils";
import {
  AbilityComponentProficiencyRoll,
  AbilityComponentProficiencyRollData,
} from "../../../staticData/abilityComponents/AbilityComponentProficiencyRoll";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  allAbilities: Record<number, AbilityDefData>;
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
      const combinedRolls: Record<number, AbilityComponentInstance[]> = {};
      activeComponents[AbilityComponentProficiencyRoll.id].forEach((instance) => {
        const instanceData = instance.data as AbilityComponentProficiencyRollData;
        const rollId = instanceData.proficiency_roll_id;
        if (!combinedRolls[rollId]) {
          combinedRolls[rollId] = [];
        }
        combinedRolls[rollId].push(instance);
      });

      // Sort the rolls by display name.
      const orderedRollIds = Object.keys(combinedRolls).sort((rollIdAString, rollIdBString) => {
        const aData = combinedRolls[+rollIdAString][0].data as AbilityComponentProficiencyRollData;
        const bData = combinedRolls[+rollIdBString][0].data as AbilityComponentProficiencyRollData;
        const aName = this.props.allProficiencyRolls[aData.proficiency_roll_id].name;
        const bName = this.props.allProficiencyRolls[bData.proficiency_roll_id].name;
        return aName.localeCompare(bName);
      });

      return (
        <div className={styles.root}>
          <div className={styles.centeredRow}>
            <div className={styles.title}>{"Proficiency Rolls"}</div>
          </div>
          <div className={styles.horizontalLine} />
          {orderedRollIds.map((rollId) => combinedRolls[+rollId]).map(this.renderProficiencyRollRow.bind(this))}
        </div>
      );
    } else {
      // This should never happen, as all character classes should grant the Adventuring proficiency, which gives a
      // handful of proficiency rolls.
      return null;
    }
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

    // Stat-based bonuses.
    let statBonus = 0;
    let hasStatBonus = false;
    if (!!rollDef.stat && rollDef.stat != "---") {
      hasStatBonus = true;
      const statValue = getCharacterStat(this.props.character, rollDef.stat);
      statBonus = getBonusForStat(statValue) * rollDef.bonus_multiplier;
    }
    finalTargetRoll -= statBonus;

    // TODO: Bonuses, penalties, and conditionals, once those Components exist.

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
                  <div className={styles.tooltipTitle}>{rollDef.name}</div>
                  <div className={styles.tooltipValue}>{`${finalTargetRoll}+`}</div>
                </div>
                <div className={styles.tooltipText}>{rollDef.description}</div>
                <div className={styles.tooltipSubtext}>{"Calculations"}</div>
                <div className={styles.tooltipSubtext}>{`\xa0\xa0\xa0\xa0Base Target: ${baseTargetRoll}+`}</div>
                {hasStatBonus ? (
                  <div
                    className={`${styles.tooltipBonusText} ${statBonus < 0 ? styles.penalty : ""}`}
                  >{`\xa0\xa0\xa0\xa0Bonus from ${rollDef.stat}: ${statBonus > 0 ? "+" : ""}${statBonus}`}</div>
                ) : null}
                <div className={styles.tooltipSubtext}>{"Sources"}</div>
                {instances.map((instance, index2) => {
                  const ability = this.props.allAbilities[instance.abilityId];
                  if (ability) {
                    return (
                      <div className={styles.tooltipSubtext} key={`source${index2}`}>
                        {`\xa0\xa0\xa0\xa0${buildAbilityName(ability.name, instance.subtype, instance.rank)}`}
                      </div>
                    );
                  } else {
                    // TODO: Components from items instead of abilities?
                    return null;
                  }
                })}
              </div>
            );
          },
        }}
      >
        <div className={styles.listName}>{rollDef.name}</div>
        <div className={styles.tooltipValue}>{`${finalTargetRoll}+`}</div>
      </TooltipSource>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { proficiencyRolls: allProficiencyRolls, abilities: allAbilities } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    allAbilities,
    allProficiencyRolls,
    character,
  };
}

export const CharacterProficiencyRollsSection = connect(mapStateToProps)(ACharacterProficiencyRollsSection);
