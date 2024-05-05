import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData, ContractData } from "../../serverAPI";
import styles from "./EditContractDialog.module.scss";
import { SavingVeil } from "../SavingVeil";
import { ContractDefData, ContractId, ContractTerm, getContractTermKey } from "../../redux/gameDefsSlice";
import dateFormat from "dateformat";
import { ContractEditor } from "../ContractEditor";
import { deleteContract, updateContract } from "../../redux/contractsSlice";
import { Dictionary } from "../../lib/dictionary";

interface State {
  isEditing: boolean;
  contract: ContractData;
  isSaving: boolean;
}

interface ReactProps {
  character: CharacterData;
  contract?: ContractData;
  lockedTerms?: ContractTerm[];
}

interface InjectedProps {
  contractDefs: Dictionary<ContractDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditContractDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isEditing: !!props.contract?.id, // Editing if a complete contract (with valid id) was passed in.
      contract: props.contract
        ? { ...props.contract }
        : {
            id: 0,
            def_id: ContractId.Invalid,
            party_a_id: props.character.id,
            party_b_id: 0,
            target_a_id: 0,
            target_b_id: 0,
            value: 0,
            exercise_date: "",
          },
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const def = this.props.contractDefs[this.state.contract.def_id];
    const allContractTypesArray = Object.values(this.props.contractDefs).sort((defA, defB) => {
      return defA.name.localeCompare(defB.name);
    });

    return (
      <div className={styles.root}>
        <div className={styles.characterName}>{this.props.character.name}</div>
        <select
          className={styles.typeSelector}
          value={this.state.contract.def_id}
          onChange={(e) => {
            this.setState({
              contract: { ...this.state.contract, def_id: +e.currentTarget.value },
            });
          }}
          disabled={this.state.isEditing}
        >
          <option value={"0"}>---</option>
          {allContractTypesArray.map(({ id, name }) => {
            return (
              <option value={id} key={`type${id}`}>
                {name}
              </option>
            );
          })}
        </select>

        <ContractEditor
          className={styles.contractContainer}
          contract={this.state.contract}
          lockedTerms={this.props.lockedTerms}
        />

        <div className={styles.actionButton} onClick={this.onSaveClicked.bind(this)}>
          Save Changes
        </div>
        {this.state.isEditing && (
          <div className={styles.actionButton} onClick={this.onDeleteClicked.bind(this)}>
            Delete Contract
          </div>
        )}
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // Validate the contract.
    const def = this.props.contractDefs[this.state.contract.def_id];
    let isValid = !!def;
    if (isValid) {
      // Check terms for the chosen contract type.
      Object.keys(def.terms).forEach((term) => {
        const termKey = getContractTermKey(term as ContractTerm);
        if (!this.state.contract[termKey]) {
          isValid = false;
        }
      });
    }

    if (isValid) {
      this.setState({ isSaving: true });
      if (this.state.contract.id) {
        // Edit existing contract.
        const res = await ServerAPI.editContract(this.state.contract);
        if ("error" in res) {
          this.props.dispatch?.(
            showModal({
              id: "EditContractError",
              content: { title: "Error", message: "An Error occurred during contract alteration." },
            })
          );
        } else {
          this.props.dispatch?.(updateContract(this.state.contract));
          this.props.dispatch?.(hideModal());
        }
      } else {
        // Create new contract.
        const res = await ServerAPI.createContract(this.state.contract);
        if ("error" in res) {
          this.props.dispatch?.(
            showModal({
              id: "CreateContractError",
              content: { title: "Error", message: "An Error occurred during contract creation." },
            })
          );
        } else {
          this.state.contract.id = res.insertId;
          this.props.dispatch?.(updateContract(this.state.contract));
          this.props.dispatch?.(hideModal());
        }
      }
      this.setState({ isSaving: false });
    } else if (this.state.contract.id) {
      // Prompt to delete.
      this.props.dispatch?.(
        showModal({
          id: "DeleteContract",
          content: {
            title: "Delete Contract?",
            message: "These contract terms are invalid.  Do you wish to delete the contract?",
            buttonText: "Cancel",
            onButtonClick: async () => {
              this.props.dispatch?.(hideModal());
            },
            extraButtons: [
              {
                text: "Delete",
                onClick: async () => {
                  const dres = await ServerAPI.deleteContract(this.state.contract.id);
                  if ("error" in dres) {
                    this.props.dispatch?.(
                      showModal({
                        id: "DeleteContractError",
                        content: { title: "Error", message: "An Error occurred during contract deletion." },
                      })
                    );
                  } else {
                    this.props.dispatch?.(deleteContract(this.state.contract.id));
                    // Close the confirmation dialog.
                    this.props.dispatch?.(hideModal());
                    // Close the contract dialog.
                    this.props.dispatch?.(hideModal());
                  }
                },
              },
            ],
          },
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(
        showModal({
          id: "CreateContractError",
          content: { title: "Error", message: "All Terms must be specified in order to create a contract." },
        })
      );
    }
  }

  private async onDeleteClicked(): Promise<void> {
    // Prompt to delete.
    this.props.dispatch?.(
      showModal({
        id: "DeleteContract",
        content: {
          title: "Delete Contract?",
          message: "Are you sure you wish to delete the contract?",
          buttonText: "Cancel",
          onButtonClick: async () => {
            this.props.dispatch?.(hideModal());
          },
          extraButtons: [
            {
              text: "Delete",
              onClick: async () => {
                const dres = await ServerAPI.deleteContract(this.state.contract.id);
                if ("error" in dres) {
                  this.props.dispatch?.(
                    showModal({
                      id: "DeleteContractError",
                      content: { title: "Error", message: "An Error occurred during contract deletion." },
                    })
                  );
                } else {
                  this.props.dispatch?.(deleteContract(this.state.contract.id));
                  // Close the confirmation dialog.
                  this.props.dispatch?.(hideModal());
                  // Close the contract dialog.
                  this.props.dispatch?.(hideModal());
                }
              },
            },
          ],
        },
        escapable: true,
      })
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const contractDefs = state.gameDefs.contracts;
  return {
    ...props,
    contractDefs,
  };
}

export const EditContractDialog = connect(mapStateToProps)(AEditContractDialog);
