import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData, HarvestingCategoryData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterMonsterHarvestingSection.module.scss";
import {
  AbilityComponentInstance,
  getAbilityComponentInstanceSourceName,
  ValueSource,
} from "../../../lib/characterUtils";
import {
  AbilityComponentHarvestingCapability,
  AbilityComponentHarvestingCapabilityData,
} from "../../../staticData/abilityComponents/AbilityComponentHarvestingCapability";
import { InfoButton } from "../../InfoButton";

interface HarvestingCategoryDisplayData {
  categoryDef: HarvestingCategoryData;
  ranks: number;
  rankSources: ValueSource[];
}

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  allHarvestingCategories: Record<number, HarvestingCategoryData>;
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterMonsterHarvestingSection extends React.Component<Props> {
  render(): React.ReactNode {
    const categoryDisplayData = this.buildDisplayData();

    if (Object.keys(categoryDisplayData).length > 0) {
      return (
        <div className={styles.root}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{"Monster Harvesting"}</div>
            <InfoButton
              tooltipParams={{
                id: ``,
                content: () => (
                  <div className={styles.tooltipRoot}>
                    <div className={styles.tooltipText}>
                      {`The character can harvest Special Components from monsters in unlocked categories.  ` +
                        `Special Components are used primarily in the creation of scrolls, potions, and other ` +
                        `more permanent magic items and equipment.\n\nBefore harvest is possible, the components ` +
                        `must be identified through a Component Identification proficiency roll (granted by the Alchemy proficiency).\n\n` +
                        `After harvest, Special Components must be stored in a Metamphora or else lose their magical properties.`}
                    </div>
                  </div>
                ),
              }}
            />
          </div>
          <div className={styles.horizontalLine} />
          {categoryDisplayData.map(this.renderHarvestingCategoryRow.bind(this))}
        </div>
      );
    } else {
      return null;
    }
  }

  private buildDisplayData(): HarvestingCategoryDisplayData[] {
    const { activeComponents } = this.props;

    const categoryDisplayData: Record<number, HarvestingCategoryDisplayData> = {};

    const ensureDisplayDataExists = (categoryId: number) => {
      if (!categoryDisplayData[categoryId]) {
        categoryDisplayData[categoryId] = {
          categoryDef: this.props.allHarvestingCategories[categoryId],
          ranks: 0,
          rankSources: [],
        };
      }
      return categoryDisplayData[categoryId];
    };

    activeComponents[AbilityComponentHarvestingCapability.id]?.forEach((instance) => {
      const instanceData = instance.data as AbilityComponentHarvestingCapabilityData;
      const data = ensureDisplayDataExists(instanceData.category_id);

      // Basic harvesting capability grants ranks towards the requirement.
      data.ranks += instance.rank;
      data.rankSources.push({ name: getAbilityComponentInstanceSourceName(instance), value: instance.rank });
    });

    const sortedCategories = Object.values(categoryDisplayData).sort((a, b) => {
      // Unlocked categories go first.
      const aUnlocked = a.ranks >= a.categoryDef.required_ranks;
      const bUnlocked = b.ranks >= b.categoryDef.required_ranks;
      if (aUnlocked !== bUnlocked) {
        return aUnlocked ? -1 : 1;
      }
      // Then sort by name.
      return a.categoryDef.name.localeCompare(b.categoryDef.name);
    });
    return sortedCategories;
  }

  private renderHarvestingCategoryRow(datum: HarvestingCategoryDisplayData, index: number): React.ReactNode {
    const lockedStyle = datum.ranks < datum.categoryDef.required_ranks ? styles.locked : "";
    return (
      <TooltipSource
        className={`${styles.listRow} ${lockedStyle}`}
        key={`harvestingCategoryRow${index}`}
        tooltipParams={{
          id: datum.categoryDef.name,
          content: this.renderCategoryTooltip.bind(this, datum),
        }}
      >
        <div className={`${styles.listName} ${lockedStyle}`}>{datum.categoryDef.name}</div>
      </TooltipSource>
    );
  }

  private renderCategoryTooltip(datum: HarvestingCategoryDisplayData): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{datum.categoryDef.name}</div>
          <div className={styles.valueText}>{`Required Ranks: ${datum.categoryDef.required_ranks}`}</div>
        </div>
        <div className={styles.tooltipText}>{datum.categoryDef.description}</div>
        <div className={styles.tooltipSubtext}>{"Sources"}</div>
        {datum.rankSources.map((source, index) => {
          return (
            <div className={styles.tooltipSubtext} key={`source${index}`}>
              {`\xa0\xa0\xa0\xa0${source.name} (${source.value})`}
            </div>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { harvestingCategories: allHarvestingCategories } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    allHarvestingCategories,
    character,
  };
}

export const CharacterMonsterHarvestingSection = connect(mapStateToProps)(ACharacterMonsterHarvestingSection);
