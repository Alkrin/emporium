import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { RootState } from "../../../redux/store";
import { ArmyData, CharacterData, ContractData, StorageData, StructureData } from "../../../serverAPI";
import styles from "./CharacterContractsDialog.module.scss";
import { Dictionary } from "../../../lib/dictionary";
import { ContractDefData, ContractId, ContractTerm, ContractTermType } from "../../../redux/gameDefsSlice";
import { EditButton } from "../../EditButton";
import { EditContractDialog } from "./EditContractDialog";
import { getPersonalPile } from "../../../lib/characterUtils";

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allCharacters: Dictionary<CharacterData>;
  allContracts: Dictionary<ContractData>;
  allStructures: Dictionary<StructureData>;
  allArmies: Dictionary<ArmyData>;
  allStorages: Dictionary<StorageData>;
  contractsByDefByPartyAId: Dictionary<Dictionary<ContractData[]>>;
  contractsByDefByPartyBId: Dictionary<Dictionary<ContractData[]>>;
  contractDefs: Dictionary<ContractDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterContractsDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{`${this.props.character.name}'s Contracts`}</div>

        <div className={styles.column}>
          <div className={styles.row}>
            <div className={styles.listContainer}>
              {this.renderCharacterWageContractsSection()}
              {this.renderAllLootContractsSection()}
              {this.renderPartiedLootContractsSection()}
              {this.renderUnpartiedLootContractsSection()}
              {this.renderArmyWageContractsSection()}
              {this.renderStructureMaintenanceContractsSection()}
            </div>
          </div>
          <div className={styles.closeButton} onClick={this.onCreateNewClicked.bind(this)}>
            Create New
          </div>
          <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
            Close
          </div>
        </div>
      </div>
    );
  }

  private renderCharacterWageContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.CharacterWageContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Character Wage Contracts"}</div>
        {c.length === 0 && this.props.character.user_id === 1 && (
          <div className={styles.generateContractRow}>
            <div
              className={styles.generateContractButton}
              onClick={this.onGenerateEmporiumWageContractClicked.bind(this)}
            >
              {"Generate Emporium Contract"}
            </div>
          </div>
        )}
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private renderAllLootContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.ActivityLootContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Activity Loot Contracts"}</div>
        {c.length === 0 && this.props.character.user_id === 1 && (
          <div className={styles.generateContractRow}>
            <div
              className={styles.generateContractButton}
              onClick={this.onGenerateEmporiumLootContractClicked.bind(this)}
            >
              {"Generate Emporium Contract"}
            </div>
          </div>
        )}
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private renderPartiedLootContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.PartiedLootContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Partied Loot Contracts"}</div>
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private renderUnpartiedLootContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.UnpartiedLootContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Unpartied Loot Contracts"}</div>
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private renderArmyWageContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.ArmyWageContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Army Wage Contracts"}</div>
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private renderStructureMaintenanceContractsSection(): React.ReactNode {
    const c = this.getSortedContracts(ContractId.StructureMaintenanceContract);
    return (
      <>
        <div className={styles.sectionHeader}>{"Structure Maintenance Contracts"}</div>
        {c.map(this.renderContractRow.bind(this))}
        <div style={{ height: "0.25vmin" }} />
      </>
    );
  }

  private getSortedContracts(type: ContractId): ContractData[] {
    let cpa: ContractData[] = [];
    let cpb: ContractData[] = [];

    const contractSort = (ca: ContractData, cb: ContractData) => {
      const otherPartyNameA = this.getOtherPartyName(ca);
      const otherPartyNameB = this.getOtherPartyName(cb);

      return otherPartyNameA.localeCompare(otherPartyNameB);
    };

    // Contracts where this character is PartyA first.  Alphy after.
    if (this.props.contractsByDefByPartyAId[type]?.[this.props.character.id]) {
      cpa = [...this.props.contractsByDefByPartyAId[type][this.props.character.id]];
      cpa.sort(contractSort);
    }

    // Contracts where this character is PartyB second.  Alphy after.
    if (this.props.contractsByDefByPartyBId[type]?.[this.props.character.id]) {
      cpb = [...this.props.contractsByDefByPartyBId[type][this.props.character.id]];
      cpb.sort(contractSort);
    }

    return [...cpa, ...cpb];
  }

  private renderContractRow(contract: ContractData): React.ReactNode {
    const otherPartyName = this.getOtherPartyName(contract);

    return (
      <div className={styles.contractListRow} key={contract.id}>
        <div className={styles.contractListName}>{otherPartyName}</div>
        <EditButton className={styles.editButton} onClick={this.onEditContractClicked.bind(this, contract)} />
      </div>
    );
  }

  private onGenerateEmporiumWageContractClicked(): void {
    // If there is an Emporium treasury at this character's location, default to using that treasury.
    const treasury = Object.values(this.props.allStorages).find((s) => {
      return (
        s.location_id === this.props.character.location_id && s.name.includes("Emporium") && s.name.includes("Treasury")
      );
    });

    const contract: ContractData = {
      id: 0,
      def_id: ContractId.CharacterWageContract,
      party_a_id: 23, // Trasta.
      party_b_id: this.props.character.id,
      target_a_id: treasury?.id ?? 0,
      target_b_id: getPersonalPile(this.props.character.id).id,
      value: 0,
      exercise_date: "",
    };

    this.onEditContractClicked(contract);
  }

  private onGenerateEmporiumLootContractClicked(): void {
    // If there is an Emporium treasury at this character's location, default to using that treasury.
    const treasury = Object.values(this.props.allStorages).find((s) => {
      return (
        s.location_id === this.props.character.location_id && s.name.includes("Emporium") && s.name.includes("Treasury")
      );
    });

    const contract: ContractData = {
      id: 0,
      def_id: ContractId.ActivityLootContract,
      party_a_id: this.props.character.id,
      party_b_id: 23, // Trasta.
      target_a_id: treasury?.id ?? 0,
      target_b_id: 0,
      value: 50,
      exercise_date: "",
    };

    this.onEditContractClicked(contract);
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "createNewContract",
        content: () => {
          // By not passing in a contract, this functions as a Create dialog.
          return <EditContractDialog character={this.props.character} />;
        },
      })
    );
  }

  private onEditContractClicked(contract: ContractData): void {
    this.props.dispatch?.(
      showModal({
        id: "editContract",
        content: () => {
          return <EditContractDialog character={this.props.character} contract={contract} />;
        },
      })
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private getOtherPartyName(contract: ContractData): string {
    const def = this.props.contractDefs[contract.def_id];

    const selfIsPartyA =
      def.terms[ContractTerm.PartyA] === ContractTermType.Character && contract.party_a_id === this.props.character.id;
    const otherPartyId = selfIsPartyA ? contract.party_b_id : contract.party_a_id;

    switch (def.terms[selfIsPartyA ? ContractTerm.PartyB : ContractTerm.PartyA]) {
      case ContractTermType.Army: {
        return this.props.allArmies[otherPartyId].name;
      }
      case ContractTermType.Character: {
        return this.props.allCharacters[otherPartyId].name;
      }
      case ContractTermType.Structure: {
        return this.props.allStructures[otherPartyId].name;
      }
      default: {
        return `Unknown: ${otherPartyId}`;
      }
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const allCharacters = state.characters.characters;
  const allStructures = state.structures.structures;
  const allArmies = state.armies.armies;
  const allStorages = state.storages.allStorages;
  const { allContracts, contractsByDefByPartyAId, contractsByDefByPartyBId } = state.contracts;
  const contractDefs = state.gameDefs.contracts;
  return {
    ...props,
    character,
    allCharacters,
    allContracts,
    allStructures,
    allArmies,
    allStorages,
    contractsByDefByPartyAId,
    contractsByDefByPartyBId,
    contractDefs,
  };
}

export const CharacterContractsDialog = connect(mapStateToProps)(ACharacterContractsDialog);
