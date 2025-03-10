import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { UserRole } from "../../redux/userSlice";
import { CharacterData, ProficiencyData } from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { AllProficiencies } from "../../staticData/proficiencies/AllProficiencies";
import { AbilityOrProficiency, ProficiencySource } from "../../staticData/types/abilitiesAndProficiencies";
import TooltipSource from "../TooltipSource";
import styles from "./AbilitiesList.module.scss";
import { getProficiencyRankForCharacter } from "../../lib/characterUtils";
import { AllClassFeatures } from "../../staticData/classFeatures/AllClassFeatures";
import { AbilityDisplayData } from "./dialogs/EditProficienciesSubPanel";
import { AllInjuries } from "../../staticData/injuries/AllInjuries";
import { getRomanNumerals } from "../../lib/stringUtils";

interface ReactProps {
  characterId: number;
  injuries?: boolean;
}

interface InjectedProps {
  activeRole: UserRole;
  character: CharacterData;
  proficiencies: ProficiencyData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AAbilitiesList extends React.Component<Props> {
  render(): React.ReactNode {
    const abilities = this.props.injuries ? this.sortInjuries() : this.sortAbilities();

    return (
      <div className={styles.root}>
        {abilities.map((ability, index) => {
          return this.renderAbilityRow(ability, index);
        })}
      </div>
    );
  }

  private renderAbilityRow(ability: AbilityDisplayData, index: number): React.ReactNode {
    return (
      <TooltipSource
        className={styles.listRow}
        key={`abilityRow${index}`}
        tooltipParams={{
          id: ability.name,
          content: () => {
            return (
              <div className={styles.tooltipRoot}>
                <div className={styles.tooltipTitle}>{ability.name}</div>
                <div className={styles.tooltipText}>{ability.def.description[ability.rank - 1]}</div>
              </div>
            );
          },
        }}
      >
        <div className={styles.listName}>{ability.name}</div>
      </TooltipSource>
    );
  }

  private sortAbilities(): AbilityDisplayData[] {
    const characterClass = AllClasses[this.props.character.class_name];

    const displayDataByName: Dictionary<AbilityDisplayData> = {};

    // Class abilities/proficiencies.
    characterClass.classFeatures.forEach((classFeature) => {
      // Only include abilities this character has unlocked.
      if (this.props.character.level < classFeature.minLevel) {
        return;
      }

      const identifyingName = this.buildIdentifyingName(classFeature.def, classFeature.subtype);
      if (!displayDataByName[identifyingName]) {
        displayDataByName[identifyingName] = {
          name: identifyingName,
          rank: classFeature.rank ?? 1,
          subtype: classFeature.subtype,
          minLevel: classFeature.minLevel,
          def: classFeature.def,
        };
      } else {
        displayDataByName[identifyingName].rank += classFeature.rank;
      }
    });

    // Chosen proficiencies.
    this.props.proficiencies.forEach((proficiency) => {
      // Exclude injuries.
      if (proficiency.source === ProficiencySource.Injury) {
        return;
      }

      // Only include abilities this character has unlocked.
      if (!getProficiencyRankForCharacter(this.props.character.id, proficiency.feature_id, proficiency.subtype)) {
        return;
      }

      let def = AllProficiencies[proficiency.feature_id];
      if (!def) {
        def = AllClassFeatures[proficiency.feature_id];
      }
      if (!def) {
        def = AllInjuries[proficiency.feature_id];
      }
      const identifyingName = this.buildIdentifyingName(def, proficiency.subtype);

      if (displayDataByName[identifyingName]) {
        // If we already had this proficiency, increase its rank by one.
        displayDataByName[identifyingName].rank += 1;
      } else {
        // If this is the first instance of this proficiency, create it at rank one.
        displayDataByName[identifyingName] = {
          name: identifyingName,
          rank: 1,
          subtype: proficiency.subtype,
          minLevel: 1,
          def,
        };
      }
    });

    // TODO: Special treatment for Languages?

    Object.values(displayDataByName).forEach((datum) => {
      // Build the display names at the end, once ranks are finalized.
      datum.name = this.buildDisplayName(datum.def, datum.rank, datum.subtype);
    });

    // Sort the abilities alphabetically.
    const displayData = Object.values(displayDataByName).sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return displayData;
  }

  private sortInjuries(): AbilityDisplayData[] {
    const displayDataByName: Dictionary<AbilityDisplayData> = {};

    // Injuries.
    this.props.proficiencies.forEach((proficiency) => {
      if (proficiency.source === ProficiencySource.Injury) {
        const def = AllInjuries[proficiency.feature_id];
        const identifyingName = this.buildIdentifyingName(def, proficiency.subtype);

        if (displayDataByName[identifyingName]) {
          // If we already had this proficiency, increase its rank by one.
          displayDataByName[identifyingName].rank += 1;
        } else {
          // If this is the first instance of this proficiency, create it at rank one.
          displayDataByName[identifyingName] = {
            name: identifyingName,
            rank: 1,
            subtype: proficiency.subtype,
            minLevel: 1,
            def,
          };
        }
      }
    });

    Object.values(displayDataByName).forEach((datum) => {
      // Build the display names at the end, once ranks are finalized.
      datum.name = this.buildDisplayName(datum.def, datum.rank, datum.subtype);
    });

    // Sort the abilities alphabetically.
    const displayData = Object.values(displayDataByName).sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return displayData;
  }

  private buildIdentifyingName(def: AbilityOrProficiency, subtype?: string): string {
    let idName = def.name;

    if (subtype && subtype.length > 0) {
      idName = `${idName} (${subtype})`;
    }

    return idName;
  }

  private buildDisplayName(def: AbilityOrProficiency, rank: number, subtype?: string): string {
    let displayName = def.name;

    if (def.description.length > 1) {
      displayName = `${displayName} ${getRomanNumerals(rank)}`;
    }

    if (subtype && subtype.length > 0) {
      displayName = `${displayName} (${subtype})`;
    }

    return displayName;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const proficiencies = state.proficiencies.proficienciesByCharacterId[props.characterId] ?? [];
  const character = state.characters.characters[props.characterId];

  return {
    ...props,
    activeRole,
    character,
    proficiencies,
  };
}

export const AbilitiesList = connect(mapStateToProps)(AAbilitiesList);
