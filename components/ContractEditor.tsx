/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./ContractEditor.module.scss";
import {
  ContractDefData,
  ContractId,
  ContractTerm,
  ContractTermType,
  getContractTermKey,
} from "../redux/gameDefsSlice";
import { ArmyData, CharacterData, ContractData, StorageData, StructureData } from "../serverAPI";
import { EditButton } from "./EditButton";
import { Dictionary } from "../lib/dictionary";
import { showModal } from "../redux/modalsSlice";
import { SelectStorageDialog } from "./dialogs/SelectStorageDialog";
import { getStorageDisplayName } from "../lib/storageUtils";
import { SelectAdventurerDialog } from "./dialogs/SelectAdventurerDialog";
import { InputSingleNumberDialog } from "./dialogs/InputSingleNumberDialog";
import { SelectStructureDialog } from "./dialogs/SelectStructureDialog";
import { SelectArmyDialog } from "./dialogs/SelectArmyDialog";

interface State {
  renderToggle: boolean;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  contract: ContractData;
  lockedTerms?: ContractTerm[];
}

interface InjectedProps {
  contractDef: ContractDefData;
  allArmies: Dictionary<ArmyData>;
  allCharacters: Dictionary<CharacterData>;
  allStorages: Dictionary<StorageData>;
  allStructures: Dictionary<StructureData>;
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class AContractEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { renderToggle: false };
  }

  public render(): React.ReactNode {
    const { className, contract, ...otherProps } = this.props;

    return (
      <div className={`${styles.root} ${className}`}>
        {this.props.contract.def_id === ContractId.Invalid ? (
          <div className={styles.typeError}>{"Invalid contract type."}</div>
        ) : (
          <>
            {this.renderWords()}
            {this.renderTerms()}
          </>
        )}
      </div>
    );
  }

  private renderWords(): React.ReactNode {
    const words = this.props.contractDef.description.split(" ");

    return (
      <div className={styles.wordsRow}>
        {words
          .map((word, index) => {
            // If a word has a token in it, replace the token with its matching Term.
            const termStartIndex = word.indexOf("{");
            const termEndIndex = word.indexOf("}");
            if (termStartIndex > -1 && termEndIndex > -1) {
              const wordStart = word.slice(0, termStartIndex);
              const termToken = word.slice(termStartIndex, termEndIndex + 1);
              const term = termToken.slice(1, -1);
              const termKey = getContractTermKey(term as ContractTerm);
              const wordEnd = word.slice(termEndIndex + 1);
              return [
                <div className={styles.contractText} key={`start${index}`}>
                  {wordStart}
                </div>,
                <div
                  className={`${styles.term} ${this.props.contract[termKey] ? styles.specified : styles.unspecified}`}
                  key={index}
                >
                  {term}
                </div>,
                <div className={styles.contractText} key={`end${index}`}>
                  {`${wordEnd}\xa0`}
                </div>,
              ];
            } else {
              return (
                <div className={styles.contractText} key={index}>
                  {`${word}\xa0`}
                </div>
              );
            }
          })
          .flat()}
      </div>
    );
  }

  private renderTerms(): React.ReactNode {
    return (
      <div className={styles.termsContainer}>
        <div className={styles.defineTermsLabel}>{"TERMS"}</div>
        {Object.entries(this.props.contractDef.terms).map(([aTerm, aType], index) => {
          const term = aTerm as ContractTerm; // String enum.
          const type = aType as ContractTermType; // String enum.
          const isLocked = this.props.lockedTerms?.includes(term);

          return (
            <div className={styles.row} key={index}>
              <div className={styles.termName}>{term}</div>
              <input type={"text"} className={styles.termValue} value={this.getTermValue(term, type)} disabled={true} />
              <EditButton
                className={`${styles.termEditButton} ${isLocked ? styles.locked : ""}`}
                onClick={this.onEditTermClicked.bind(this, term, type)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  private getTermValue(term: ContractTerm, type: ContractTermType): string {
    const termKey = getContractTermKey(term);
    const termValue = this.props.contract[termKey];

    switch (type) {
      case ContractTermType.Army: {
        const army = this.props.allArmies[+termValue];
        return army?.name ?? "---";
      }
      case ContractTermType.Character: {
        const character = this.props.allCharacters[+termValue];
        return character?.name ?? "---";
      }
      case ContractTermType.Number: {
        return `${termValue}`;
      }
      case ContractTermType.Storage: {
        return getStorageDisplayName(+termValue);
      }
      case ContractTermType.Structure: {
        const structure = this.props.allStructures[+termValue];
        return structure?.name ?? "---";
      }
      default: {
        return "TODO";
      }
    }
  }

  private onEditTermClicked(term: ContractTerm, type: ContractTermType): void {
    switch (type) {
      case ContractTermType.Army: {
        this.props.dispatch?.(
          showModal({
            id: "selectArmyTerm",
            content: () => {
              return (
                <SelectArmyDialog
                  preselectedArmyId={+this.props.contract[getContractTermKey(term)]}
                  onSelectionConfirmed={async (armyId: number) => {
                    this.props.contract[getContractTermKey(term)] = armyId as never;
                    this.rerender();
                  }}
                />
              );
            },
            escapable: true,
            widthVmin: 45,
          })
        );
        break;
      }
      case ContractTermType.Character: {
        this.props.dispatch?.(
          showModal({
            id: "selectCharacterTerm",
            content: () => {
              return (
                <SelectAdventurerDialog
                  preselectedAdventurerId={+this.props.contract[getContractTermKey(term)]}
                  onSelectionConfirmed={async (sourceAdventurerId: number) => {
                    this.props.contract[getContractTermKey(term)] = sourceAdventurerId as never;
                    this.rerender();
                  }}
                />
              );
            },
            escapable: true,
            widthVmin: 45,
          })
        );
        break;
      }
      case ContractTermType.Number: {
        this.props.dispatch?.(
          showModal({
            id: "selectNumberTerm",
            content: () => {
              return (
                <InputSingleNumberDialog
                  title={term}
                  prompt={`Please select a value for ${term}.`}
                  initialValue={+this.props.contract[getContractTermKey(term)]}
                  onValueConfirmed={async (value: number) => {
                    this.props.contract[getContractTermKey(term)] = value as never;
                    this.rerender();
                  }}
                />
              );
            },
          })
        );
        break;
      }
      case ContractTermType.Storage: {
        this.props.dispatch?.(
          showModal({
            id: "selectStorageTerm",
            content: () => {
              return (
                <SelectStorageDialog
                  preselectedStorageId={+this.props.contract[getContractTermKey(term)]}
                  onSelectionConfirmed={async (sourceStorageId: number) => {
                    this.props.contract[getContractTermKey(term)] = sourceStorageId as never;
                    this.rerender();
                  }}
                />
              );
            },
            escapable: true,
            widthVmin: 45,
          })
        );
        break;
      }
      case ContractTermType.Structure: {
        this.props.dispatch?.(
          showModal({
            id: "selectStructureTerm",
            content: () => {
              return (
                <SelectStructureDialog
                  preselectedStructureId={+this.props.contract[getContractTermKey(term)]}
                  onSelectionConfirmed={async (sourceStructureId: number) => {
                    this.props.contract[getContractTermKey(term)] = sourceStructureId as never;
                    this.rerender();
                  }}
                />
              );
            },
            escapable: true,
            widthVmin: 45,
          })
        );
        break;
      }
      default: {
        // TODO:
        break;
      }
    }
  }

  private rerender(): void {
    this.setState({ renderToggle: !this.state.renderToggle });
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const contractDef = state.gameDefs.contracts[ownProps.contract.def_id];
  const allArmies = state.armies.armies;
  const allCharacters = state.characters.characters;
  const allStorages = state.storages.allStorages;
  const allStructures = state.structures.structures;
  return {
    ...ownProps,
    contractDef,
    allArmies,
    allCharacters,
    allStorages,
    allStructures,
  };
}

export const ContractEditor = connect(mapStateToProps)(AContractEditor);
