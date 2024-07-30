import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./DashboardPanel.module.scss";
import ServerAPI, { CharacterData, ContractData, ItemData, StorageData } from "../../serverAPI";
import { EditButton } from "../EditButton";
import { showModal } from "../../redux/modalsSlice";
import { SelectAdventurerDialog } from "../dialogs/SelectAdventurerDialog";
import { dashboardLocalStore } from "../../localStores/dashboardLocalStore";
import { setActiveCharacterId, setDashboardCharacterId } from "../../redux/charactersSlice";
import { addCommasToNumber, getCostOfLivingForCharacter, getPersonalPile } from "../../lib/characterUtils";
import { Dictionary } from "../../lib/dictionary";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { UserRole } from "../../redux/userSlice";
import { ContractId } from "../../redux/gameDefsSlice";
import { getArmyTotalWages } from "../../lib/armyUtils";
import { getStructureMonthlyMaintenance } from "../../lib/structureUtils";
import dateFormat from "dateformat";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { refetchContracts } from "../../dataSources/ContractsDataSource";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchArmies } from "../../dataSources/ArmiesDataSource";
import { refetchStructures } from "../../dataSources/StructuresDataSource";
import { SavingVeil } from "../SavingVeil";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { InfoButton } from "../InfoButton";
import { EditMoneyDialog } from "../characters/EditMoneyDialog";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { SubPanelPane } from "../SubPanelPane";
import { EditStoragesSubPanel } from "../characters/EditStoragesSubPanel";
import { setActiveStorageId } from "../../redux/storageSlice";

interface State {
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  dashboardCharacterId: number;
  allStorages: Dictionary<StorageData>;
  allItems: Dictionary<ItemData>;
  allCharacters: Dictionary<CharacterData>;
  contractsByDefByPartyAId: Dictionary<Dictionary<ContractData[]>>;
  contractsByDefByPartyBId: Dictionary<Dictionary<ContractData[]>>;
  activeRole: UserRole;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADashboardPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.props.dispatch?.(setActiveCharacterId(props.dashboardCharacterId));

    this.state = {
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.characterSelectorPanel}>
          <div className={styles.characterSelectorLabel}>{"Active Character:\xa0"}</div>
          <div className={styles.characterSelectorValue}>{this.props.character?.name ?? "---"}</div>
          <EditButton className={styles.editButton} onClick={this.onSelectActiveCharacterClicked.bind(this)} />
        </div>
        {this.renderFinancesPanel()}
        {this.renderCostOfLivingPanel()}
        <SubPanelPane />
        <SavingVeil show={this.state.isSaving} textOverride={"Making Payments..."} />
      </div>
    );
  }

  private renderFinancesPanel(): React.ReactNode {
    const storages = this.getSortedStorages();
    return (
      <div className={styles.financesPanel}>
        <div className={styles.panelTitle}>{"Finances"}</div>
        <div className={styles.storagesPanel}>
          <div className={styles.storageFirstColumn}>
            <div className={styles.storageHeader}>{"Account"}</div>
            {storages.map((s, index) => {
              const rowStyle = index % 2 ? styles.odd : "";
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  <div className={styles.storageName}>{getStorageDisplayName(s.id)}</div>
                </div>
              );
            })}
          </div>
          <div className={styles.storageOtherColumn}>
            <div className={styles.storageHeader}>{"Funds"}</div>
            {storages.map((s, index) => {
              const rowStyle = index % 2 ? styles.odd : "";
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  <div className={styles.storageMoney}>{addCommasToNumber(s.money, 2)}</div>
                  <EditButton className={styles.editButtonInline} onClick={this.onEditFundsClicked.bind(this, s)} />
                </div>
              );
            })}
          </div>
          <div className={styles.storageOtherColumn}>
            <div className={styles.storageHeader}>{"Expenses"}</div>
            {storages.map((s, index) => {
              const rowStyle = index % 2 ? styles.odd : "";
              const expenses = this.getExpensesForStorage(s.id);
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  <div className={styles.storageExpense}>{addCommasToNumber(expenses, 2)}</div>
                  <InfoButton
                    className={styles.infoButton}
                    tooltipParams={{
                      id: ``,
                      content: this.renderExpensesTooltip.bind(this, s),
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles.storageOtherColumn}>
            <div className={styles.storageHeader}>{dateFormat(new Date(), "mmm yyyy")}</div>
            {storages.map((s, index) => {
              const rowStyle = index % 2 ? styles.odd : "";
              const unpaidContracts = this.getUnpaidContractsForStorage(s.id);
              const unpaidAmount = this.getUnpaidAmountForContracts(unpaidContracts);
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  <div className={`${styles.financeStatusLabel} ${unpaidAmount > 0 ? styles.Unpaid : styles.Paid}`}>
                    {unpaidAmount > 0 ? `${addCommasToNumber(unpaidAmount, 2)}` : `Paid`}
                  </div>
                  {unpaidAmount > 0 && unpaidAmount <= s.money && (
                    <div className={styles.payButton} onClick={this.onPayClicked.bind(this, s.id)}>
                      {"PAY"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.storageOtherColumn}>
            <div className={styles.storageHeader}>{"Armories"}</div>
            {storages.map((s, index) => {
              const rowStyle = index % 2 ? styles.odd : "";
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  {"\xa0\xa0\xa0\xa0\xa0"}
                  <EditButton className={styles.editButtonInline} onClick={this.onViewItemsClick.bind(this, s.id)} />
                  {"\xa0"}
                </div>
              );
            })}
          </div>
          <div className={styles.storageOtherColumn}>
            <div className={styles.storageHeader}>{"For Sale"}</div>
            {storages.map((s, index) => {
              const itemsForSale = Object.values(this.props.allItems).filter((item) => {
                return item.is_for_sale && item.storage_id === s.id;
              });
              const rowStyle = index % 2 ? styles.odd : "";
              return (
                <div className={`${styles.storageCell} ${rowStyle}`} key={index}>
                  <div className={styles.forSaleCount}>
                    {itemsForSale.length === 0 ? "\xa0" : addCommasToNumber(itemsForSale.length, 0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  private onViewItemsClick(storageId: number): void {
    this.props.dispatch?.(setActiveStorageId(storageId));
    this.props.dispatch?.(
      showSubPanel({
        id: "EditStorages",
        content: () => {
          return <EditStoragesSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private renderExpensesTooltip(storage: StorageData): React.ReactNode {
    return (
      <div className={styles.expensesTooltipRoot}>
        <div className={styles.expensesTooltipHeader}>{getStorageDisplayName(storage.id)}</div>
        <div className={styles.row}>
          <div className={styles.expensesTooltipExpenseType}>{"Character Wages:\xa0"}</div>
          <div className={styles.expensesTooltipExpenseAmount}>
            {addCommasToNumber(this.getCharacterWagesForStorage(storage.id), 2)}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.expensesTooltipExpenseType}>{"Army Wages:\xa0"}</div>
          <div className={styles.expensesTooltipExpenseAmount}>
            {addCommasToNumber(this.getArmyWagesForStorage(storage.id), 2)}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.expensesTooltipExpenseType}>{"Structure Maintenance:\xa0"}</div>
          <div className={styles.expensesTooltipExpenseAmount}>
            {addCommasToNumber(this.getStructureMaintenanceForStorage(storage.id), 2)}
          </div>
        </div>
      </div>
    );
  }

  private renderCostOfLivingPanel(): React.ReactNode {
    const destitute = this.getCharactersWhoNeedToPayCostOfLivingButCantAffordIt().sort(
      ({ name: nameA }, { name: nameB }) => {
        return nameA.localeCompare(nameB);
      }
    );
    const rich = this.getCharactersWhoNeedToPayCostOfLivingAndCanAffordIt();
    const paid = this.getCharactersWhoHavePaidCostOfLiving();
    return (
      <div className={styles.costOfLivingPanel}>
        <div className={styles.panelTitle}>{`Cost Of Living, ${dateFormat(new Date(), "mmm yyyy")}`}</div>
        <div className={styles.costOfLivingDataRow}>
          <div className={styles.costOfLivingLabel}>{"Insolvent Unpaid Characters:\xa0"}</div>
          <div className={styles.costOfLivingValue}>{destitute.length}</div>
          <InfoButton
            className={styles.infoButton}
            tooltipParams={{
              id: "DestituteCharacters",
              content: () => {
                const toShow = destitute.slice(0, 9);
                return toShow.length === 0 ? null : (
                  <div className={styles.destituteTooltipRoot}>
                    {toShow.map((d, index) => {
                      return (
                        <div className={styles.destituteTooltipRow} key={index}>
                          {d.name}
                        </div>
                      );
                    })}
                    {toShow.length < destitute.length && <div className={styles.destituteTooltipRow}>{"..."}</div>}
                  </div>
                );
              },
            }}
          />
        </div>
        <div className={styles.costOfLivingDataRow}>
          <div className={styles.costOfLivingLabel}>{"Solvent Unpaid Characters:\xa0"}</div>
          <div className={styles.costOfLivingValue}>{rich.length}</div>
        </div>
        <div className={styles.costOfLivingDataRow}>
          <div className={styles.costOfLivingLabel}>{"Paid Characters:\xa0"}</div>
          <div className={styles.costOfLivingValue}>{paid.length}</div>
        </div>
        {rich.length > 0 && (
          <div className={styles.payCostOfLivingButton} onClick={this.onPayCostOfLivingClicked.bind(this)}>
            {"Make Payments"}
          </div>
        )}
      </div>
    );
  }

  private async onEditFundsClicked(storage: StorageData): Promise<void> {
    this.props.dispatch?.(
      showModal({
        id: `EditFunds${storage.id}`,
        content: () => {
          return <EditMoneyDialog storageId={storage.id} />;
        },
        escapable: true,
      })
    );
  }

  private async onPayCostOfLivingClicked(): Promise<void> {
    this.setState({ isSaving: true });
    const unpaid = this.getCharactersWhoNeedToPayCostOfLivingAndCanAffordIt();

    const res = await ServerAPI.payCostOfLiving(
      unpaid,
      unpaid.map((c) => {
        return getCostOfLivingForCharacter(c.id);
      })
    );
    if ("error" in res || res.find((r) => "error" in r)) {
      // Error modal.
      this.props.dispatch?.(
        showModal({
          id: "PayCostOfLivingError",
          content: { title: "Error", message: "An Error occurred while attempting to pay Cost Of Living expenses." },
        })
      );
    } else {
      if (this.props.dispatch) {
        await refetchCharacters(this.props.dispatch);
        await refetchStorages(this.props.dispatch);
      }
    }

    this.setState({ isSaving: false });
  }

  private getCharactersWhoNeedToPayCostOfLiving(): CharacterData[] {
    const thisMonth = getFirstOfThisMonthDateString();
    const characters: CharacterData[] = Object.values(this.props.allCharacters).filter((c) => {
      // Corpses don't pay maintenance.
      if (c.dead) return false;

      const isUnpaid = c.maintenance_date !== thisMonth;
      const isOwnedByUser = c.user_id === this.props.currentUserId;

      return isUnpaid && isOwnedByUser;
    });

    return characters;
  }

  private getCharactersWhoNeedToPayCostOfLivingAndCanAffordIt(): CharacterData[] {
    const characters: CharacterData[] = this.getCharactersWhoNeedToPayCostOfLiving().filter((c) => {
      const personalPile = getPersonalPile(c.id);
      const cost = getCostOfLivingForCharacter(c.id);

      return cost <= personalPile.money;
    });

    return characters;
  }

  private getCharactersWhoNeedToPayCostOfLivingButCantAffordIt(): CharacterData[] {
    const characters: CharacterData[] = this.getCharactersWhoNeedToPayCostOfLiving().filter((c) => {
      const personalPile = getPersonalPile(c.id);
      const cost = getCostOfLivingForCharacter(c.id);

      return cost > personalPile.money;
    });

    return characters;
  }

  private getCharactersWhoHavePaidCostOfLiving(): CharacterData[] {
    const thisMonth = getFirstOfThisMonthDateString();
    const characters: CharacterData[] = Object.values(this.props.allCharacters).filter((c) => {
      // Corpses don't pay maintenance.
      if (c.dead) return false;

      const isUnpaid = c.maintenance_date !== thisMonth;
      const isOwnedByUser = c.user_id === this.props.currentUserId;

      return !isUnpaid && isOwnedByUser;
    });

    return characters;
  }

  private async onPayClicked(storageId: number): Promise<void> {
    this.setState({ isSaving: true });
    const unpaidContracts = this.getUnpaidContractsForStorage(storageId);

    const res = await ServerAPI.exerciseContracts(
      unpaidContracts,
      unpaidContracts.map(this.getUnpaidAmountForContract.bind(this))
    );
    if ("error" in res || res.find((r) => "error" in r)) {
      // Error modal.
      this.props.dispatch?.(
        showModal({
          id: "ExerciseContractsError",
          content: { title: "Error", message: "An Error occurred while attempting to exercise the contracts." },
        })
      );
    } else {
      if (this.props.dispatch) {
        await refetchContracts(this.props.dispatch);
        await refetchCharacters(this.props.dispatch);
        await refetchArmies(this.props.dispatch);
        await refetchStructures(this.props.dispatch);
        await refetchStorages(this.props.dispatch);
      }
    }

    this.setState({ isSaving: false });
  }

  private getUnpaidContractsForStorage(storageId: number): ContractData[] {
    const unpaid: ContractData[] = [];

    const thisMonth = getFirstOfThisMonthDateString();

    // Army wages.
    const unpaidArmyWageContracts = this.props.contractsByDefByPartyAId[ContractId.ArmyWageContract]?.[
      this.props.dashboardCharacterId
    ]?.filter((awc) => awc.target_a_id === storageId && awc.exercise_date !== thisMonth);
    if (unpaidArmyWageContracts?.length > 0) {
      unpaid.push(...unpaidArmyWageContracts);
    }

    // Character wages.
    const unpaidCharacterWageContracts = this.props.contractsByDefByPartyAId[ContractId.CharacterWageContract]?.[
      this.props.dashboardCharacterId
    ]?.filter((cwc) => cwc.target_a_id === storageId && cwc.exercise_date !== thisMonth);
    if (unpaidCharacterWageContracts?.length > 0) {
      unpaid.push(...unpaidCharacterWageContracts);
    }

    // Structure maintenance.
    const unpaidStructureMaintenanceContracts = this.props.contractsByDefByPartyAId[
      ContractId.StructureMaintenanceContract
    ]?.[this.props.dashboardCharacterId]?.filter(
      (smc) => smc.target_a_id === storageId && smc.exercise_date !== thisMonth
    );
    if (unpaidStructureMaintenanceContracts) {
      unpaid.push(...unpaidStructureMaintenanceContracts);
    }

    return unpaid;
  }

  private getUnpaidAmountForContract(contract: ContractData): number {
    switch (contract.def_id) {
      case ContractId.ArmyWageContract: {
        return getArmyTotalWages(contract.party_b_id);
      }
      case ContractId.CharacterWageContract: {
        return getCostOfLivingForCharacter(contract.party_b_id);
      }
      case ContractId.StructureMaintenanceContract: {
        return getStructureMonthlyMaintenance(contract.party_b_id);
      }
    }
    return 0;
  }

  private getUnpaidAmountForContracts(contracts: ContractData[]): number {
    let total = 0;

    contracts.forEach((c) => {
      total += this.getUnpaidAmountForContract(c);
    });

    return total;
  }

  private getArmyWagesForStorage(storageId: number): number {
    let total: number = 0;

    this.props.contractsByDefByPartyAId[ContractId.ArmyWageContract]?.[this.props.dashboardCharacterId]?.forEach(
      (awc) => {
        if (awc.target_a_id === storageId) {
          total += getArmyTotalWages(awc.party_b_id);
        }
      }
    );

    return total;
  }

  private getCharacterWagesForStorage(storageId: number): number {
    let total: number = 0;

    this.props.contractsByDefByPartyAId[ContractId.CharacterWageContract]?.[this.props.dashboardCharacterId]?.forEach(
      (cwc) => {
        if (cwc.target_a_id === storageId) {
          total += getCostOfLivingForCharacter(cwc.party_b_id);
        }
      }
    );

    return total;
  }

  private getStructureMaintenanceForStorage(storageId: number): number {
    let total: number = 0;

    this.props.contractsByDefByPartyAId[ContractId.StructureMaintenanceContract]?.[
      this.props.dashboardCharacterId
    ]?.forEach((smc) => {
      if (smc.target_a_id === storageId) {
        total += getStructureMonthlyMaintenance(smc.party_b_id);
      }
    });

    return total;
  }

  private getExpensesForStorage(storageId: number): number {
    let total = 0;

    // Army wages.
    total += this.getArmyWagesForStorage(storageId);

    // Character wages.
    total += this.getCharacterWagesForStorage(storageId);

    // Structure maintenance.
    total += this.getStructureMaintenanceForStorage(storageId);

    return total;
  }

  private onSelectActiveCharacterClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "selectActiveCharacter",
        content: () => {
          return (
            <SelectAdventurerDialog
              preselectedAdventurerId={this.props.dashboardCharacterId}
              onSelectionConfirmed={async (characterId: number) => {
                dashboardLocalStore.setDashboardCharacterId(characterId);
                this.props.dispatch?.(setDashboardCharacterId(characterId));
                this.props.dispatch?.(setActiveCharacterId(characterId));
              }}
            />
          );
        },
        escapable: true,
        widthVmin: 45,
      })
    );
  }

  private getSortedStorages(): StorageData[] {
    if (!this.props.character) {
      return [];
    }

    const permittedStorages = Object.values(this.props.allStorages).filter((storage) => {
      return (
        this.props.activeRole !== "player" ||
        // Storages are owned by characters, not players, so we have to chain back through the owner to find the user.
        this.props.allCharacters[storage.owner_id].user_id === this.props.currentUserId
      );
    });

    const filteredStorages = permittedStorages.filter((s) => {
      return s.owner_id === this.props.dashboardCharacterId;
    });

    const personalPileId = getPersonalPile(this.props.dashboardCharacterId ?? 0)?.id ?? 0;
    filteredStorages.sort((storageA, storageB) => {
      // The focused character's Personal Pile is always first.
      if (storageA.id === personalPileId) {
        return -1;
      } else if (storageB.id === personalPileId) {
        return 1;
      }

      // And an alphy sort when the others don't apply.
      const nameA = getStorageDisplayName(storageA.id);
      const nameB = getStorageDisplayName(storageB.id);

      return nameA.localeCompare(nameB);
    });

    return filteredStorages;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.dashboardCharacterId];
  const { dashboardCharacterId, characters: allCharacters } = state.characters;
  const allStorages = state.storages.allStorages;
  const { activeRole } = state.hud;
  const currentUserId = state.user.currentUser.id;
  const { contractsByDefByPartyAId, contractsByDefByPartyBId } = state.contracts;
  const allItems = state.items.allItems;
  return {
    ...props,
    character,
    dashboardCharacterId,
    allStorages,
    allItems,
    allCharacters,
    contractsByDefByPartyAId,
    contractsByDefByPartyBId,
    activeRole,
    currentUserId,
  };
}

export const DashboardPanel = connect(mapStateToProps)(ADashboardPanel);
