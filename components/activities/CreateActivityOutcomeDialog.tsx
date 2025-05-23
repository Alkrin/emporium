import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./CreateActivityOutcomeDialog.module.scss";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { Dictionary } from "../../lib/dictionary";
import {
  ActivityAdventurerParticipant,
  ActivityArmyParticipant,
  ActivityData,
  ArmyData,
  CharacterData,
  ActivityOutcomeData,
  ActivityOutcomeData_ChangeLocation,
  ActivityOutcomeData_Description,
  ActivityOutcomeData_InjuriesAndDeaths,
  ActivityOutcomeData_LootAndXP,
  ActivityOutcomeType,
  LocationData,
  SortedActivityOutcomeTypes,
  TroopData,
  TroopDefData,
  ActivityOutcomeData_MergeArmies,
  ActivityOutcomeData_TransferEmporiumContracts,
  StorageData,
  ItemData,
  ActivityOutcomeData_GrantItems,
  ItemDefData,
  SpellDefData,
} from "../../serverAPI";
import { InputSingleNumberDialog } from "../dialogs/InputSingleNumberDialog";
import { getStatBonusForValue, getBonusString } from "../../lib/characterUtils";
import { SelectAdventurerInjuryDialog } from "../dialogs/SelectAdventurerInjuryDialog";
import { SelectArmyDialog } from "../dialogs/SelectArmyDialog";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { SelectStorageDialog } from "../dialogs/SelectStorageDialog";
import { CreateItemDialog } from "../characters/dialogs/CreateItemDialog";
import { ScrollArea } from "../ScrollArea";
import TooltipSource from "../TooltipSource";
import { ItemTooltip } from "../database/tooltips/ItemTooltip";
import { getItemNameText } from "../../lib/itemUtils";
import { SpellTooltip } from "../database/tooltips/SpellTooltip";
import { EditItemDialog } from "../characters/dialogs/EditItemDialog";
import { DeleteButton } from "../DeleteButton";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  type: ActivityOutcomeType;
  locationId: number; // For ChangeLocation.
  transferLocationId: number; // For TransferEmporiumContracts.
  // Character deaths and injures are inter-related.  Dead characters generally aren't ALSO injured.
  deadCharacterIds: number[];
  // Injuries state.  Key: characterId, value: injuryIds.
  characterInjuries: Dictionary<string[]>;
  // Pre-populates the resolution text field.
  description: string;
  // First key: armyId, second key: troopDefId, value: number of injuries.
  troopInjuriesByArmy: Dictionary<Dictionary<number>>;
  // First key: armyId, second key: troopDefId, value: number of deaths.
  troopDeathsByArmy: Dictionary<Dictionary<number>>;
  goldWithXPString: string;
  goldWithoutXPString: string;
  combatXPString: string;
  campaignXPString: string;
  primaryArmyId: number;
  subordinateArmyId: number;
  storageId: number;
  items: ItemData[];
}

interface ReactProps {
  activity: ActivityData;
  initialValues?: ActivityOutcomeData;
  allowedTypes?: ActivityOutcomeType[];
  disallowedTypes?: ActivityOutcomeType[];
  onValuesConfirmed: (values: ActivityOutcomeData) => Promise<void>;
}

interface InjectedProps {
  allArmies: Dictionary<ArmyData>;
  allCharacters: Dictionary<CharacterData>;
  allLocations: Dictionary<LocationData>;
  allStorages: Dictionary<StorageData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopDefs: Dictionary<TroopDefData>;
  itemDefs: Dictionary<ItemDefData>;
  spellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateActivityOutcomeDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const iv = props.initialValues;
    this.state = iv
      ? {
          type: iv.type,
          locationId: (iv as ActivityOutcomeData_ChangeLocation).locationId ?? 0,
          transferLocationId: (iv as ActivityOutcomeData_TransferEmporiumContracts).locationId ?? 0,
          deadCharacterIds: (iv as ActivityOutcomeData_InjuriesAndDeaths).deadCharacterIds ?? [],
          characterInjuries: (iv as ActivityOutcomeData_InjuriesAndDeaths).characterInjuries ?? {},
          description: (iv as ActivityOutcomeData_Description).description ?? "",
          troopInjuriesByArmy: (iv as ActivityOutcomeData_InjuriesAndDeaths).troopInjuriesByArmy ?? {},
          troopDeathsByArmy: (iv as ActivityOutcomeData_InjuriesAndDeaths).troopDeathsByArmy ?? {},
          goldWithXPString: `${(iv as ActivityOutcomeData_LootAndXP).goldWithXP ?? 0}`,
          goldWithoutXPString: `${(iv as ActivityOutcomeData_LootAndXP).goldWithoutXP ?? 0}`,
          combatXPString: `${(iv as ActivityOutcomeData_LootAndXP).combatXP ?? 0}`,
          campaignXPString: `${(iv as ActivityOutcomeData_LootAndXP).campaignXP ?? 0}`,
          primaryArmyId: (iv as ActivityOutcomeData_MergeArmies).primaryArmyId ?? 0,
          subordinateArmyId: (iv as ActivityOutcomeData_MergeArmies).subordinateArmyId ?? 0,
          storageId: (iv as ActivityOutcomeData_GrantItems).storageId ?? 0,
          items: (iv as ActivityOutcomeData_GrantItems).items ?? [],
        }
      : {
          type: ActivityOutcomeType.Invalid,
          locationId: 0,
          transferLocationId: 0,
          deadCharacterIds: [],
          characterInjuries: {},
          description: "",
          troopInjuriesByArmy: {},
          troopDeathsByArmy: {},
          goldWithXPString: "0",
          goldWithoutXPString: "0",
          combatXPString: "0",
          campaignXPString: "0",
          primaryArmyId: 0,
          subordinateArmyId: 0,
          storageId: 0,
          items: [],
        };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>
          {this.props.initialValues ? "Edit Activity Outcome" : "Create Activity Outcome"}
        </div>

        <div className={styles.contentRow}>
          <div className={styles.normalText}>{"Type"}</div>
          <select
            className={styles.typeSelector}
            value={this.state.type}
            onChange={(e) => {
              this.setState({ type: e.target.value as ActivityOutcomeType });
            }}
            disabled={!!this.props.initialValues}
          >
            {SortedActivityOutcomeTypes.filter((type) => {
              if (this.props.allowedTypes) {
                return this.props.allowedTypes.includes(type);
              } else if (this.props.disallowedTypes) {
                return !this.props.disallowedTypes.includes(type);
              } else {
                return true;
              }
            }).map((type: ActivityOutcomeType, index: number) => {
              return (
                <option value={type} key={index}>
                  {type}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.outcomePanel}>{this.renderOutcomeFields()}</div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Values"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Cancel"}
        </div>
      </div>
    );
  }

  private renderOutcomeFields(): React.ReactNode {
    switch (this.state.type) {
      case ActivityOutcomeType.Invalid: {
        return this.renderTypeFieldsInvalid();
      }
      case ActivityOutcomeType.ChangeLocation: {
        return this.renderTypeFieldsChangeLocation();
      }
      case ActivityOutcomeType.Description: {
        return this.renderTypeFieldsDescription();
      }
      case ActivityOutcomeType.GrantItems: {
        return this.renderTypeFieldsGrantItems();
      }
      case ActivityOutcomeType.InjuriesAndDeaths: {
        return this.renderTypeFieldsInjuriesAndDeaths();
      }
      case ActivityOutcomeType.LootAndXP: {
        return this.renderTypeFieldsLootAndXP();
      }
      case ActivityOutcomeType.MergeArmies: {
        return this.renderTypeFieldsMergeArmies();
      }
      case ActivityOutcomeType.TransferEmporiumContracts: {
        return this.renderTypeFieldsTransferEmporiumContracts();
      }
    }
  }

  private renderTypeFieldsInvalid(): React.ReactNode {
    return (
      <div className={styles.invalidDescription}>
        {"Select an Outcome type to begin.  Multiple outcomes of the same type are permitted."}
      </div>
    );
  }

  private renderTypeFieldsChangeLocation(): React.ReactNode {
    return (
      <>
        <div className={styles.outcomeFieldHeader}>
          {"What is the new location for the participants at the end of this activity?"}
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldValue}>
            {this.props.allLocations[this.state.locationId]?.name ?? "---"}
          </div>
          <EditButton className={styles.editButton} onClick={this.onSelectLocationClicked.bind(this)} />
        </div>
      </>
    );
  }

  private renderTypeFieldsDescription(): React.ReactNode {
    return (
      <>
        <div className={styles.outcomeFieldHeader}>
          {"Write a long form description of the outcomes of this activity."}
        </div>
        <textarea
          className={styles.descriptionTextField}
          value={this.state.description}
          onChange={(e) => {
            this.setState({ description: e.target.value });
          }}
          spellCheck={false}
        />
      </>
    );
  }

  private renderTypeFieldsGrantItems(): React.ReactNode {
    return (
      <>
        <div className={styles.outcomeFieldHeader}>
          {
            "Items will be created and added to the specified Storage.  Where possible, they will be merged into existing item stacks."
          }
        </div>
        <div className={styles.rowWithSpacer}>
          <div className={styles.outcomeFieldValue}>{`Storage: ${getStorageDisplayName(this.state.storageId)}`}</div>
          <EditButton className={styles.editButton} onClick={this.onSelectStorageClicked.bind(this)} />
        </div>
        <div className={styles.rowWithSpacer}>
          <div className={styles.outcomeFieldHeader}>{"Items"}</div>
          <EditButton className={styles.editButton} onClick={this.onCreateItemClicked.bind(this)} />
        </div>
        <ScrollArea className={styles.itemList}>{this.state.items.map(this.renderItemRow.bind(this))}</ScrollArea>
      </>
    );
  }

  private renderItemRow(item: ItemData, index: number): React.ReactNode {
    const def = this.props.itemDefs[item.def_id];
    return (
      <div className={styles.itemContentWrapper} key={`ItemRow${index}`}>
        <TooltipSource
          className={styles.row}
          tooltipParams={{
            id: `Item${index}`,
            content: () => {
              return <ItemTooltip itemData={item} />;
            },
          }}
        >
          <div className={styles.itemName}>{getItemNameText(item, def)}</div>
          <EditButton className={styles.itemActionButton} onClick={this.onEditItemClicked.bind(this, item, index)} />
          <DeleteButton className={styles.itemActionButton} onClick={this.onDeleteItemClicked.bind(this, index)} />
        </TooltipSource>
        {[...def.spell_ids, ...item.spell_ids].map((sid, spellIndex) => {
          const spellDef = this.props.spellDefs[sid];
          if (spellDef) {
            return (
              <TooltipSource
                key={`spell${spellIndex}`}
                className={styles.associatedSpellRow}
                tooltipParams={{
                  id: `${spellDef.id} ${spellIndex}`,
                  content: () => {
                    return <SpellTooltip spellId={sid} />;
                  },
                }}
              >
                {spellDef.name}
              </TooltipSource>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  }

  private onDeleteItemClicked(index: number): void {
    this.setState({ items: this.state.items.filter((_, index2) => index !== index2) });
  }

  private onEditItemClicked(item: ItemData, index: number): void {
    this.props.dispatch?.(
      showModal({
        id: "CreateItem",
        content: () => {
          // Setting 'onValuesConfirmed' overrides the default behavior of editing server data immediately.
          return (
            <EditItemDialog
              item={item}
              def={this.props.itemDefs[item.def_id]}
              onValuesConfirmed={async (newItem: ItemData) => {
                // Add the generated item data to the item list.
                const items: ItemData[] = [...this.state.items];
                items[index] = newItem;
                this.setState({ items });
              }}
            />
          );
        },
      })
    );
  }

  private renderTypeFieldsInjuriesAndDeaths(): React.ReactNode {
    return (
      <div className={styles.participantListContainer}>
        {this.props.activity.participants.length > 0 && (
          <div className={styles.participantHeader}>
            {"Adventurers"}
            <div className={styles.conHeader}>{"CON"}</div>
          </div>
        )}
        {this.props.activity.participants.map(this.renderAdventurerParticipantRow.bind(this))}
        {this.props.activity.army_participants.map(this.renderArmyParticipantRows.bind(this))}
      </div>
    );
  }

  private renderTypeFieldsLootAndXP(): React.ReactNode {
    return (
      <>
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Gold with XP"}</div>
          <input
            type={"text"}
            className={styles.outcomeFieldInput}
            value={this.state.goldWithXPString}
            onChange={(e) => {
              this.setState({ goldWithXPString: e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Gold w/o XP"}</div>
          <input
            type={"text"}
            className={styles.outcomeFieldInput}
            value={this.state.goldWithoutXPString}
            onChange={(e) => {
              this.setState({ goldWithoutXPString: e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Combat XP"}</div>
          <input
            type={"text"}
            className={styles.outcomeFieldInput}
            value={this.state.combatXPString}
            onChange={(e) => {
              this.setState({ combatXPString: e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Campaign XP"}</div>
          <input
            type={"text"}
            className={styles.outcomeFieldInput}
            value={this.state.campaignXPString}
            onChange={(e) => {
              this.setState({ campaignXPString: e.target.value });
            }}
          />
        </div>
      </>
    );
  }

  private renderTypeFieldsMergeArmies(): React.ReactNode {
    return (
      <>
        <div className={styles.outcomeFieldHeader}>
          {"This will merge the subordinate army into the primary army.  The subordinate army will be destroyed."}
        </div>
        <div style={{ height: "1vmin" }} />
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Primary:\xa0"}</div>
          <div className={styles.outcomeFieldValue}>
            {this.props.allArmies[this.state.primaryArmyId]?.name ?? "---"}
          </div>
          <EditButton className={styles.editButton} onClick={this.onSelectPrimaryArmyClicked.bind(this)} />
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldLabel}>{"Subordinate:\xa0"}</div>
          <div className={styles.outcomeFieldValue}>
            {this.props.allArmies[this.state.subordinateArmyId]?.name ?? "---"}
          </div>
          <EditButton className={styles.editButton} onClick={this.onSelectSubordinateArmyClicked.bind(this)} />
        </div>
      </>
    );
  }

  private renderTypeFieldsTransferEmporiumContracts(): React.ReactNode {
    return (
      <>
        <div className={styles.outcomeFieldHeader}>
          {"Which base will participating Emporium Employees transfer their contracts to?"}
        </div>
        <div className={styles.row}>
          <div className={styles.outcomeFieldValue}>
            {this.props.allLocations[this.state.transferLocationId]?.name ?? "---"}
          </div>
          <EditButton className={styles.editButton} onClick={this.onSelectEmporiumBaseClicked.bind(this)} />
        </div>
      </>
    );
  }

  private renderArmyParticipantRows(p: ActivityArmyParticipant, index: number): React.ReactNode {
    const army = this.props.allArmies[p.armyId];
    const sortedTroops = Object.entries(p.troopCounts).sort((a, b) => {
      const defA = this.props.troopDefs[+a[0]];
      const defB = this.props.troopDefs[+b[0]];
      return defA.name.localeCompare(defB.name);
    });

    return (
      <React.Fragment key={`Army${index}`}>
        <div className={styles.participantHeader}>{army.name}</div>
        {sortedTroops.map(this.renderTroopRow.bind(this, army, index))}
      </React.Fragment>
    );
  }

  private onSelectPrimaryArmyClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "selectPrimaryArmy",
        content: () => {
          return (
            <SelectArmyDialog
              preselectedArmyId={this.state.primaryArmyId}
              onSelectionConfirmed={async (armyId: number) => {
                this.setState({ primaryArmyId: armyId });
              }}
            />
          );
        },
      })
    );
  }

  private onSelectSubordinateArmyClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "selectSubordinateArmy",
        content: () => {
          return (
            <SelectArmyDialog
              preselectedArmyId={this.state.subordinateArmyId}
              onSelectionConfirmed={async (armyId: number) => {
                this.setState({ subordinateArmyId: armyId });
              }}
            />
          );
        },
      })
    );
  }

  private getTroopStartPosition(armyIndex: number, troopIndex: number, troopCounts: [string, number][]): number {
    // We presume to start armies/troops one slot past the adventurers.
    let startPosition = this.props.activity.participants.length + 1;

    // Iterate through each army and troop type and increment per full or partial platoon.
    for (let ai = 0; ai <= armyIndex; ++ai) {
      if (ai === armyIndex) {
        // For the specific army and troop, use the sorted troop counts passed in.
        for (let ti = 0; ti < troopIndex; ++ti) {
          const [troopDefId, troopCount] = troopCounts[ti];
          const def = this.props.troopDefs[+troopDefId];
          const numPlatoons = Math.ceil(troopCount / def.platoon_size);
          startPosition += numPlatoons;
        }
      } else {
        // For any previous armies, we don't care what their order was, just their platoon counts.
        const armyParticipant = this.props.activity.army_participants[ai];
        const troopCounts = Object.entries(armyParticipant.troopCounts);
        for (let ti = 0; ti < troopCounts.length; ++ti) {
          const [troopDefId, troopCount] = troopCounts[ti];
          const def = this.props.troopDefs[+troopDefId];
          const numPlatoons = Math.ceil(troopCount / def.platoon_size);
          startPosition += numPlatoons;
        }
      }
    }
    return startPosition;
  }

  private renderTroopRow(
    army: ArmyData,
    armyIndex: number,
    entry: [string, number],
    index: number,
    troopCounts: [string, number][]
  ): React.ReactNode {
    const troopDefId = +entry[0];
    const count = entry[1];
    const def = this.props.troopDefs[troopDefId];
    const startPosition = this.getTroopStartPosition(armyIndex, index, troopCounts);
    const endPosition = Math.max(startPosition, startPosition + Math.ceil(count / def.platoon_size) - 1);

    const injuryCount = this.state.troopInjuriesByArmy[army.id]?.[troopDefId] ?? 0;
    const deathCount = this.state.troopDeathsByArmy[army.id]?.[troopDefId] ?? 0;

    return (
      <div className={styles.listRow} key={`Troop${index}`}>
        <div className={styles.listIndex}>
          {startPosition === endPosition ? startPosition : `${startPosition}-${endPosition}`}
        </div>
        <div className={styles.listCount}>{`${count}×\xa0`}</div>
        <div className={styles.listName}>{def.name}</div>
        <div
          className={`${styles.injuryButton} ${injuryCount > 0 ? styles.injured : ""}`}
          onClick={this.onArmyInjuryClicked.bind(this, army.id, troopDefId, count)}
        />
        <div
          className={`${styles.deathButton} ${deathCount > 0 ? styles.dead : ""}`}
          onClick={this.onArmyDeathClicked.bind(this, army.id, troopDefId, count)}
        />
      </div>
    );
  }

  private renderAdventurerParticipantRow(p: ActivityAdventurerParticipant, index: number): React.ReactNode {
    const adventurer = this.props.allCharacters[p.characterId];
    const isInjured = (this.state.characterInjuries[p.characterId]?.length ?? 0) > 0;
    const isDead = this.state.deadCharacterIds.includes(p.characterId);
    const conBonus = getStatBonusForValue(adventurer.constitution);
    return (
      <div className={styles.listRow} key={`adventurer${index}`}>
        <div className={styles.listIndex}>{index + 1}</div>
        <div className={styles.listName}>{adventurer.name}</div>
        <div className={`${styles.listConBonus} ${conBonus < 0 ? styles.negative : ""}`}>
          {getBonusString(conBonus)}
        </div>
        <div
          className={`${styles.injuryButton} ${isInjured ? styles.injured : ""}`}
          onClick={this.onAdventurerInjuryClicked.bind(this, p)}
        />
        <div
          className={`${styles.deathButton} ${isDead ? styles.dead : ""}`}
          onClick={this.onAdventurerDeathClicked.bind(this, p)}
        />
      </div>
    );
  }

  private onAdventurerInjuryClicked(p: ActivityAdventurerParticipant): void {
    this.props.dispatch?.(
      showModal({
        id: "AdventurerInjury",
        content: () => {
          return (
            <SelectAdventurerInjuryDialog
              preselectedInjuryIds={this.state.characterInjuries[p.characterId] ?? []}
              onSelectionConfirmed={async (injuryIds: string[]) => {
                this.setState({
                  characterInjuries: {
                    ...this.state.characterInjuries,
                    [p.characterId]: injuryIds,
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private onAdventurerDeathClicked(p: ActivityAdventurerParticipant): void {
    this.props.dispatch?.(
      showModal({
        id: "AdventurerDeath",
        content: () => {
          return (
            <BasicDialog
              title={"Death"}
              prompt={`Was ${this.props.allCharacters[p.characterId].name} slain?`}
              buttons={[
                {
                  text: "Yes",
                  onClick: async () => {
                    if (!this.state.deadCharacterIds.includes(p.characterId)) {
                      this.setState({ deadCharacterIds: [...this.state.deadCharacterIds, p.characterId] });
                    }
                    this.props.dispatch?.(hideModal());
                  },
                },
                {
                  text: "No",
                  onClick: async () => {
                    this.setState({
                      deadCharacterIds: this.state.deadCharacterIds.filter((dcid) => dcid !== p.characterId),
                    });
                    this.props.dispatch?.(hideModal());
                  },
                },
              ]}
            />
          );
        },
      })
    );
  }

  private onArmyInjuryClicked(armyId: number, troopDefId: number, troopCount: number): void {
    const def = this.props.troopDefs[troopDefId];
    const numInjuries = this.state.troopInjuriesByArmy[armyId]?.[troopDefId] ?? 0;

    this.props.dispatch?.(
      showModal({
        id: "ArmyInjury",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${troopCount}× ${def.name}`}
              prompt={`Platoon size: ${def.platoon_size}\n\nHow many injured individuals of this troop type?`}
              initialValue={numInjuries}
              onValueConfirmed={async (count: number) => {
                this.setState({
                  troopInjuriesByArmy: {
                    ...this.state.troopInjuriesByArmy,
                    [armyId]: {
                      ...(this.state.troopInjuriesByArmy[armyId] ?? {}),
                      [troopDefId]: Math.max(0, Math.min(troopCount, count)),
                    },
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private onArmyDeathClicked(armyId: number, troopDefId: number, troopCount: number): void {
    const def = this.props.troopDefs[troopDefId];
    const numDeaths = this.state.troopDeathsByArmy[armyId]?.[troopDefId] ?? 0;

    this.props.dispatch?.(
      showModal({
        id: "ArmyDeath",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${troopCount}× ${def.name}`}
              prompt={"How many individuals of this troop type were killed?"}
              initialValue={numDeaths}
              onValueConfirmed={async (count: number) => {
                this.setState({
                  troopDeathsByArmy: {
                    ...this.state.troopDeathsByArmy,
                    [armyId]: {
                      ...(this.state.troopDeathsByArmy[armyId] ?? {}),
                      [troopDefId]: Math.max(0, Math.min(troopCount, count)),
                    },
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onSelectLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.state.locationId}
              onSelectionConfirmed={this.onLocationSelected.bind(this)}
            />
          );
        },
      })
    );
  }

  private onSelectEmporiumBaseClicked(): void {
    // A location only has an Emporium base if there is a Storage with the "Emporium" prefix at that location.
    const bases = Object.values(this.props.allStorages)
      .filter((storage) => storage.name.startsWith("Emporium"))
      .map((s) => s.location_id);

    this.props.dispatch?.(
      showModal({
        id: "SelectEmporiumBase",
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.state.locationId}
              onSelectionConfirmed={this.onEmporiumBaseSelected.bind(this)}
              locationIdWhitelist={bases}
            />
          );
        },
      })
    );
  }

  private async onLocationSelected(locationId: number): Promise<void> {
    this.setState({ locationId });
  }

  private async onEmporiumBaseSelected(transferLocationId: number): Promise<void> {
    this.setState({ transferLocationId });
  }

  private onCreateItemClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "CreateItem",
        content: () => {
          // A zero storageId means the items won't be added to the database right now.
          return (
            <CreateItemDialog
              storageId={0}
              preselectedOwnerIds={this.props.activity.participants.map((p) => p.characterId)}
              onValuesConfirmed={async (item: ItemData) => {
                // Add the generated item data to the item list.
                this.setState({ items: [...this.state.items, item] });
              }}
            />
          );
        },
      })
    );
  }

  private onSelectStorageClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "selectStorage",
        content: () => {
          return (
            <SelectStorageDialog
              preselectedStorageId={this.state.storageId}
              onSelectionConfirmed={async (storageId: number) => {
                this.setState({ storageId });
              }}
            />
          );
        },
      })
    );
  }

  private onConfirmClicked(): void {
    switch (this.state.type) {
      case ActivityOutcomeType.ChangeLocation: {
        const dcl: ActivityOutcomeData_ChangeLocation = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          locationId: this.state.locationId,
        };
        this.props.onValuesConfirmed(dcl);
        break;
      }
      case ActivityOutcomeType.Description: {
        const dd: ActivityOutcomeData_Description = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          description: this.state.description,
        };
        this.props.onValuesConfirmed(dd);
        break;
      }
      case ActivityOutcomeType.GrantItems: {
        const dgi: ActivityOutcomeData_GrantItems = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          storageId: this.state.storageId,
          items: this.state.items,
        };
        this.props.onValuesConfirmed(dgi);
        break;
      }
      case ActivityOutcomeType.InjuriesAndDeaths: {
        const diad: ActivityOutcomeData_InjuriesAndDeaths = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          characterInjuries: this.state.characterInjuries,
          deadCharacterIds: this.state.deadCharacterIds,
          troopInjuriesByArmy: this.state.troopInjuriesByArmy,
          troopDeathsByArmy: this.state.troopDeathsByArmy,
        };
        this.props.onValuesConfirmed(diad);
        break;
      }
      case ActivityOutcomeType.LootAndXP: {
        const dlax: ActivityOutcomeData_LootAndXP = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          goldWithXP: +this.state.goldWithXPString,
          goldWithoutXP: +this.state.goldWithoutXPString,
          combatXP: +this.state.combatXPString,
          campaignXP: +this.state.campaignXPString,
        };
        this.props.onValuesConfirmed(dlax);
        break;
      }
      case ActivityOutcomeType.MergeArmies: {
        const dma: ActivityOutcomeData_MergeArmies = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          primaryArmyId: this.state.primaryArmyId,
          primaryArmyName: this.props.allArmies[this.state.primaryArmyId].name,
          subordinateArmyId: this.state.subordinateArmyId,
          subordinateArmyName: this.props.allArmies[this.state.subordinateArmyId].name,
        };
        this.props.onValuesConfirmed(dma);
        break;
      }
      case ActivityOutcomeType.TransferEmporiumContracts: {
        const dtec: ActivityOutcomeData_TransferEmporiumContracts = {
          id: this.props.initialValues?.id ?? 0,
          activity_id: this.props.activity.id,
          type: this.state.type,
          locationId: this.state.transferLocationId,
        };
        this.props.onValuesConfirmed(dtec);
        break;
      }
      default: {
        return;
      }
    }

    this.onCloseClicked();
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allArmies = state.armies.armies;
  const allLocations = state.locations.locations;
  const allCharacters = state.characters.characters;
  const allStorages = state.storages.allStorages;
  const troopsByArmy = state.armies.troopsByArmy;
  const troopDefs = state.gameDefs.troops;
  const itemDefs = state.gameDefs.items;
  const spellDefs = state.gameDefs.spells;
  return {
    ...props,
    allArmies,
    allCharacters,
    allLocations,
    allStorages,
    troopsByArmy,
    troopDefs,
    itemDefs,
    spellDefs,
  };
}

export const CreateActivityOutcomeDialog = connect(mapStateToProps)(ACreateActivityOutcomeDialog);
