import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import ServerAPI, { CharacterData } from "../../../serverAPI";
import Draggable from "../../Draggable";
import { DraggableHandle } from "../../DraggableHandle";
import DropTarget from "../../DropTarget";
import styles from "./EditLanguagesDialog.module.scss";
import {
  AbilityComponentInstance,
  getCharacterGrantedLanguages,
  getCharacterLanguageCapacity,
} from "../../../lib/characterUtils";
import {
  AbilityComponentLanguageCapability,
  AbilityComponentLanguageCapabilityData,
} from "../../../staticData/abilityComponents/AbilityComponentLanguageCapability";
import { AllLanguagesArray } from "../../../lib/languages";
import { setCharacterLanguages } from "../../../redux/charactersSlice";
import { showModal } from "../../../redux/modalsSlice";
import { BasicDialog } from "../../dialogs/BasicDialog";
import { ModalCloseButton } from "../../ModalCloseButton";

const DropTypeLanguage = "Language";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditLanguagesDialog extends React.Component<Props> {
  render(): React.ReactNode {
    const { activeComponents, character } = this.props;
    const languageCapacity = getCharacterLanguageCapacity(character, activeComponents);
    const grantedLanguages = getCharacterGrantedLanguages(character, activeComponents);
    const choiceCount = languageCapacity - grantedLanguages.length;

    return (
      <div className={styles.root}>
        <div className={styles.grantedLanguagesRoot}>
          <div className={styles.sectionTitle}>{"Granted Languages"}</div>
          <div className={styles.grantedLanguagesList}>
            {this.getGrantedLanguages().map(this.renderGrantedLanguageRow.bind(this))}
          </div>
        </div>
        <div className={styles.chosenLanguagesRoot}>
          <div className={styles.sectionTitle}>{`Chosen Languages (${character.languages.length}/${choiceCount})`}</div>
          <div className={styles.chosenLanguagesList}>{this.renderChosenLanguagesSlots(choiceCount)}</div>
        </div>
        <div className={styles.availableLanguagesRoot}>
          <div className={styles.sectionTitle}>{"Available Languages"}</div>
          <div className={styles.availableLanguagesList}>
            {this.getAvailableLanguages().map(this.renderAvailableLanguageRow.bind(this))}
          </div>
        </div>
        <ModalCloseButton />
      </div>
    );
  }

  private renderChosenLanguagesSlots(choiceCount: number): React.ReactNode {
    const { character } = this.props;

    // It is possible for a character to learn a language, and then have their capacity reduced by a curse or injury.
    // In that case we will still show the extra language(s), but not allow new values to be assigned to that slot.
    const totalSlots = Math.max(choiceCount, character.languages.length);

    if (totalSlots === 0) {
      return <div className={styles.noSlots}>{"No slots available"}</div>;
    }

    const slots: React.ReactNode[] = [];
    for (let i = 0; i < totalSlots; ++i) {
      if (i < choiceCount) {
        slots.push(this.renderChoiceSlot(character.languages[i] ?? "", i));
      } else {
        slots.push(this.renderExcessChoiceSlot(character.languages[i], i));
      }
    }

    return slots;
  }

  private renderChoiceSlot(language: string, index: number): React.ReactNode {
    // Full or empty, but able to recieve a new language drop.
    return (
      <div className={styles.languageSlotRow} key={`chosenLanguageRow${index}`}>
        <DropTarget dropTypes={[DropTypeLanguage]} dropId={`Language${index}`} className={styles.languageSlot}>
          {language.length > 0 && <div className={styles.assignedLanguageName}>{language}</div>}
        </DropTarget>
        {language.length > 0 && (
          <div className={styles.cancelButton} onClick={this.onRemoveLanguageClicked.bind(this, index)} />
        )}
      </div>
    );
  }

  private renderExcessChoiceSlot(language: string, index: number): React.ReactNode {
    // Full, unable to receive new language drops, removable.
    return (
      <div className={styles.languageSlotRow} key={`chosenLanguageRow${index}`}>
        <div className={`${styles.languageSlot} ${styles.excess}`}>
          <div className={styles.assignedLanguageName}>{language}</div>
        </div>
        <div className={styles.cancelButton} onClick={this.onRemoveLanguageClicked.bind(this, index)} />
      </div>
    );
  }

  private getAvailableLanguages(): string[] {
    // Any language the character hasn't already chosen is available to choose.
    return AllLanguagesArray.filter((language) => !this.props.character.languages.includes(language));
  }

  private renderAvailableLanguageRow(language: string): React.ReactNode {
    const draggableId = `DragAvailableLanguage:${language}`;
    return (
      <Draggable className={styles.availableLanguageRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.availableLanguageRowDraggableHandle}
          draggableId={draggableId}
          dropTypes={[DropTypeLanguage]}
          draggingRender={() => {
            return this.renderAvailableLanguageRowContents(language);
          }}
          dropHandler={(dropTargetIds) => {
            this.handleLanguageDropped(dropTargetIds[0], language);
          }}
        ></DraggableHandle>
        {this.renderAvailableLanguageRowContents(language)}
      </Draggable>
    );
  }

  private handleLanguageDropped(dropTargetId: string | null, language: string): void {
    // If the language was dropped into open space, we don't have to do anything.
    if (!dropTargetId || dropTargetId.length === 0) {
      return;
    }

    if (dropTargetId.startsWith("Language")) {
      const index = +dropTargetId.slice(8);

      const languages = [...this.props.character.languages];
      while (languages.length < index + 1) {
        languages.push("");
      }
      languages[index] = language;

      this.performUpdates(languages);
    }
  }

  private async performUpdates(languages: string[]): Promise<void> {
    // Send the update out to the server.
    const result = await ServerAPI.setCharacterLanguages(this.props.character.id, languages);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setLanguages Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update Languages.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(setCharacterLanguages({ characterId: this.props.character.id, languages }));
    }
  }

  private renderAvailableLanguageRowContents(language: string): React.ReactNode {
    return (
      <div className={styles.availableLanguageRowContentWrapper}>
        <div className={styles.availableLanguageName}>{language}</div>
      </div>
    );
  }

  private onRemoveLanguageClicked(index: number): void {
    const { activeComponents, character } = this.props;
    // Clear the item in the given slot.
    let languages = [...this.props.character.languages];
    languages[index] = "";

    // If there are any empty excess slots, remove them.
    const languageCapacity = getCharacterLanguageCapacity(character, activeComponents);
    const grantedLanguages = getCharacterGrantedLanguages(character, activeComponents);
    const choiceCount = languageCapacity - grantedLanguages.length;

    languages = languages.filter((l, index) => {
      // Keep any values in non-excess slots.
      if (index < choiceCount) {
        return true;
      }
      // Keep any excess slots that are not empty.
      return l.trim().length > 0;
    });

    this.performUpdates(languages);
  }

  private getGrantedLanguages(): string[] {
    // Ability/Item-granted languages (may have duplicates).
    const languages: string[] = (this.props.activeComponents[AbilityComponentLanguageCapability.id] ?? []).reduce<
      string[]
    >((soFar: string[], instance: AbilityComponentInstance) => {
      const instanceData = instance.data as AbilityComponentLanguageCapabilityData;
      if (!soFar.includes(instanceData.language)) {
        soFar.push(instanceData.language);
      }
      return soFar;
    }, []);
    return languages;
  }

  private renderGrantedLanguageRow(language: string, index: number): React.ReactNode {
    return (
      <div className={styles.grantedLanguageRow} key={`grantedLanguageRow${index}`}>
        <div className={styles.listName}>{language}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId];
  return {
    ...props,
    character,
  };
}

export const EditLanguagesDialog = connect(mapStateToProps)(AEditLanguagesDialog);
