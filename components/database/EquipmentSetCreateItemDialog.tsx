import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { EquipmentSetItemData, ItemDefData } from "../../serverAPI";
import styles from "./EquipmentSetCreateItemDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { Stones, StonesAMinusB, StonesAPlusB, StonesToNumber, getBundleWeight } from "../../lib/itemUtils";

interface State {
  selectedItemDefId: number;
  saving: boolean;
}

interface ReactProps {
  container: EquipmentSetItemData;
  items: EquipmentSetItemData[];
  createItem: (containerItemId: number, itemDefId: number) => void;
}

interface InjectedProps {
  allItemDefs: Dictionary<ItemDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEquipmentSetCreateItemDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedItemDefId: 0,
      saving: false,
    };
  }

  render(): React.ReactNode {
    const containerDef = this.props.allItemDefs[this.props.container.def_id];
    const [contentStones, contentSixthStones] = this.getContentsSize(this.props.container.item_id);
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Create Items"}</div>
        <div
          className={styles.containerName}
        >{`in Container #${this.props.container.item_id} : ${containerDef.name}`}</div>
        <div className={styles.capacityLabel}>{`Capacity: ${containerDef.storage_stones} ${
          containerDef.storage_sixth_stones > 0 ? `${containerDef.storage_sixth_stones}/6 ` : ""
        }stone`}</div>
        <div className={styles.contentsLabel}>{`Contents: ${contentStones} ${
          contentSixthStones > 0 ? `${contentSixthStones}/6 ` : ""
        }stone`}</div>
        <select
          className={styles.itemSelector}
          value={this.state.selectedItemDefId}
          onChange={(e) => {
            this.setState({ selectedItemDefId: +e.target.value });
          }}
        >
          <option value={0}>---</option>
          {this.getValidItemDefs().map(({ name, id, purchase_quantity }) => {
            return (
              <option value={id} key={`item${id}`}>
                {`${name}${purchase_quantity > 1 ? ` ×${purchase_quantity}` : ""}`}
              </option>
            );
          })}
        </select>
        <div className={styles.closeButton} onClick={this.onCreateClicked.bind(this)}>
          Create Item
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
      </div>
    );
  }

  private onCreateClicked(): void {
    if (this.state.selectedItemDefId > 0) {
      this.props.createItem(this.props.container.item_id, this.state.selectedItemDefId);
      // Mildly inconvenient, but easier to close the dialog after each item.
      this.onCloseClicked();
    }
  }

  private getValidItemDefs(): ItemDefData[] {
    const containerDef = this.props.allItemDefs[this.props.container.def_id];

    const maxContentSize: Stones = [containerDef.storage_stones, containerDef.storage_sixth_stones];
    const currContentSize = this.getContentsSize(this.props.container.item_id);
    const remainingCapacityRaw = StonesToNumber(StonesAMinusB(maxContentSize, currContentSize));

    const items: ItemDefData[] = Object.values(this.props.allItemDefs).filter((def) => {
      // If there is a storage filter, only include items that match the filter.
      if (containerDef.storage_filters.length > 0) {
        if (
          !def.tags.find((tag) => {
            return containerDef.storage_filters.includes(tag);
          })
        ) {
          return false;
        }
      }

      // Validate against available room in the container.
      const itemSizeRaw = StonesToNumber(this.getItemDefSize(def.id));
      if (itemSizeRaw > remainingCapacityRaw) {
        return false;
      }

      return true;
    });

    // Sort alphabetically.
    items.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return items;
  }

  private getContentsSize(containerItemId: number): Stones {
    let size: Stones = [0, 0];

    const containerSlot = `Container${containerItemId}`;
    this.props.items.forEach((item) => {
      if (item.slot_name === containerSlot) {
        size = StonesAPlusB(size, this.getItemSize(item));
      }
    });

    return size;
  }

  private getItemDefSize(defId: number): Stones {
    const def = this.props.allItemDefs[defId];

    // Most items have a personal size.
    let size: Stones = [def.stones, def.sixth_stones];
    if (def.bundleable) {
      // But if it's a bundle, assume one purchase unit of items.
      size = StonesAPlusB(size, getBundleWeight(def, def.purchase_quantity));
    }
    return size;
  }

  private getItemSize(item: EquipmentSetItemData): Stones {
    let size: Stones = this.getItemDefSize(item.def_id);

    const def = this.props.allItemDefs[item.def_id];

    // If it is a container with applicable contents, measure them as well.
    if (!def.fixed_weight && (def.storage_stones > 0 || def.storage_sixth_stones > 0)) {
      size = StonesAPlusB(size, this.getContentsSize(item.item_id));
    }

    return size;
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allItemDefs = state.gameDefs.items;
  return {
    ...props,
    allItemDefs,
  };
}

export const EquipmentSetCreateItemDialog = connect(mapStateToProps)(AEquipmentSetCreateItemDialog);
