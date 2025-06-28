import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { AbilityDefData, AbilityType, CharacterClassv2, CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterAbilitiesSection.module.scss";
import {
  AbilityComponentInstance,
  getAbilityInstanceDisplayName,
  getCombinedCharacterClass,
} from "../../../lib/characterUtils";
import { AbilityInstancev2 } from "../../../staticData/types/abilitiesAndProficiencies";
import { EditButton } from "../../EditButton";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  allAbilityDefs: Record<number, AbilityDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterAbilitiesSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.centeredRow}>
          <div className={styles.title}>{"Abilities and Proficiencies"}</div>
          <EditButton className={styles.editButton} onClick={this.onEditAbilitiesClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        {this.getSortedAbilities().map(this.renderAbilityRow.bind(this))}
      </div>
    );
  }

  private renderAbilityRow(instance: AbilityInstancev2, index: number): React.ReactNode {
    const def = this.props.allAbilityDefs[instance.abilityDefId];
    const displayName = getAbilityInstanceDisplayName(instance);

    return (
      <TooltipSource
        className={styles.listRow}
        key={`abilityRow${index}`}
        tooltipParams={{
          id: def.name,
          content: () => {
            return (
              <div className={styles.tooltipRoot}>
                <div className={styles.tooltipHeader}>
                  <div className={styles.tooltipTitle}>{displayName}</div>
                </div>
                <div className={styles.tooltipText}>{def.descriptions[instance.rank - 1]}</div>
              </div>
            );
          },
        }}
      >
        <div className={styles.listName}>{displayName}</div>
      </TooltipSource>
    );
  }

  private onEditAbilitiesClicked(): void {
    //
    //
    //
    //
    // TODO: New dialog for proficiency selection.  Possibly it should have a callback so we can use it with CreateCharacterDialog?
    //
    //
    //
    //
    // this.props.dispatch?.(
    //   showSubPanel({
    //     id: "EditProficiencies",
    //     content: () => {
    //       return <EditProficienciesSubPanel />;
    //     },
    //   })
    // );
  }

  private getSortedAbilities(): AbilityInstancev2[] {
    const characterClass = getCombinedCharacterClass(this.props.characterId);

    const abilitiesByName: Record<string, AbilityInstancev2> = {};

    // Class abilities/proficiencies.

    let addToDisplayData = (instance: AbilityInstancev2, index: number) => {
      // Only include abilities this character has unlocked.
      if (this.props.character.level < instance.minLevel) {
        return;
      }

      const def = this.props.allAbilityDefs[instance.abilityDefId];
      // Skip any Ailments (they have their own section) and Other (not intended for display).
      if (def.type === AbilityType.Ailment || def.type === AbilityType.Hidden) {
        return;
      }

      const identifyingName = this.buildIdentifyingName(instance.abilityDefId, instance.subtype);
      if (!abilitiesByName[identifyingName]) {
        abilitiesByName[identifyingName] = {
          abilityDefId: instance.abilityDefId,
          rank: instance.rank ?? 1,
          subtype: instance.subtype,
          minLevel: instance.minLevel,
        };
      } else {
        abilitiesByName[identifyingName].rank += instance.rank;
      }

      // Cap combined ranks to max_ranks.
      abilitiesByName[identifyingName].rank = Math.min(def.max_ranks, abilitiesByName[identifyingName].rank);
    };

    // Class features.
    characterClass.class_features.forEach(addToDisplayData);
    this.props.character.abilities.selectableClassFeatures.forEach(addToDisplayData);
    // Chosen proficiencies.
    this.props.character.abilities.classProficiencies.forEach(addToDisplayData);
    this.props.character.abilities.generalProficiencies.forEach(addToDisplayData);
    this.props.character.abilities.intBonusProficiencies.forEach(addToDisplayData);
    this.props.character.abilities.extraProficiencies.forEach(addToDisplayData);

    // Sort the abilities alphabetically by display name (including subtype).
    const abilities = Object.entries(abilitiesByName)
      .sort((a, b) => {
        const [aIdentifyingName, aAbilityInstance] = a;
        const [bIdentifyingName, bAbilityInstance] = b;

        return aIdentifyingName.localeCompare(bIdentifyingName);
      })
      .map((e) => e[1]);

    return abilities;
  }

  private buildIdentifyingName(abilityId: number, subtype?: string): string {
    const def = this.props.allAbilityDefs[abilityId];

    let idName = def.name;

    if (subtype && subtype.length > 0) {
      idName = `${idName} (${subtype})`;
    }

    return idName;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { abilities: allAbilityDefs } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    character,
    allAbilityDefs,
  };
}

export const CharacterAbilitiesSection = connect(mapStateToProps)(ACharacterAbilitiesSection);
