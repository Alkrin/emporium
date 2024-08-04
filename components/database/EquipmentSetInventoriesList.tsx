import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { CharacterData, EquipmentSetItemData, ItemData, ItemDefData, StorageData } from "../../serverAPI";
import styles from "./EquipmentSetInventoriesList.module.scss";
import { showModal } from "../../redux/modalsSlice";
import { EquipmentSetCreateItemDialog } from "./EquipmentSetCreateItemDialog";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  items: EquipmentSetItemData[];
  createItem: (containerItemId: number, itemDefId: number) => void;
  deleteItem: (itemId: number) => void;
}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  allItems: Dictionary<ItemData>;
  currentDraggableId: string;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEquipmentSetInventoriesList extends React.Component<Props> {
  render(): React.ReactNode {
    const {
      className,
      items,
      character,
      allStorages,
      allItemDefs,
      allItems,
      currentDraggableId,
      createItem,
      deleteItem,
      dispatch,
      ...otherProps
    } = this.props;

    const rootContainers = items.filter((item) => {
      const def = this.props.allItemDefs[item.def_id];
      const isContainer = def.storage_stones > 0 || def.storage_sixth_stones > 0;
      // Looks a little silly, but contained items are in a Container slot, and anything else is a root-level item.
      return isContainer && !item.slot_name.startsWith("Container");
    });
    rootContainers.sort((a, b) => {
      const defA = allItemDefs[a.def_id];
      const defB = allItemDefs[b.def_id];

      const alphaSort = defA.name.localeCompare(defB.name);

      // If the names are different, sort by name.
      if (alphaSort) {
        return alphaSort;
      }

      // If the names are the same, sort by itemId.
      return a.item_id - b.item_id;
    });

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {rootContainers.map((item) => {
          return this.renderContainerSection(item, 0);
        })}
      </div>
    );
  }

  private renderContainerSection(item: EquipmentSetItemData, depth: number): React.ReactNode {
    const def = this.props.allItemDefs[item.def_id];
    if (def) {
      const containerSlotName = `Container${item.item_id}`;
      const containedItems = Object.values(this.props.items).filter((i) => {
        return i.slot_name === containerSlotName;
      });

      let itemNameText = def.name;
      if (def.purchase_quantity > 1) {
        itemNameText = `${def.name} ×${def.purchase_quantity}`;
      }

      return (
        <div key={containerSlotName} className={styles.containerRowDraggable}>
          <div className={styles.containerRowContentWrapper} style={{ marginLeft: `${depth}vmin` }}>
            <div className={styles.containerName}>{itemNameText}</div>
            <div className={styles.row}>
              <div className={styles.plusMinusButton} onClick={this.onPlusButtonClicked.bind(this, item)}>
                +
              </div>
              {depth > 0 && (
                <div className={styles.plusMinusButton} onClick={this.onMinusButtonClicked.bind(this, item)}>
                  -
                </div>
              )}
            </div>
          </div>
          {containedItems.map((it) => {
            return this.renderContainedItemRow(it, depth + 1);
          })}
        </div>
      );
    } else {
      return null;
    }
  }

  private renderContainedItemRow(item: EquipmentSetItemData, depth: number): React.ReactNode {
    const def = this.props.allItemDefs[item.def_id];
    if (def) {
      if (def.storage_stones > 0 || def.storage_sixth_stones > 0) {
        return this.renderContainerSection(item, depth);
      } else {
        let itemNameText = def.name;
        if (def.purchase_quantity > 1) {
          itemNameText = `${def.name} x${def.purchase_quantity}`;
        }
        return (
          <div className={styles.containedItemRowDraggable} key={`contained${item.item_id}`}>
            <div className={styles.containedItemRowContentWrapper} style={{ marginLeft: `${depth}vmin` }}>
              <div className={styles.containedItemName}>{itemNameText}</div>
              <div className={styles.plusMinusButton} onClick={this.onMinusButtonClicked.bind(this, item)}>
                -
              </div>
            </div>
          </div>
        );
      }
    } else {
      return null;
    }
  }

  private onPlusButtonClicked(container: EquipmentSetItemData): void {
    // Show a "create item in this container" dialog.
    this.props.dispatch?.(
      showModal({
        id: "CreateItemDialog",
        content: () => {
          return (
            <EquipmentSetCreateItemDialog
              container={container}
              items={this.props.items}
              createItem={this.props.createItem}
            />
          );
        },
      })
    );
  }

  private onMinusButtonClicked(item: EquipmentSetItemData): void {
    // Delete this item, and recursively delete anything contained in it.
    this.props.deleteItem(item.item_id);
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

export const EquipmentSetInventoriesList = connect(mapStateToProps)(AEquipmentSetInventoriesList);
