import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterLanguagesSection.module.scss";
import {
  AbilityComponentInstance,
  getCharacterStatv2,
  getCharacterLanguageCapacity,
  getCharacterKnownLanguages,
} from "../../../lib/characterUtils";
import { CharacterStat } from "../../../staticData/types/characterClasses";
import { AbilityComponentLanguageReadWriteOverride } from "../../../staticData/abilityComponents/AbilityComponentLanguageReadWriteOverride";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { EditLanguagesDialog } from "../dialogs/EditLanguagesDialog";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterLanguagesSection extends React.Component<Props> {
  render(): React.ReactNode {
    const { activeComponents, character } = this.props;

    const languages = getCharacterKnownLanguages(character, activeComponents);
    const languageCapacity = getCharacterLanguageCapacity(character, activeComponents);

    const intValue = getCharacterStatv2(character, CharacterStat.Intelligence, activeComponents);
    const isLiterate =
      intValue >= 9 || (activeComponents[AbilityComponentLanguageReadWriteOverride.id]?.length ?? 0) > 0;

    return (
      <div className={styles.root}>
        <div className={styles.centeredRow}>
          <div className={styles.title}>{`Languages`}</div>
          <div className={styles.capacity}>{`(${languages.length}/${languageCapacity})`}</div>
          <EditButton className={styles.editButton} onClick={this.onEditClick.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        {languages.map(this.renderLanguageRow.bind(this, isLiterate))}
      </div>
    );
  }

  private renderLanguageRow(isLiterate: boolean, language: string, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`languageRow${index}`}>
        <div className={styles.listName}>{`${language}${isLiterate ? "" : " (spoken)"}`}</div>
      </div>
    );
  }

  private onEditClick(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditLanguages",
        content: () => {
          return (
            <EditLanguagesDialog characterId={this.props.characterId} activeComponents={this.props.activeComponents} />
          );
        },
        escapable: true,
      })
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

export const CharacterLanguagesSection = connect(mapStateToProps)(ACharacterLanguagesSection);
