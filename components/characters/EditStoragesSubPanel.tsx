import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, {
  CharacterData,
  CharacterEquipmentSlots,
  ItemData,
  ItemDefData,
  SpellDefData,
  StorageData,
} from "../../serverAPI";
import { ItemTooltip } from "../database/ItemTooltip";
import Draggable from "../Draggable";
import { DraggableHandle } from "../DraggableHandle";
import TooltipSource from "../TooltipSource";
import { CreateItemDialog } from "./CreateItemDialog";
import styles from "./EditStoragesSubPanel.module.scss";
import DropTarget from "../DropTarget";
import { showToaster } from "../../redux/toastersSlice";
import { ItemMoveParams } from "../../serverRequestTypes";
import { deleteItem, updateItem } from "../../redux/itemsSlice";
import { InventoriesList } from "./InventoriesList";
import {
  StonesToSixths,
  canItemsBeStacked,
  getAvailableRoomForContainer,
  getItemNameText,
  getItemTotalWeight,
  getMaxBundleItemsForRoom,
  getRootItemsInStorage,
  isContainerAInContainerB,
} from "../../lib/itemUtils";
import { setEquipment } from "../../redux/charactersSlice";
import { SplitBundleDialog } from "./SplitBundleDialog";
import { Tag } from "../../lib/tags";
import { SpellbookDialog } from "./SpellbookDialog";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { EditButton } from "../EditButton";
import { getAllItemAssociatedItemIds } from "../../lib/itemUtils";
import { StoragesList } from "./StoragesList";
import { EditMoneyDialog } from "./EditMoneyDialog";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { SplitButton } from "../SplitButton";
import { SpellbookButton } from "../SpellbookButton";
import { EditItemDialog } from "./EditItemDialog";
import { SellButton } from "../SellButton";
import { SellItemDialog } from "./SellItemDialog";
import { SpellTooltip } from "../database/SpellTooltip";

export const DropTypeItem = "DropTypeItem";

const DropTargetSelectedStorage = "SelectedStorage";
const DropTargetTrashCan = "TrashCan";

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  allSpellDefs: Dictionary<SpellDefData>;
  allItems: Dictionary<ItemData>;
  currentDraggableId: string;
  activeStorageId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditStoragesSubPanel extends React.Component<Props> {
  render(): React.ReactNode {
    if (this.props.activeStorageId === -1) {
      return null;
    }

    const selectedStorage = this.props.allStorages[this.props.activeStorageId];
    const storageName = getStorageDisplayName(this.props.activeStorageId);

    return (
      <div className={styles.root}>
        <StoragesList handleItemDropped={this.handleItemDropped.bind(this)} />
        <div className={styles.horizontalSpacer} />
        <div className={styles.column}>
          <div className={styles.createItemsButton} onClick={this.onCreateItemsClicked.bind(this)}>
            {"Create Items"}
          </div>
          <div className={styles.selectedStorageTitle}>{storageName}</div>
          <div className={styles.moneyRow}>
            <div className={styles.moneyLabel}>{"Money"}</div>
            <input
              className={styles.moneyField}
              type={"number"}
              value={selectedStorage.money.toFixed(2)}
              disabled={true}
            />
            <div className={styles.moneySuffix}>{"\xa0GP"}</div>
            <EditButton className={styles.moneyEditButton} onClick={this.onEditMoneyClicked.bind(this)} />
          </div>
          <DropTarget
            dropId={DropTargetSelectedStorage}
            dropTypes={[DropTypeItem]}
            className={styles.selectedStorageRoot}
          >
            {getRootItemsInStorage(this.props.activeStorageId).map((item) => {
              return this.renderSelectedStorageItemRow(item);
            })}
          </DropTarget>
          <div className={styles.trashCanTitle}>{"Trash Can"}</div>
          <DropTarget dropId={DropTargetTrashCan} dropTypes={[DropTypeItem]} className={styles.trashCanRoot} />
          <div className={styles.trashCanWarning}>{"Items placed in the Trash Can will be destroyed."}</div>
        </div>
        <div className={styles.horizontalSpacer} />
        <div className={styles.column}>
          <div className={styles.inventoriesTitle}>{"Inventories"}</div>
          <InventoriesList
            className={styles.inventoriesListRoot}
            containerIds={this.getContainerIds()}
            handleItemDropped={this.handleItemDropped.bind(this)}
          />
        </div>
        <SubPanelCloseButton />
      </div>
    );
  }

  private onEditMoneyClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "moneyEdit",
        content: () => {
          return <EditMoneyDialog storageId={this.props.activeStorageId} />;
        },
        escapable: true,
      })
    );
  }

  private getContainerIds(): number[] {
    // All selected storage containers.
    const containerIds: number[] = getRootItemsInStorage(this.props.activeStorageId)
      .filter((item) => {
        const def = this.props.allItemDefs[item.def_id];
        return def.storage_stones > 0 || def.storage_sixth_stones > 0;
      })
      .map((item) => {
        return item.id;
      });

    return containerIds;
  }

  private renderSelectedStorageItemRow(item: ItemData): React.ReactNode {
    const def = this.props.allItemDefs[item.def_id];
    if (!def) {
      return null;
    } else {
      const draggableId = `selectedStorage${item.id}`;
      return (
        <Draggable className={styles.selectedStorageRowDraggable} draggableId={draggableId} key={draggableId}>
          {
            // Charged items cannot be stacked because each needs to track its charges separately.
            !def.has_charges && (
              <DropTarget dropId={`Bundle${item.id}`} dropTypes={[DropTypeItem]} className={styles.fullDropTarget} />
            )
          }
          <DraggableHandle
            className={styles.draggableHandle}
            draggableId={draggableId}
            dropTypes={[DropTypeItem]}
            draggingRender={() => {
              return this.renderSelectedStorageRowContents(item, def);
            }}
            dropHandler={(dropTargetIds) => {
              this.handleItemDropped(dropTargetIds, item, def);
            }}
          >
            {this.renderSelectedStorageRowContents(item, def)}
          </DraggableHandle>
        </Draggable>
      );
    }
  }

  private renderSelectedStorageRowContents(item: ItemData, def: ItemDefData): React.ReactNode {
    const isSpellbook = def.tags.includes(Tag.Spellbook);
    return (
      <>
        <TooltipSource
          tooltipParams={{
            id: `item${item.id}`,
            content: () => {
              return <ItemTooltip itemId={item.id} />;
            },
          }}
          className={`${styles.selectedStorageRowContentWrapper} ${item.is_for_sale ? styles.forSale : ""}`}
        >
          <div className={styles.selectedStorageItemName}>{getItemNameText(item, def)}</div>
          {
            // A charged item cannot be stacked or split, only spent.
            !def.has_charges && item.count > 1 && (
              <SplitButton
                className={styles.selectedStorageActionButton}
                onMouseDown={this.onBundleButtonClick.bind(this, item, def)}
              />
            )
          }
          {isSpellbook && (
            <SpellbookButton
              className={styles.selectedStorageActionButton}
              onMouseDown={this.onSpellbookButtonClick.bind(this, item, def)}
            />
          )}
          <EditButton
            className={styles.selectedStorageActionButton}
            onMouseDown={this.onItemEditButtonClick.bind(this, item, def)}
          />
          <SellButton
            className={styles.selectedStorageActionButton}
            onMouseDown={this.onSellItemButtonClick.bind(this, item, def)}
          />
        </TooltipSource>
        {[...def.spell_ids, ...item.spell_ids].map((sid, spellIndex) => {
          const spellDef = this.props.allSpellDefs[sid];
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
      </>
    );
  }

  private onSellItemButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    const itemIds = getAllItemAssociatedItemIds(item.id);
    if (itemIds.length > 1) {
      this.props.dispatch?.(
        showToaster({
          id: "ContainerFull",
          content: {
            title: "Unable to Sell",
            message: `Please empty the ${def.name} before selling it.`,
          },
        })
      );
    } else {
      this.props.dispatch?.(
        showModal({
          id: "sellItemDialog",
          content: () => {
            return <SellItemDialog item={item} def={def} />;
          },
          escapable: true,
        })
      );
    }
  }

  private onItemEditButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "editItemDialog",
        content: () => {
          return <EditItemDialog item={item} def={def} />;
        },
        escapable: true,
      })
    );
  }

  private onBundleButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "splitBundleDialog",
        content: () => {
          return <SplitBundleDialog item={item} def={def} />;
        },
        escapable: true,
      })
    );
  }

  private onSpellbookButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "spellbookDialog",
        content: () => {
          return <SpellbookDialog item={item} def={def} />;
        },
        escapable: true,
        widthVmin: 50,
      })
    );
  }

  private handleItemDropped(dropTargetIds: string[], item: ItemData, def: ItemDefData): void {
    // We dropped the item in the middle of nowhere, do nothing.
    if (dropTargetIds.length === 0) {
      return;
    }

    // Bundle targets get high priority since they can appear inside the PersonalPile or inside Containers.
    const bundleTargetId = dropTargetIds
      .find((dti) => {
        return dti.startsWith("Bundle");
      })
      ?.slice(6);
    if (bundleTargetId) {
      this.handleItemDroppedOnBundle(+bundleTargetId, item, def);
      return;
    }

    if (dropTargetIds.includes(DropTargetSelectedStorage)) {
      this.handleItemDroppedOnSelectedStorage(item, def);
      return;
    }

    const containerTargetId = dropTargetIds.find((dti) => {
      return dti.startsWith("Container");
    });
    if (containerTargetId) {
      const containerId = +containerTargetId.slice(9);
      this.handleItemDroppedOnContainer(containerId, item, def);
    }

    const storageTargetId = dropTargetIds.find((dti) => {
      return dti.startsWith("Storage");
    });
    if (storageTargetId) {
      const storageId = +storageTargetId.slice(7);
      this.handleItemDroppedOnStorage(storageId, item, def);
    }

    if (dropTargetIds.includes(DropTargetTrashCan)) {
      this.handleItemDroppedOnTrashCan(item, def);
    }
  }

  private async handleItemDroppedOnBundle(bundleItemId: number, item: ItemData, def: ItemDefData): Promise<void> {
    // Moving onto yourself does nothing.
    if (bundleItemId === item.id) {
      return;
    }

    const bundleItem = this.props.allItems[bundleItemId];
    if (canItemsBeStacked(bundleItem, item, this.props.allItemDefs)) {
      // Same item type.  Merge bundles as much as possible.
      // How many items can fit into the place where the target bundle is contained?
      let countToMove: number = item.count;
      // If the bundle is in a container, we are capped by the capacity of that container.
      if (bundleItem.container_id > 0) {
        const availableRoom = getAvailableRoomForContainer(
          bundleItem.container_id,
          this.props.allItems,
          this.props.allItemDefs,
          // Ignore both the target bundle and the item being dropped, in case they're already in the same container.
          [bundleItemId, item.id]
        );
        // Since we ignored the bundle being dropped upon, we can calculate the total number of items that
        // can be IN the target bundle without exceeding capacity.
        const maxItemsInBundle = getMaxBundleItemsForRoom(def, availableRoom);
        countToMove = Math.min(item.count, maxItemsInBundle - bundleItem.count);
      }
      // Move as many items as possible into the target bundle.
      let equipSlot = CharacterEquipmentSlots.find((slot) => {
        return this.props.character[slot] === item.id;
      });
      const result = await ServerAPI.mergeBundleItems(
        item.id,
        bundleItemId,
        countToMove,
        equipSlot && this.props.character.id, // If this item was equipped, this passes the character id in.
        equipSlot // If this item was equipped, this passes its equipment slot name in.
      );
      if ("error" in result) {
        this.showServerErrorToaster(result.error);
      } else {
        if (this.props.dispatch) {
          // Update item counts.
          this.props.dispatch(updateItem({ ...bundleItem, count: bundleItem.count + countToMove }));
          if (countToMove === item.count) {
            // If we emptied a bundle, destroy it.
            this.props.dispatch(deleteItem(item.id));
            // If we took the item out of an equipment slot, mark it as unequipped.
            if (equipSlot) {
              this.props.dispatch(setEquipment({ characterId: this.props.character.id, itemId: 0, slot: equipSlot }));
            }
          } else {
            // We split the bundle, so decrease its count.
            this.props.dispatch(updateItem({ ...item, count: item.count - countToMove }));
          }
        }
      }
    } else {
      // Different item type, so they can't be bundled.
      const bundleDef = this.props.allItemDefs[bundleItem?.def_id];
      this.props.dispatch?.(
        showToaster({
          id: "InvalidByBundleType",
          content: {
            title: "Unable to Add",
            message: `${bundleDef?.name ?? "UNKNOWN"} and ${def.name} cannot be bundled together.`,
          },
        })
      );
    }
  }

  private async handleItemDroppedOnSelectedStorage(item: ItemData, def: ItemDefData): Promise<void> {
    // Is this item already in the selected storage?
    const selectedStorage = this.props.allStorages[this.props.activeStorageId];
    if (item.storage_id === selectedStorage.id) {
      return;
    }

    // Either set it or swap it with what was previously in the slot.
    const moves: ItemMoveParams[] = [];
    const itemUpdates: ItemData[] = [];

    // The item is moving from some container or storage into the selected storage.
    const moveItem: ItemMoveParams = {
      itemId: item.id,
      // Into the selected storage.
      destStorageId: selectedStorage.id,
    };
    moves.push(moveItem);

    const itemUpdate: ItemData = {
      ...this.props.allItems[item.id],
      container_id: 0,
      storage_id: selectedStorage.id,
    };
    itemUpdates.push(itemUpdate);

    const result = await ServerAPI.moveItems(moves);
    if ("error" in result) {
      this.showServerErrorToaster(result.error);
    } else {
      if (this.props.dispatch) {
        // Local item update, instead of refetching EVERY ITEM EVER.
        itemUpdates.forEach((item) => {
          this.props.dispatch?.(updateItem(item));
        });
      }
    }
  }

  private async handleItemDroppedOnStorage(storageId: number, item: ItemData, def: ItemDefData): Promise<void> {
    // Is this item already in that storage?
    const targetStorage = this.props.allStorages[storageId];
    if (item.storage_id === targetStorage.id) {
      return;
    }

    // Either set it or swap it with what was previously in the slot.
    const moves: ItemMoveParams[] = [];
    const itemUpdates: ItemData[] = [];

    // The item is moving from some container or storage into the selected storage.
    const moveItem: ItemMoveParams = {
      itemId: item.id,
      // Into the selected storage.
      destStorageId: targetStorage.id,
    };
    moves.push(moveItem);

    const itemUpdate: ItemData = {
      ...this.props.allItems[item.id],
      container_id: 0,
      storage_id: targetStorage.id,
    };
    itemUpdates.push(itemUpdate);

    const result = await ServerAPI.moveItems(moves);
    if ("error" in result) {
      this.showServerErrorToaster(result.error);
    } else {
      if (this.props.dispatch) {
        // Local item update, instead of refetching EVERY ITEM EVER.
        itemUpdates.forEach((item) => {
          this.props.dispatch?.(updateItem(item));
        });
      }
    }
  }

  private async handleItemDroppedOnTrashCan(item: ItemData, def: ItemDefData): Promise<void> {
    const itemIdsToDelete: number[] = getAllItemAssociatedItemIds(item.id);

    const result = await ServerAPI.deleteItems(itemIdsToDelete);
    if ("error" in result) {
      this.showServerErrorToaster(result.error);
    } else {
      if (this.props.dispatch) {
        // Local item update, instead of refetching EVERY ITEM EVER.
        itemIdsToDelete.forEach((itemId) => {
          this.props.dispatch?.(deleteItem(itemId));
        });
      }
    }
  }

  private async handleItemDroppedOnContainer(containerId: number, item: ItemData, def: ItemDefData): Promise<void> {
    if (containerId === item.id) {
      this.props.dispatch?.(
        showToaster({
          id: "InvalidBySelf",
          content: {
            title: "Unable to Add",
            message: `Only Ouroboros is allowed to contain itself!`,
          },
        })
      );
      return;
    }
    let container = this.props.allItems[containerId];
    let containerDef = this.props.allItemDefs[container?.def_id];
    if (containerDef) {
      if (container.count > 1) {
        this.props.dispatch?.(
          showToaster({
            id: "InvalidByStacked",
            content: {
              title: "Unable to Add",
              message: `Cannot add items to stacked containers.  Split one off from the stack first.`,
            },
          })
        );
        return;
      }
      // See if the container permits the dropped item's tags.
      if (containerDef.storage_filters.length > 0) {
        let isPermitted: boolean = false;
        containerDef.storage_filters.forEach((filter) => {
          if (!isPermitted && def.tags.includes(filter)) {
            isPermitted = true;
          }
        });
        if (!isPermitted) {
          this.props.dispatch?.(
            showToaster({
              id: "InvalidByStorageFilter",
              content: {
                title: "Unable to Add",
                message: `${containerDef.name} only permits items with types ${containerDef.storage_filters.join(
                  ", "
                )}.`,
              },
            })
          );
          return;
        }
      }

      // If the item we're moving is a container, make sure we're not effectively putting it inside itself.
      if (def.storage_stones > 0 || def.storage_sixth_stones > 0) {
        const isUniverseExploding = isContainerAInContainerB(containerId, item.id, this.props.allItems);
        if (isUniverseExploding) {
          this.props.dispatch?.(
            showToaster({
              id: "InvalidByRecursion",
              content: {
                title: "Unable to Add",
                message: `That would create an infinite loop of containment and destroy the universe!`,
              },
            })
          );
          return;
        }
      }

      // See if there is room in that container or not!  If room, add it.  If not, pop an error toaster/dialog.
      const availableRoom = getAvailableRoomForContainer(containerId, this.props.allItems, this.props.allItemDefs, [
        // We ignore the item being moved so that it doesn't block itself from being moved around.
        item.id,
      ]);
      const itemWeight = getItemTotalWeight(item, this.props.allItems, this.props.allItemDefs, []);

      if (StonesToSixths(itemWeight) > StonesToSixths(availableRoom)) {
        // Charged items can't be split
        if (!def.has_charges) {
          // If we're dropping a bundle, can we split the bundle to fit some items in?
          const countToMove = getMaxBundleItemsForRoom(def, availableRoom);
          if (countToMove > 0) {
            // Move as many items as possible into a new bundle in the target container.
            const result = await ServerAPI.splitBundleItems(item, containerId, 0, countToMove, def.id);
            if ("error" in result) {
              this.showServerErrorToaster(result.error);
            } else if (result.length !== 2) {
              this.showServerErrorToaster("Invalid server response size.");
            } else if ("error" in result[0]) {
              this.showServerErrorToaster(result[0].error);
            } else if ("error" in result[1]) {
              this.showServerErrorToaster(result[1].error);
            } else {
              if (this.props.dispatch && "insertId" in result[1]) {
                // Remove the items that were split off.
                this.props.dispatch(updateItem({ ...item, count: item.count - countToMove }));
                // Generate a brand new item bundle in the target container with the returned id.
                this.props.dispatch(
                  updateItem({
                    def_id: item.def_id,
                    count: countToMove,
                    id: result[1].insertId,
                    storage_id: 0,
                    container_id: containerId,
                    notes: item.notes,
                    is_for_sale: item.is_for_sale,
                    owner_ids: [...item.owner_ids],
                    is_unused: item.is_unused,
                    spell_ids: item.spell_ids,
                  })
                );
              }
            }
          } else {
            // Too big!  Won't fit!
            this.props.dispatch?.(
              showToaster({
                id: "InvalidByTooHeavy",
                content: {
                  title: "Unable to Add",
                  message: `Even one ${def.name} is too bulky to fit in that ${containerDef.name}!`,
                },
              })
            );
            return;
          }
        } else {
          // Too big!  Won't fit!
          this.props.dispatch?.(
            showToaster({
              id: "InvalidByTooHeavy",
              content: {
                title: "Unable to Add",
                message: `${getItemNameText(item, def)} is too bulky to fit in that ${containerDef.name}!`,
              },
            })
          );
          return;
        }
      } else {
        // There's enough room, so add it!
        const moves: ItemMoveParams[] = [];
        const itemUpdates: ItemData[] = [];

        // The item is moving from some container or storage into this new container.
        const moveItem: ItemMoveParams = {
          itemId: item.id,
          // Into the new container.
          destContainerId: containerId,
        };
        moves.push(moveItem);

        const itemUpdate: ItemData = {
          ...this.props.allItems[item.id],
          container_id: containerId,
          storage_id: 0,
        };
        itemUpdates.push(itemUpdate);

        // And tell the server to actually perform the moves.
        const result = await ServerAPI.moveItems(moves);
        if ("error" in result) {
          this.showServerErrorToaster(result.error);
        } else {
          if (this.props.dispatch) {
            // Local item update, instead of refetching EVERY ITEM EVER.
            itemUpdates.forEach((item) => {
              this.props.dispatch?.(updateItem(item));
            });
          }
        }
      }
    }
  }

  private showServerErrorToaster(errorText: string): void {
    this.props.dispatch?.(
      showToaster({
        id: "ServerError",
        content: { title: "Server Error", message: errorText },
      })
    );
  }

  private onCreateItemsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "CreateItemsDialog",
        content: () => {
          return <CreateItemDialog storageId={this.props.activeStorageId} />;
        },
        widthVmin: 62,
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages, activeStorageId } = state.storages;
  const allItemDefs = state.gameDefs.items;
  const allSpellDefs = state.gameDefs.spells;
  const { allItems } = state.items;
  const { currentDraggableId } = state.dragAndDrop;

  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
    allSpellDefs,
    allItems,
    currentDraggableId: currentDraggableId ?? "",
    activeStorageId,
  };
}

export const EditStoragesSubPanel = connect(mapStateToProps)(AEditStoragesSubPanel);
