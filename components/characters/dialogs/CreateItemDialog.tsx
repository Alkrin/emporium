import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchItems } from "../../../dataSources/ItemsDataSource";
import { Dictionary } from "../../../lib/dictionary";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { RootState } from "../../../redux/store";
import { showToaster } from "../../../redux/toastersSlice";
import ServerAPI, { CharacterData, ItemData, ItemDefData, SpellDefData, StorageData } from "../../../serverAPI";
import { ItemTooltip } from "../../database/tooltips/ItemTooltip";
import { SearchableDefList } from "../../database/SearchableDefList";
import styles from "./CreateItemDialog.module.scss";
import { getStorageDisplayName } from "../../../lib/storageUtils";
import { EditButton } from "../../EditButton";
import { SavingVeil } from "../../SavingVeil";
import { SelectAdventurersDialog } from "../../dialogs/SelectAdventurersDialog";
import { SelectSpellsDialog } from "../../dialogs/SelectSpellsDialog";
import { ResizeDetector } from "../../ResizeDetector";
import { getItemNameText } from "../../../lib/itemUtils";
import { DBButton } from "../../DBButton";
import { DatabaseItemsDialog } from "../../database/DatabaseItemsDialog";

interface State {
  isSaving: boolean;
  selectedItemId: number;
  numToCreate: number;
  notes: string;
  isForSale: boolean;
  ownerIds: number[];
  isUnused: boolean;
  spellIds: number[];
  columnHeight: number;
}

interface ReactProps {
  storageId: number;
  preselectedOwnerIds?: number[];
  onValuesConfirmed?: (item: ItemData) => Promise<void>;
}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  allCharacters: Dictionary<CharacterData>;
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateItemDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      selectedItemId: 0,
      numToCreate: 1,
      notes: "",
      isForSale: false,
      ownerIds: props.preselectedOwnerIds ?? [],
      isUnused: true,
      spellIds: [],
      columnHeight: 0,
    };
  }

  render(): React.ReactNode {
    const canCreateClass = this.state.selectedItemId > 0 && !this.state.isSaving ? "" : styles.disabled;
    const itemDef = this.props.allItemDefs[this.state.selectedItemId];
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <SearchableDefList
              className={styles.itemListRoot}
              style={{ height: `${this.state.columnHeight}px` }}
              allDefs={this.props.allItemDefs}
              selectedDefId={this.state.selectedItemId}
              onDefSelected={(selectedItemId) => {
                this.setState({ selectedItemId, numToCreate: 1, notes: "" });
              }}
              renderTooltip={(def) => {
                return <ItemTooltip itemDefId={def.id} />;
              }}
            />
            <DBButton className={styles.dbButton} onClick={this.onCreateItemDefClicked.bind(this)} />
          </div>
          <div className={styles.instancePanel}>
            <ResizeDetector
              onResize={(_, columnHeight) => {
                this.setState({ columnHeight });
              }}
            />
            <div className={styles.notesLabel}>{"Notes"}</div>
            <textarea
              className={styles.notesField}
              value={this.state.notes}
              onChange={(e) => {
                this.setState({ notes: e.target.value });
              }}
            />
            <div className={styles.row}>
              <div className={styles.ownersLabel}>{"Associated Spells"}</div>
              <EditButton className={styles.inlineEditButton} onClick={this.onEditAssociatedSpellsClicked.bind(this)} />
            </div>
            {this.state.spellIds.length > 0 && (
              <div className={styles.associatedSpells}>
                {this.state.spellIds
                  .map((sid) => {
                    const def = this.props.allSpellDefs[sid];
                    const level = Object.values(def.type_levels).reduce<number>(
                      (lowestLevel: number, currLevel: number) => Math.min(lowestLevel, currLevel),
                      Number.MAX_SAFE_INTEGER
                    );
                    return `L${level} ${def.name}`;
                  })
                  .join(", ")}
              </div>
            )}
            <div className={styles.flagRow}>
              <div className={styles.normalText}>{"Is For Sale?"}</div>
              <input
                className={styles.trailingCheckbox}
                type={"checkbox"}
                checked={this.state.isForSale}
                onChange={(e) => {
                  this.setState({ isForSale: e.target.checked });
                }}
              />
            </div>
            <div className={styles.flagRow}>
              <div className={styles.normalText}>{"Is Unused (grants XP when sold)?"}</div>
              <input
                className={styles.trailingCheckbox}
                type={"checkbox"}
                checked={this.state.isUnused}
                onChange={(e) => {
                  this.setState({ isUnused: e.target.checked });
                }}
              />
            </div>
            <div className={styles.row}>
              <div className={styles.ownersLabel}>{"Owners"}</div>
              <EditButton className={styles.inlineEditButton} onClick={this.onEditOwnersClicked.bind(this)} />
            </div>
            <div className={styles.listContainer}>{this.getSortedOwners().map(this.renderOwnerRow.bind(this))}</div>
          </div>
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>{itemDef?.has_charges ? "Num Charges" : "Item Count"}</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.numToCreate}
            min={0}
            onChange={(e) => {
              this.setState({ numToCreate: +e.target.value });
            }}
          />
        </div>
        {this.props.storageId !== 0 ? (
          <div className={styles.asteriskRow}>
            {`Created Items will be added to\n` + `${getStorageDisplayName(this.props.storageId)}`}
          </div>
        ) : null}
        <div className={`${styles.createButton} ${canCreateClass}`} onClick={this.onCreateClicked.bind(this)}>
          {"Create"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Close"}
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private renderOwnerRow(owner: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`ownerRow${index}`}>
        <div className={styles.listLevel}>{`L${owner.level}`}</div>
        <div className={styles.listClass}>{owner.class_name}</div>
        <div className={styles.listName}>{owner.name}</div>
      </div>
    );
  }

  private getSortedOwners(): CharacterData[] {
    const sorted = [...this.state.ownerIds].sort((a, b) => {
      const characterA = this.props.allCharacters[a];
      const characterB = this.props.allCharacters[b];

      // Sort by level first.  Highest levels at the top.
      if (characterA.level !== characterB.level) {
        return characterB.level - characterA.level;
      }
      return characterA.name.localeCompare(characterB.name);
    });

    return sorted.map((characterID) => this.props.allCharacters[characterID]);
  }

  private onCreateItemDefClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "ItemDefs",
        content: () => {
          return <DatabaseItemsDialog />;
        },
      })
    );
  }

  private onEditOwnersClicked(): void {
    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "Adventurers",
        content: () => {
          return (
            <SelectAdventurersDialog
              preselectedAdventurerIDs={this.state.ownerIds}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                this.setState({ ownerIds: adventurerIDs });
              }}
            />
          );
        },
      })
    );
  }

  private onEditAssociatedSpellsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditAssociatedSpells",
        content: () => {
          return (
            <SelectSpellsDialog
              preselectedSpellIds={this.state.spellIds}
              onSelectionConfirmed={(spellIds) => {
                this.setState({ spellIds });
              }}
            />
          );
        },
      })
    );
  }

  private async onCreateClicked(): Promise<void> {
    this.setState({ isSaving: true });

    // Create the item.  Add it to the personal pile.  Show a toaster.
    const newItem: ItemData = {
      id: 0,
      def_id: this.state.selectedItemId,
      count: this.state.numToCreate,
      container_id: 0,
      storage_id: this.props.storageId,
      notes: this.state.notes,
      is_for_sale: this.state.isForSale,
      owner_ids: this.state.ownerIds,
      is_unused: this.state.isUnused,
      spell_ids: this.state.spellIds,
    };

    let toasterTitle: string = "";
    let toasterMessage: string = `${getItemNameText(
      newItem,
      this.props.allItemDefs[this.state.selectedItemId]
    )} created!`;

    // Only actually create the item if it is being assigned to a Storage.
    if (this.props.storageId !== 0) {
      const result = await ServerAPI.createItem(newItem);
      if ("error" in result) {
        toasterTitle = "ERROR!";
        toasterMessage = "Item creation failed!";
      } else {
        // Item was successfully created, so refetch!
        if (this.props.dispatch) {
          await refetchItems(this.props.dispatch);
        }
      }
    }

    this.props.dispatch?.(showToaster({ content: { title: toasterTitle, message: toasterMessage } }));

    await this.props.onValuesConfirmed?.(newItem);

    this.setState({ isSaving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  const allItemDefs = state.gameDefs.items;
  const allCharacters = state.characters.characters;
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
    allCharacters,
    allSpellDefs,
  };
}

export const CreateItemDialog = connect(mapStateToProps)(ACreateItemDialog);
