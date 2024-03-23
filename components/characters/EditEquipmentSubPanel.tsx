import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, {
  CharacterData,
  CharacterEquipmentData,
  CharacterEquipmentSlots,
  ItemData,
  ItemDefData,
  StorageData,
} from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { ItemTooltip } from "../database/ItemTooltip";
import Draggable from "../Draggable";
import DraggableHandle from "../DraggableHandle";
import TooltipSource from "../TooltipSource";
import { CreateItemDialog } from "./CreateItemDialog";
import styles from "./EditEquipmentSubPanel.module.scss";
import DropTarget from "../DropTarget";
import { showToaster } from "../../redux/toastersSlice";
import { ItemMoveParams } from "../../serverRequestTypes";
import { deleteItem, updateItem } from "../../redux/itemsSlice";
import { WeaponStyle } from "../../staticData/types/characterClasses";
import { InventoriesList } from "./InventoriesList";
import {
  StonesToNumber,
  getAvailableRoomForContainer,
  getItemNameText,
  getItemTotalWeight,
  getMaxBundleItemsForRoom,
  isContainerAInContainerB,
} from "../../lib/itemUtils";
import { setEquipment } from "../../redux/charactersSlice";
import { SplitBundleDialog } from "./SplitBundleDialog";
import { EquipmentSlotTag, Tag } from "../../lib/tags";
import { SpellbookDialog } from "./SpellbookDialog";
import {
  canCharacterDualWield,
  canCharacterEquipShields,
  canCharacterEquipWeapon,
  getMaxBaseArmorForCharacter,
  getPersonalPile,
  isCharacterDualWielding,
  isCharacterWielding2hWeapon,
  whereIsItemEquipped,
} from "../../lib/characterUtils";
import { SubPanelCloseButton } from "../SubPanelCloseButton";

export const DropTypeItem = "DropTypeItem";

const DropTargetPersonalPile = "PersonalPile";

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  allItems: Dictionary<ItemData>;
  currentDraggableId: string;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditEquipmentSubPanel extends React.Component<Props> {
  render(): React.ReactNode {
    const personalPile = getPersonalPile(this.props.character.id);
    const characterClass = AllClasses[this.props.character.class_name];
    const canUseShield = characterClass.weaponStyles.includes(WeaponStyle.OneHandAndShield);

    return (
      <div className={styles.root}>
        <div className={styles.equipmentSlotsTitle}>Equipment Slots</div>
        <div className={styles.equipmentSlotList}>
          {this.renderEquipmentSlot("Melee Weapon", EquipmentSlotTag.Melee, "slot_melee1")}
          {this.renderEquipmentSlot("Melee Weapon", EquipmentSlotTag.Melee, "slot_melee2")}
          {this.renderEquipmentSlot("Ranged Weapon", EquipmentSlotTag.Ranged, "slot_ranged")}
          <div className={styles.equipmentCategorySpacer} />
          {this.renderEquipmentSlot("Armor", EquipmentSlotTag.Armor, "slot_armor")}
          {canUseShield && this.renderEquipmentSlot("Shield", EquipmentSlotTag.Shield, "slot_shield")}
          <div className={styles.equipmentCategorySpacer} />
          {this.renderEquipmentSlot("Backpack", EquipmentSlotTag.Backpack, "slot_backpack")}
          {this.renderEquipmentSlot("Pouch", EquipmentSlotTag.Pouch, "slot_pouch1")}
          {this.renderEquipmentSlot("Pouch", EquipmentSlotTag.Pouch, "slot_pouch2")}
          {this.renderEquipmentSlot("Bandolier", EquipmentSlotTag.Bandolier, "slot_bandolier1")}
          {this.renderEquipmentSlot("Bandolier", EquipmentSlotTag.Bandolier, "slot_bandolier2")}
          <div className={styles.equipmentCategorySpacer} />
          {this.renderEquipmentSlot("Cloak", EquipmentSlotTag.Cloak, "slot_cloak")}
          {this.renderEquipmentSlot("Eyes", EquipmentSlotTag.Eyes, "slot_eyes")}
          {this.renderEquipmentSlot("Feet", EquipmentSlotTag.Feet, "slot_feet")}
          {this.renderEquipmentSlot("Hands", EquipmentSlotTag.Hands, "slot_hands")}
          {this.renderEquipmentSlot("Head", EquipmentSlotTag.Head, "slot_head")}
          {this.renderEquipmentSlot("Necklace", EquipmentSlotTag.Necklace, "slot_necklace")}
          {this.renderEquipmentSlot("Ring", EquipmentSlotTag.Ring, "slot_ring1")}
          {this.renderEquipmentSlot("Ring", EquipmentSlotTag.Ring, "slot_ring2")}
          {this.renderEquipmentSlot("Waist", EquipmentSlotTag.Waist, "slot_waist")}
          {this.renderEquipmentSlot("Wrists", EquipmentSlotTag.Wrists, "slot_wrists")}
        </div>
        {personalPile && (
          <>
            <div className={styles.createItemsButton} onClick={this.onCreateItemsClicked.bind(this)}>
              Create Items
            </div>
            <div className={styles.personalPileTitle}>Personal Pile</div>
            <DropTarget dropId={DropTargetPersonalPile} dropTypes={[DropTypeItem]} className={styles.personalPileRoot}>
              {this.getPersonalPileItems().map((item) => {
                return this.renderPersonalPileItemRow(item);
              })}
            </DropTarget>
          </>
        )}
        <div className={styles.inventoriesTitle}>Inventories</div>
        <InventoriesList
          className={styles.inventoriesListRoot}
          containerIds={this.getContainerIds()}
          handleItemDropped={this.handleItemDropped.bind(this)}
        />
        <SubPanelCloseButton />
      </div>
    );
  }

  private getContainerIds(): number[] {
    // All personal pile containers.
    const containerIds: number[] = this.getPersonalPileItems()
      .filter((item) => {
        const def = this.props.allItemDefs[item.def_id];
        return def.storage_stones > 0 || def.storage_sixth_stones > 0;
      })
      .map((item) => {
        return item.id;
      });

    // All equipped items.
    CharacterEquipmentSlots.forEach((slotId) => {
      const itemId = this.props.character[slotId];
      // When swapping items, we can temporarily have items both equipped and in the PersonalPile.  When that
      // occurs, we'll just add the item once.
      if (itemId && !containerIds.includes(itemId)) {
        const item = this.props.allItems[itemId];
        if (!item) {
          // When moving bundleable equipment directly into a bundle, we temporarily get an invalid equipment id
          // while the bundles are being merged.
          return;
        }
        const def = this.props.allItemDefs[item.def_id];
        if (def.storage_stones > 0 || def.storage_sixth_stones > 0) {
          containerIds.push(itemId);
        }
      }
    });

    return containerIds;
  }

  private renderEquipmentSlot(
    slotName: string,
    slotTag: EquipmentSlotTag,
    slot_id: keyof CharacterEquipmentData
  ): React.ReactNode {
    const equippedItemId: number = this.props.character[slot_id];
    const equippedItem = this.props.allItems[equippedItemId];
    const equippedItemDef = this.props.allItemDefs[equippedItem?.def_id];
    const draggableId = `${slotTag}:${slot_id}`;

    // Valid target if dragging from one slot to another valid slot.
    let isValidDropTarget = this.props.currentDraggableId.startsWith(slotTag);
    if (!isValidDropTarget) {
      if (this.props.currentDraggableId.startsWith("personalPile")) {
        const itemId: number = +this.props.currentDraggableId.slice(12);
        const draggedItem = this.props.allItems[itemId];
        const draggedItemDef = this.props.allItemDefs[draggedItem.def_id];
        isValidDropTarget = draggedItemDef.tags.includes(slotTag);
      }
    }
    const validTargetClass = isValidDropTarget ? styles.validTarget : "";

    return (
      <div className={styles.equipmentRow} key={draggableId}>
        <div className={styles.slotTitle}>{slotName}</div>
        <DropTarget
          dropId={draggableId}
          dropTypes={[DropTypeItem]}
          className={`${styles.equipmentSlotRoot} ${validTargetClass}`}
        >
          {equippedItemDef && (
            <Draggable className={styles.equippedItemRow} draggableId={draggableId}>
              <DraggableHandle
                className={styles.fullDraggableHandle}
                draggableId={draggableId}
                dropTypes={[DropTypeItem]}
                draggingRender={() => {
                  return this.renderEquipmentSlotContents(equippedItem, equippedItemDef);
                }}
                dropHandler={(dropTargetIds) => {
                  this.handleItemDropped(dropTargetIds, equippedItem, equippedItemDef);
                }}
              >
                <TooltipSource
                  tooltipParams={{
                    id: `item${equippedItem.id}`,
                    content: () => {
                      return <ItemTooltip itemId={equippedItem.id} />;
                    },
                  }}
                  className={styles.fullDraggableHandle}
                  key={`item${equippedItem.id}`}
                />
              </DraggableHandle>
              {this.renderEquipmentSlotContents(equippedItem, equippedItemDef)}
            </Draggable>
          )}
        </DropTarget>
      </div>
    );
  }

  private renderEquipmentSlotContents(item: ItemData, def: ItemDefData): React.ReactNode {
    return (
      <div className={styles.equipmentSlotContentWrapper}>
        <div className={styles.equipmentSlotItemName}>{getItemNameText(item, def)}</div>
      </div>
    );
  }

  private getPersonalPileItems(): ItemData[] {
    const personalPile = getPersonalPile(this.props.character.id);

    const items: ItemData[] = Object.values(this.props.allItems).filter((item) => {
      return item.storage_id === personalPile.id;
    });

    items.sort((itemA, itemB) => {
      const nameA = this.props.allItemDefs[itemA.def_id]?.name ?? "";
      const nameB = this.props.allItemDefs[itemB.def_id]?.name ?? "";
      return nameA.localeCompare(nameB);
    });

    return items;
  }

  private renderPersonalPileItemRow(item: ItemData): React.ReactNode {
    const def = this.props.allItemDefs[item.def_id];
    if (!def) {
      return null;
    } else {
      const draggableId = `personalPile${item.id}`;
      return (
        <Draggable className={styles.personalPileRowDraggable} draggableId={draggableId} key={draggableId}>
          {def.bundleable && (
            <DropTarget dropId={`Bundle${item.id}`} dropTypes={[DropTypeItem]} className={styles.fullDraggableHandle} />
          )}
          <DraggableHandle
            className={styles.fullDraggableHandle}
            draggableId={draggableId}
            dropTypes={[DropTypeItem]}
            draggingRender={() => {
              return this.renderPersonalPileRowContents(item, def);
            }}
            dropHandler={(dropTargetIds) => {
              this.handleItemDropped(dropTargetIds, item, def);
            }}
          >
            <TooltipSource
              tooltipParams={{
                id: `item${item.id}`,
                content: () => {
                  return <ItemTooltip itemId={item.id} />;
                },
              }}
              className={styles.fullDraggableHandle}
              key={`item${item.id}`}
            />
          </DraggableHandle>
          {this.renderPersonalPileRowContents(item, def)}
        </Draggable>
      );
    }
  }

  private renderPersonalPileRowContents(item: ItemData, def: ItemDefData): React.ReactNode {
    const isSpellbook = def.tags.includes(Tag.Spellbook);
    return (
      <div className={styles.personalPileRowContentWrapper}>
        <div className={styles.personalPileItemName}>{getItemNameText(item, def)}</div>
        {def.bundleable && item.count > 1 && (
          <div className={styles.personalPileBundleButton} onClick={this.onBundleButtonClick.bind(this, item, def)} />
        )}
        {isSpellbook && (
          <div
            className={styles.personalPileSpellbookButton}
            onClick={this.onSpellbookButtonClick.bind(this, item, def)}
          />
        )}
      </div>
    );
  }

  private onBundleButtonClick(item: ItemData, def: ItemDefData): void {
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

  private onSpellbookButtonClick(item: ItemData, def: ItemDefData): void {
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

    if (dropTargetIds.includes(DropTargetPersonalPile)) {
      this.handleItemDroppedOnPersonalPile(item, def);
      return;
    }

    const equipmentTargetId = dropTargetIds.find((dti) => {
      return dti.startsWith("Equipment");
    });
    if (equipmentTargetId) {
      const [slotTag, slotId] = equipmentTargetId.split(":");
      this.handleItemDroppedOnEquipmentSlot(
        item,
        def,
        slotTag as EquipmentSlotTag,
        slotId as keyof CharacterEquipmentData
      );
      return;
    }

    const containerTargetId = dropTargetIds.find((dti) => {
      return dti.startsWith("Container");
    });
    if (containerTargetId) {
      const containerId = +containerTargetId.slice(9);
      this.handleItemDroppedOnContainer(containerId, item, def);
    }
  }

  private async handleItemDroppedOnBundle(bundleItemId: number, item: ItemData, def: ItemDefData): Promise<void> {
    // Moving onto yourself does nothing.
    if (bundleItemId === item.id) {
      return;
    }

    const bundleItem = this.props.allItems[bundleItemId];
    if (bundleItem?.def_id === def.id) {
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

  private async handleItemDroppedOnPersonalPile(item: ItemData, def: ItemDefData): Promise<void> {
    // Is this item already in the Personal Pile?
    const personalPile = getPersonalPile(this.props.character.id);
    if (item.storage_id === personalPile.id) {
      return;
    }

    // Either set it or swap it with what was previously in the slot.
    const moves: ItemMoveParams[] = [];
    const itemUpdates: ItemData[] = [];

    // If the item was equipped, unequip it.
    let equipSlot: keyof CharacterEquipmentData | null = null;
    CharacterEquipmentSlots.forEach((key) => {
      if (!equipSlot) {
        const equippedItemId: number = this.props.character[key as keyof CharacterEquipmentData];
        if (equippedItemId === item.id) {
          equipSlot = key as keyof CharacterEquipmentData;
          const unequipItem: ItemMoveParams = {
            itemId: item.id,
            // From the character.
            srcCharacterId: this.props.character.id,
            srcEquipmentSlot: key,
            // Into the personal pile.
            destStorageId: personalPile.id,
          };
          moves.push(unequipItem);

          const itemUpdate: ItemData = {
            ...this.props.allItems[item.id],
            storage_id: personalPile.id,
          };
          itemUpdates.push(itemUpdate);
        }
      }
    });

    if (!equipSlot) {
      // The item was not equipped, so it is moving from some container or storage into the personal pile.
      const moveItem: ItemMoveParams = {
        itemId: item.id,
        // Into the personal pile.
        destStorageId: personalPile.id,
      };
      moves.push(moveItem);

      const itemUpdate: ItemData = {
        ...this.props.allItems[item.id],
        container_id: 0,
        storage_id: personalPile.id,
      };
      itemUpdates.push(itemUpdate);
    }

    const result = await ServerAPI.moveItems(moves);
    if ("error" in result) {
      this.showServerErrorToaster(result.error);
    } else {
      if (this.props.dispatch) {
        if (equipSlot) {
          this.props.dispatch(setEquipment({ characterId: this.props.character.id, itemId: 0, slot: equipSlot }));
        }
        // Local item update, instead of refetching EVERY ITEM EVER.
        itemUpdates.forEach((item) => {
          this.props.dispatch?.(updateItem(item));
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
      const itemWeight = getItemTotalWeight(item.id, this.props.allItems, this.props.allItemDefs, []);

      if (StonesToNumber(itemWeight) > StonesToNumber(availableRoom)) {
        if (def.bundleable) {
          // If we're dropping a bundle, can we split the bundle to fit some items in?
          const countToMove = getMaxBundleItemsForRoom(def, availableRoom);
          if (countToMove > 0) {
            // Move as many items as possible into a new bundle in the target container.
            const result = await ServerAPI.splitBundleItems(item.id, containerId, 0, countToMove, def.id);
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

        // If the item was equipped, unequip it.
        let equipSlot: keyof CharacterEquipmentData | null = null;
        CharacterEquipmentSlots.forEach((key) => {
          if (!equipSlot) {
            const equippedItemId: number = this.props.character[key];
            if (equippedItemId === item.id) {
              equipSlot = key;
              const unequipItem: ItemMoveParams = {
                itemId: item.id,
                // From the character.
                srcCharacterId: this.props.character.id,
                srcEquipmentSlot: key,
                // Into the container.
                destContainerId: containerId,
              };
              moves.push(unequipItem);

              const itemUpdate: ItemData = {
                ...this.props.allItems[item.id],
                container_id: containerId,
              };
              itemUpdates.push(itemUpdate);
            }
          }
        });

        if (!equipSlot) {
          // The item was not equipped, so it is moving from some container or storage into this new container
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
        }

        // And tell the server to actually perform the moves.
        const result = await ServerAPI.moveItems(moves);
        if ("error" in result) {
          this.showServerErrorToaster(result.error);
        } else {
          if (this.props.dispatch) {
            if (equipSlot) {
              this.props.dispatch(setEquipment({ characterId: this.props.character.id, itemId: 0, slot: equipSlot }));
            }
            // Local item update, instead of refetching EVERY ITEM EVER.
            itemUpdates.forEach((item) => {
              this.props.dispatch?.(updateItem(item));
            });
          }
        }
      }
    }
  }

  private async handleItemDroppedOnEquipmentSlot(
    item: ItemData,
    def: ItemDefData,
    slotTag: EquipmentSlotTag,
    slotId: keyof CharacterEquipmentData
  ): Promise<void> {
    // Is this already the item equipped here?
    if (item.id === this.props.character[slotId]) {
      return;
    }

    // Verify if the dropped item is of the correct type.
    if (!def.tags.includes(slotTag)) {
      this.showWrongSlotToaster(def, slotTag.slice(9));
      return;
    }

    const moves: ItemMoveParams[] = [];
    const itemUpdates: ItemData[] = [];

    // Special handling for Armor.
    if (slotTag === EquipmentSlotTag.Armor) {
      const maxBaseArmor = getMaxBaseArmorForCharacter(this.props.character.id);
      if (def.ac > maxBaseArmor) {
        this.props.dispatch?.(
          showToaster({
            id: "WrongType",
            content: {
              title: "Unable to Equip",
              message: `${this.props.character.name} can only equip armor with a base AC of ${maxBaseArmor}.  ${def.name} has a base AC of ${def.ac}.`,
            },
          })
        );
        return;
      }
    }

    // Special handling for Shield.
    if (slotTag === EquipmentSlotTag.Shield) {
      // Is this character able to equip shields?
      if (!canCharacterEquipShields(this.props.character.id)) {
        this.props.dispatch?.(
          showToaster({
            id: "WrongType",
            content: {
              title: "Unable to Equip",
              message: `${this.props.character.name} can is not able to equip shields.`,
            },
          })
        );
        return;
      }

      // Is this character wielding a 2h-only weapon?
      if (isCharacterWielding2hWeapon(this.props.character.id)) {
        this.props.dispatch?.(
          showToaster({
            id: "WrongType",
            content: {
              title: "Unable to Equip",
              message: `${this.props.character.name} is already wielding a two handed melee weapon.  Remove it first!`,
            },
          })
        );
        return;
      }

      // Is this character dual wielding?
      if (isCharacterDualWielding(this.props.character.id)) {
        this.props.dispatch?.(
          showToaster({
            id: "WrongType",
            content: {
              title: "Unable to Equip",
              message: `${this.props.character.name} is already wielding two melee weapons.  Remove one first!`,
            },
          })
        );
        return;
      }
    }

    // Special handling for weapons.
    if (slotTag === EquipmentSlotTag.Melee || slotTag === EquipmentSlotTag.Ranged) {
      // Could the character EVER equip this weapon?  (class, proficiencies, etc.)
      if (!canCharacterEquipWeapon(this.props.character.id, item.id)) {
        this.props.dispatch?.(
          showToaster({
            id: "WrongType",
            content: {
              title: "Unable to Equip",
              message: `${this.props.character.name} is not trained in the use of ${def.name}.`,
            },
          })
        );
        return;
      }

      if (slotTag === EquipmentSlotTag.Melee) {
        // TODO: Does this conflict with other equipped gear? (weapons / shield)
        const hasShield = this.props.character.slot_shield > 0;
        const otherSlotItemId =
          slotId === "slot_melee1" ? this.props.character.slot_melee2 : this.props.character.slot_melee1;
        const otherItem = this.props.allItems[otherSlotItemId];
        const otherItemDef = this.props.allItemDefs[otherItem?.def_id];
        const itemIs2hOnly = def?.damage_die === 0;
        const otherItemIs2hOnly = otherItemDef?.damage_die === 0;

        if (itemIs2hOnly) {
          // If the item is a 2h-only, the user can't be weilding a shield at the same time.
          if (hasShield) {
            this.props.dispatch?.(
              showToaster({
                id: "WrongType",
                content: {
                  title: "Unable to Equip",
                  message: `${this.props.character.name} cannot equip a 2-handed weapon at the same time as a shield.  Remove the shield first!`,
                },
              })
            );
            return;
          }
          // If the item is a 2h-only, the user can't place it in a blank slot if the other slot already has a weapon.
          if (otherSlotItemId > 0) {
            this.props.dispatch?.(
              showToaster({
                id: "WrongType",
                content: {
                  title: "Unable to Equip",
                  message: `${this.props.character.name} cannot equip a 2-handed weapon at the same time as another weapon.  Remove the other weapon first!`,
                },
              })
            );
            return;
          }
        } else {
          // If the item is 1h-capable, the user can't place it in a blank slot if other slot has a 2h-only weapon in it.
          if (otherItemIs2hOnly) {
            this.props.dispatch?.(
              showToaster({
                id: "WrongType",
                content: {
                  title: "Unable to Equip",
                  message: `${this.props.character.name} cannot equip a 1-handed weapon at the same time as a 2-handed weapon.  Remove the other weapon first!.`,
                },
              })
            );
            return;
          }
          // If the item is 1h-capable, the user can't place it in a blank slot if the other slot is full and the character class can't dual wield.
          if (otherItem && !canCharacterDualWield(this.props.character.id)) {
            this.props.dispatch?.(
              showToaster({
                id: "WrongType",
                content: {
                  title: "Unable to Equip",
                  message: `${this.props.character.name} is not trained in dual wielding.`,
                },
              })
            );
            return;
          }
          // Can't equip two weapons AND a shield.
          if (otherItem && hasShield) {
            this.props.dispatch?.(
              showToaster({
                id: "WrongType",
                content: {
                  title: "Unable to Equip",
                  message: `${this.props.character.name} cannot equip two weapons AND a shield.  Remove one first!`,
                },
              })
            );
            return;
          }
        }
      }
    }

    // If the item being equipped already equipped by this character (e.g. swapping between the two pouch slots), remove it from its old spot.
    const previousSlotId = whereIsItemEquipped(this.props.character, item.id);
    if (previousSlotId !== null) {
      const destStorageId = getPersonalPile(this.props.character.id).id;
      const removeThisItem: ItemMoveParams = {
        itemId: item.id,
        // From the character.
        srcCharacterId: this.props.character.id,
        srcEquipmentSlot: previousSlotId,
        // Into the personal pile.
        destStorageId,
      };
      moves.push(removeThisItem);
      // Don't need a matching local item update because we are moving between two equipment slots,
      // ut we do need to update the character's own data.
      this.props.dispatch?.(setEquipment({ characterId: this.props.character.id, itemId: 0, slot: previousSlotId }));
    }

    // If the item is being placed into an occupied equipment slot, remove whatever was there and drop it into the Personal Pile.
    if (this.props.character[slotId] !== 0) {
      // Have to swap out the previously worn equipment.
      const destStorageId = getPersonalPile(this.props.character.id).id;
      const oldEquipment = this.props.allItems[this.props.character[slotId]];
      const removeOldEquipment: ItemMoveParams = {
        itemId: oldEquipment.id,
        // From the character.
        srcCharacterId: this.props.character.id,
        srcEquipmentSlot: slotId,
        // Into the personal pile.
        destStorageId,
      };
      moves.push(removeOldEquipment);
      const itemUpdate: ItemData = {
        ...oldEquipment,
        storage_id: destStorageId,
      };
      itemUpdates.push(itemUpdate);
    }

    // Assign the item to the equipment slot from some non-equipped location.  That data is stored on the item's entry,
    // so we don't have to specify a src here.
    const srcSplit = def.bundleable && item.count > 1; // If the source item is a bundle, we split one item off to equip.
    const equipItem: ItemMoveParams = {
      itemId: item.id,
      srcSplit,
      // Onto the equipment slot.
      destCharacterId: this.props.character.id,
      destEquipmentSlot: slotId,
    };
    moves.push(equipItem);

    if (srcSplit) {
      // If this is a split, we remove one item from the bundle.
      const itemUpdate: ItemData = {
        ...item,
        count: item.count - 1,
      };
      itemUpdates.push(itemUpdate);
    } else {
      // If this is a full move, we take the item out of wherever it used to be.
      const itemUpdate: ItemData = {
        ...item,
        storage_id: 0,
        container_id: 0,
      };
      itemUpdates.push(itemUpdate);
    }

    const result = await ServerAPI.moveItems(moves);
    if (
      "error" in result ||
      result.find((res) => {
        return "error" in res;
      })
    ) {
      this.showServerErrorToaster("Error occurred during item move.");
    } else {
      if (this.props.dispatch) {
        // Local item update, instead of refetching EVERY ITEM EVER.
        itemUpdates.forEach((item) => {
          this.props.dispatch?.(updateItem(item));
        });
        if (srcSplit) {
          // If we successfully equipped from a bundle, the next-to-last action taken was to insert a new row into the `items` table.
          // We need to grab the id from that insert result and generate a local item to match it.
          const insertResult = result[result.length - 2];
          if ("insertId" in insertResult) {
            this.props.dispatch?.(
              updateItem({ id: insertResult.insertId, def_id: def.id, count: 1, container_id: 0, storage_id: 0 })
            );
            this.props.dispatch(
              setEquipment({ characterId: this.props.character.id, itemId: insertResult.insertId, slot: slotId })
            );
          }
        } else {
          // Not a split, so we're keeping the original itemId.
          this.props.dispatch(setEquipment({ characterId: this.props.character.id, itemId: item.id, slot: slotId }));
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

  private showWrongSlotToaster(def: ItemDefData, slot: string): void {
    this.props.dispatch?.(
      showToaster({
        id: "WrongSlot",
        content: { title: "Invalid Slot", message: `${def.name} cannot be equipped as ${slot}` },
      })
    );
  }

  private onCreateItemsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "CreatItemsDialog",
        content: () => {
          return <CreateItemDialog />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  const allItemDefs = state.gameDefs.items;
  const { allItems } = state.items;
  const { currentDraggableId } = state.dragAndDrop;

  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
    allItems,
    currentDraggableId: currentDraggableId ?? "",
  };
}

export const EditEquipmentSubPanel = connect(mapStateToProps)(AEditEquipmentSubPanel);
