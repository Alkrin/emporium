import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { StructureData, ContractData } from "../../serverAPI";
import styles from "./EditStructureMaintenanceContractDialog.module.scss";
import { SavingVeil } from "../SavingVeil";
import { ContractDefData, ContractId, ContractTerm } from "../../redux/gameDefsSlice";
import dateFormat from "dateformat";
import { ContractEditor } from "../ContractEditor";
import { deleteContract, updateContract } from "../../redux/contractsSlice";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  contract: ContractData;
  isSaving: boolean;
}

interface ReactProps {
  structureId: number;
  contract?: ContractData;
}

interface InjectedProps {
  structure: StructureData;
  contractDef: ContractDefData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditStructureMaintenanceContractDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      contract: props.contract
        ? { ...props.contract }
        : {
            id: 0,
            def_id: ContractId.StructureMaintenanceContract,
            party_a_id: 0,
            party_b_id: props.structureId,
            target_a_id: 0,
            target_b_id: 0,
            value: 0,
            exercise_date: "",
          },
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.structureName}>{this.props.structure.name}</div>
        <div className={styles.contractTitle}>{"Maintenance Contract"}</div>

        <ContractEditor
          className={styles.contractContainer}
          contract={this.state.contract}
          lockedTerms={[ContractTerm.PartyB]}
        />

        <div className={styles.actionButton} onClick={this.onSaveClicked.bind(this)}>
          Save Changes
        </div>
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
    if (this.state.contract.party_a_id && this.state.contract.target_a_id) {
      this.setState({ isSaving: true });
      if (this.state.contract.id) {
        // Edit existing contract.
        const res = await ServerAPI.editContract(this.state.contract);
        if ("error" in res) {
          this.props.dispatch?.(
            showModal({
              id: "EditContractError",
              content: () => <BasicDialog title={"Error!"} prompt={"An Error occurred during contract alteration."} />,
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
              content: () => <BasicDialog title={"Error!"} prompt={"An Error occurred during contract creation."} />,
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
          content: () => (
            <BasicDialog
              title={"Delete Contract?"}
              prompt={"These contract terms are invalid.  Do you wish to delete the contract?"}
              buttons={[
                {
                  text: "Delete",
                  onClick: async () => {
                    const dres = await ServerAPI.deleteContract(this.state.contract.id);
                    if ("error" in dres) {
                      this.props.dispatch?.(
                        showModal({
                          id: "DeleteContractError",
                          content: () => (
                            <BasicDialog title={"Error!"} prompt={"An Error occurred during contract deletion."} />
                          ),
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
                { text: "Cancel" },
              ]}
            />
          ),
        })
      );
    } else {
      this.props.dispatch?.(
        showModal({
          id: "CreateContractError",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"All Terms must be specified in order to create a contract."} />
          ),
        })
      );
    }
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const structure = state.structures.structures[props.structureId];
  const contractDef = state.gameDefs.contracts[ContractId.StructureMaintenanceContract];
  return {
    ...props,
    structure,
    contractDef,
  };
}

export const EditStructureMaintenanceContractDialog = connect(mapStateToProps)(AEditStructureMaintenanceContractDialog);
