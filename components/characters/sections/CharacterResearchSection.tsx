import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { AbilityDefData, CharacterData, ResearchCategoryData, ResearchSubcategoryData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterResearchSection.module.scss";
import {
  AbilityComponentInstance,
  getAbilityComponentInstanceSourceName,
  ValueSource,
} from "../../../lib/characterUtils";
import { buildAbilityName } from "../../../lib/stringUtils";
import {
  AbilityComponentResearchCapability,
  AbilityComponentResearchCapabilityData,
} from "../../../staticData/abilityComponents/AbilityComponentResearchCapability";
import {
  AbilityComponentResearchBonusesOrEffectiveLevel,
  AbilityComponentResearchBonusesOrEffectiveLevelData,
} from "../../../staticData/abilityComponents/AbilityComponentResearchBonusesOrEffectiveLevel";

interface ResearchCategoryDisplayData {
  categoryDef: ResearchCategoryData;
  effectiveLevel: number;
  effectiveLevelSources: ValueSource[];
  effectiveLevelBonusSources: ValueSource[];
  rate: number;
  rateSources: ValueSource[];
  rateMultiplierSources: ValueSource[];
  roll: number;
  rollSources: ValueSource[];
  rollBonusSources: ValueSource[];
}

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  allAbilities: Record<number, AbilityDefData>;
  allResearchCategories: Record<number, ResearchCategoryData>;
  allResearchSubcategories: Record<number, ResearchSubcategoryData>;
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterResearchSection extends React.Component<Props> {
  render(): React.ReactNode {
    const categoryDisplayData = this.buildDisplayData();

    if (Object.keys(categoryDisplayData).length > 0) {
      return (
        <div className={styles.root}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{"Research"}</div>
            <div className={styles.fixedWidthHeader}>{"Roll"}</div>
            <div className={styles.fixedWidthHeader}>{"Rate"}</div>
          </div>
          <div className={styles.horizontalLine} />
          {categoryDisplayData.map(this.renderResearchCategoryRow.bind(this))}
        </div>
      );
    } else {
      return null;
    }
  }

  private buildDisplayData(): ResearchCategoryDisplayData[] {
    const { activeComponents } = this.props;

    const categoryDisplayData: Record<number, ResearchCategoryDisplayData> = {};

    const ensureDisplayDataExists = (categoryId: number) => {
      if (!categoryDisplayData[categoryId]) {
        categoryDisplayData[categoryId] = {
          categoryDef: this.props.allResearchCategories[categoryId],
          effectiveLevel: 0,
          effectiveLevelSources: [],
          effectiveLevelBonusSources: [],
          rate: 0,
          rateSources: [],
          rateMultiplierSources: [],
          roll: 99,
          rollSources: [],
          rollBonusSources: [],
        };
      }
      return categoryDisplayData[categoryId];
    };

    activeComponents[AbilityComponentResearchCapability.id]?.forEach((instance) => {
      const instanceData = instance.data as AbilityComponentResearchCapabilityData;
      const data = ensureDisplayDataExists(instanceData.category);

      // Basic research capability grants you an effective level equal to a specific character level.
      data.effectiveLevel = Math.max(data.effectiveLevel, instance.characterLevel);
      data.effectiveLevelSources.push({
        name: getAbilityComponentInstanceSourceName(instance),
        value: instance.characterLevel,
      });
    });

    // Group the RollBonusOrEffectiveLevel components by the category they are attached to.
    const rboelComponentsByCategory = (
      activeComponents[AbilityComponentResearchBonusesOrEffectiveLevel.id] ?? []
    ).reduce<Record<string, AbilityComponentInstance[]>>(
      (soFar: Record<string, AbilityComponentInstance[]>, instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentResearchBonusesOrEffectiveLevelData;
        if (!soFar[instanceData.category]) {
          soFar[instanceData.category] = [];
        }
        soFar[instanceData.category].push(instance);
        return soFar;
      },
      {}
    );
    Object.entries(rboelComponentsByCategory).forEach((entry) => {
      const [categoryIdString, components] = entry;
      // Inside a category, the components may not all have identical data.  Calculate ranks separately per unique dataset.
      const ranksByDataset = components.reduce<Record<string, ValueSource>>(
        (rbd: Record<string, ValueSource>, instance: AbilityComponentInstance) => {
          const key = JSON.stringify(instance.data);
          if (!rbd[key]) {
            // We use the name of the first source for an identical dataset, under the assumption that it comes from an identical source.
            // This is not necessarily true, unfortunately.
            rbd[key] = { name: getAbilityComponentInstanceSourceName(instance), value: 0 };
          }
          rbd[key].value += instance.rank;
          return rbd;
        },
        {}
      );
      // Get rid of any datasets that wind up with non-positive rank counts.
      Object.keys(ranksByDataset).forEach((datasetJSON) => {
        if (ranksByDataset[datasetJSON].value <= 0) delete ranksByDataset[datasetJSON];
      });

      // If we have at least one dataset with a positive rank, then we need to do something with it.
      if (Object.values(ranksByDataset).length > 0) {
        // The character always gets the highest EffectiveLevel we can find for them.
        const baseEL = categoryDisplayData[+categoryIdString]?.effectiveLevel ?? 0;
        // There may or may not be a dataset that gives a better EL than the base.  Let's check for the best one.
        let sourceThatImprovesEL: string = "";
        let datasetJSONThatImprovesEL: string = "";
        let improvedEL = baseEL;
        Object.entries(ranksByDataset).forEach(([datasetJSON, source]) => {
          const dataset = JSON.parse(datasetJSON) as AbilityComponentResearchBonusesOrEffectiveLevelData;
          const datasetEL = dataset.level_by_rank[Math.min(source.value - 1, dataset.level_by_rank.length - 1)] ?? 0;
          if (datasetEL > improvedEL) {
            sourceThatImprovesEL = source.name;
            datasetJSONThatImprovesEL = datasetJSON;
            improvedEL = datasetEL;
          }
        });
        // If we found a better dataset, then that is its role, and it will not provide a Roll Bonus.
        if (sourceThatImprovesEL !== "") {
          const datum = ensureDisplayDataExists(+categoryIdString);
          datum.effectiveLevel = improvedEL;
          datum.effectiveLevelSources.push({ name: sourceThatImprovesEL, value: improvedEL });

          delete ranksByDataset[datasetJSONThatImprovesEL];
        }
        // Every key currently left in ranksByDataset should provide a Roll Bonus.
        Object.entries(ranksByDataset).forEach(([datasetJSON, source]) => {
          const dataset = JSON.parse(datasetJSON) as AbilityComponentResearchBonusesOrEffectiveLevelData;
          const bonusValue = dataset.bonus_by_rank[Math.min(source.value - 1, dataset.bonus_by_rank.length - 1)];
          const multiplierValue =
            dataset.multiplier_by_rank[Math.min(source.value - 1, dataset.multiplier_by_rank.length - 1)];
          categoryDisplayData[+categoryIdString].rollBonusSources.push({ name: source.name, value: bonusValue });
          categoryDisplayData[+categoryIdString].rateMultiplierSources.push({
            name: source.name,
            value: multiplierValue,
          });
          // Note that we are not yet calculating the final roll target.
        });
      }
    });

    // TODO: Flat EL bonuses?  Probably have to apply them here.

    // Now that we know our final effective level, we can use it to look up research rates and roll targets.
    Object.values(categoryDisplayData)?.forEach((displayData) => {
      const data = ensureDisplayDataExists(displayData.categoryDef.id);

      const effectiveLevelSource = displayData.effectiveLevelSources.reduce(
        (bestSource, currentSource) => {
          return currentSource.value > bestSource.value ? currentSource : bestSource;
        },
        { name: "", value: 0 }
      );

      const rateValue =
        data.categoryDef.rates_by_level[Math.min(data.effectiveLevel - 1, data.categoryDef.rates_by_level.length - 1)];
      data.rateSources.push({ name: effectiveLevelSource.name, value: rateValue });
      data.rate = Math.max(data.rate, rateValue);

      const rollValue =
        data.categoryDef.rolls_by_level[Math.min(data.effectiveLevel - 1, data.categoryDef.rolls_by_level.length - 1)];
      data.rollSources.push({ name: effectiveLevelSource.name, value: rollValue });
      data.roll = Math.min(data.roll, rollValue);
    });

    // After we have collected all of the sources, we need to do a few final calculations.
    Object.values(categoryDisplayData).forEach((datum) => {
      // Roll bonuses are applied to the Roll at the end.
      const totalRollBonus = datum.rollBonusSources.reduce<number>((total, source) => total + source.value, 0);
      // Subtract the bonus because a lower number is better.
      datum.roll -= totalRollBonus;

      // Rate multipliers are also applied at the end.  They are stored as whole-number percentages, so we have to convert.
      let rateMultiplier =
        1 + datum.rateMultiplierSources.reduce<number>((total, source) => total + source.value, 0) / 100;
      // We also drop precision down to 2 decimal digits.
      datum.rate = +(datum.rate * rateMultiplier).toFixed(2);

      // Some sources need to be sorted for display order.
      datum.rollSources.sort((a, b) => a.value - b.value);
      datum.rateSources.sort((a, b) => a.value - b.value);
      datum.effectiveLevelSources.sort((a, b) => a.value - b.value);
    });

    // Sort the categories by display name.
    const sortedCategories = Object.values(categoryDisplayData).sort((a, b) =>
      a.categoryDef.name.localeCompare(b.categoryDef.name)
    );
    return sortedCategories;
  }

  private renderResearchCategoryRow(datum: ResearchCategoryDisplayData, index: number): React.ReactNode {
    return (
      <TooltipSource
        className={styles.listRow}
        key={`researchCategoryRow${index}`}
        tooltipParams={{
          id: datum.categoryDef.name,
          content: this.renderCategoryTooltip.bind(this, datum),
        }}
      >
        <div className={styles.listName}>{datum.categoryDef.name}</div>
        <div className={styles.fixedWidthValue}>{`${datum.roll}+`}</div>
        <div className={styles.fixedWidthValue}>{`${datum.rate}gp`}</div>
      </TooltipSource>
    );
  }

  private renderCategoryTooltip(datum: ResearchCategoryDisplayData): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{datum.categoryDef.name}</div>
          <div className={styles.fixedWidthValue}>{`${datum.roll}+`}</div>
          <div className={styles.fixedWidthValue}>{`${datum.rate}gp`}</div>
        </div>
        <div className={styles.tooltipText}>{datum.categoryDef.description}</div>
        {this.renderTooltipCalculationsEffectiveLevel(datum)}
        <div className={styles.separator} />
        {this.renderTooltipCalculationsRoll(datum)}
        <div className={styles.separator} />
        {this.renderTooltipCalculationsRate(datum)}
      </div>
    );
  }

  private renderTooltipCalculationsEffectiveLevel(datum: ResearchCategoryDisplayData): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.tooltipSubtext}>{`Effective Level: ${datum.effectiveLevel}`}</div>
        <div className={styles.calculationSet}>
          <div className={styles.column}>
            {datum.effectiveLevelSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
            {datum.effectiveLevelBonusSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
          </div>
          <div className={styles.calculationSetDivider} />
          <div className={styles.column}>
            {datum.effectiveLevelSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtextValue} key={`${source} ${index}`}>
                  {source.value}
                </div>
              );
            })}
            {datum.effectiveLevelBonusSources.map((source, index) => {
              return (
                <div
                  className={`${styles.tooltipBonusText} ${source.value < 0 ? styles.penalty : ""}`}
                  key={`${source} ${index}`}
                >
                  {`${source.value >= 0 ? `+` : ""}${source.value}`}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  private renderTooltipCalculationsRoll(datum: ResearchCategoryDisplayData): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.tooltipSubtext}>{`Roll Target: ${datum.roll}+`}</div>
        <div className={styles.calculationSet}>
          <div className={styles.column}>
            {datum.rollSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
            {datum.rollBonusSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
          </div>
          <div className={styles.calculationSetDivider} />
          <div className={styles.column}>
            {datum.rollSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtextValue} key={`${source} ${index}`}>
                  {`${source.value}+`}
                </div>
              );
            })}
            {datum.rollBonusSources.map((source, index) => {
              return (
                <div
                  className={`${styles.tooltipBonusText} ${source.value < 0 ? styles.penalty : ""}`}
                  key={`${source} ${index}`}
                >
                  {`${source.value >= 0 ? `+` : ""}${source.value}`}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  private renderTooltipCalculationsRate(datum: ResearchCategoryDisplayData): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.tooltipSubtext}>{`Research Rate: ${datum.rate}gp/day`}</div>
        <div className={styles.calculationSet}>
          <div className={styles.column}>
            {datum.rateSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
            {datum.rateMultiplierSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtext} key={`${source} ${index}`}>
                  {source.name}
                </div>
              );
            })}
          </div>
          <div className={styles.calculationSetDivider} />
          <div className={styles.column}>
            {datum.rateSources.map((source, index) => {
              return (
                <div className={styles.tooltipSubtextValue} key={`${source} ${index}`}>
                  {`${source.value}gp/day`}
                </div>
              );
            })}
            {datum.rateMultiplierSources.map((source, index) => {
              return (
                <div
                  className={`${styles.tooltipBonusText} ${source.value < 0 ? styles.penalty : ""}`}
                  key={`${source} ${index}`}
                >
                  {`${source.value >= 0 ? `+` : ""}${source.value}%`}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const {
    researchCategories: allResearchCategories,
    researchSubcategories: allResearchSubcategories,
    abilities: allAbilities,
  } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    allAbilities,
    allResearchCategories,
    allResearchSubcategories,
    character,
  };
}

export const CharacterResearchSection = connect(mapStateToProps)(ACharacterResearchSection);
