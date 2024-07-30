import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { CharacterData, ItemData, ItemDefData } from "../../serverAPI";
import styles from "./ItemTooltip.module.scss";
import { getItemContainedWeight, getItemNameText, getItemTotalWeight } from "../../lib/itemUtils";
import { Dictionary } from "../../lib/dictionary";

interface ReactPropsItem extends React.HTMLAttributes<HTMLDivElement> {
  // Only need one or the other.
  itemId: number;
}

interface ReactPropsItemDef extends React.HTMLAttributes<HTMLDivElement> {
  // Only need one or the other.
  itemDefId: number;
}

type ReactProps = ReactPropsItem | ReactPropsItemDef;

interface InjectedProps {
  item?: ItemData;
  itemDef?: ItemDefData;
  allItems: Dictionary<ItemData>;
  allItemDefs: Dictionary<ItemDefData>;
  allCharacters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AItemTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const { item, itemDef } = this.props;
    if (!itemDef) {
      // Existence of itemDef implies that item was found as well (if specified).
      return null;
    }

    const equipmentSlotTags = itemDef.tags
      .filter((tag) => {
        return tag.startsWith("Equipment");
      })
      .map((rawTag) => {
        return rawTag.slice(9);
      });

    return (
      <div className={styles.root}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{getItemNameText(item, itemDef)}</div>
          {<div className={styles.slot}>{equipmentSlotTags.join(", ")}</div>}
        </div>
        <div className={styles.row}>
          {itemDef.ac > 0 && <div className={styles.segment}>{`AC: ${itemDef.ac + itemDef.magic_bonus}`}</div>}
          {itemDef.range_increment > 0 && (
            <div className={styles.segment}>{`Range: ${itemDef.range_increment}/${itemDef.range_increment * 2}/${
              itemDef.range_increment * 3
            }'`}</div>
          )}
        </div>
        <div className={styles.row}>
          <div className={styles.segment}>{this.getSizeText()}</div>
          {(itemDef.storage_stones > 0 || itemDef.storage_sixth_stones > 0) && (
            <div className={styles.segment}>{this.getStorageCapacityText()}</div>
          )}
          {item && (itemDef.storage_stones > 0 || itemDef.storage_sixth_stones > 0) && (
            <div className={styles.segment}>{this.getStoredWeightText()}</div>
          )}
        </div>
        <div className={styles.description}>{itemDef.description}</div>
        {(this.props.item?.notes?.length ?? 0) > 0 ? (
          <div className={styles.notesSection}>{this.props.item?.notes}</div>
        ) : null}
        {this.props.item?.is_for_sale ? <div className={styles.forSale}>{"Marked For Sale"}</div> : null}
        {this.props.item?.is_unused ? <div className={styles.grantsXP}>{"Grants XP when sold"}</div> : null}
        {(this.props.item?.owner_ids?.length ?? 0) > 0 ? (
          <div className={styles.ownersLabel}>
            {"If this item is Sold, the following characters will receive a share.\n\xa0" +
              this.props.item?.owner_ids?.map((id) => this.props.allCharacters[id]?.name)?.join("\n\xa0")}
          </div>
        ) : null}
        {"itemId" in this.props && this.props.itemId && <div className={styles.itemId}>#{this.props.itemId}</div>}
      </div>
    );
  }

  private getSizeText(): string {
    const { item, itemDef } = this.props;
    if (item && itemDef) {
      // We have a properly instantiated item, so we can show its current status.
      const [stones, sixthStones] = getItemTotalWeight(item.id, this.props.allItems, this.props.allItemDefs, []);
      // If only stones, show only stones.
      if (sixthStones === 0) {
        return `${stones} stone`;
      } else if (stones > 0) {
        return `${stones} ${sixthStones}/6 stone`;
      } else {
        return `${sixthStones}/6 stone`;
      }
    } else if (itemDef) {
      // This is just an itemDef, so we only show generic values.
      if (itemDef.bundleable) {
        return `${itemDef.number_per_stone} per stone`;
      } else {
        // If only stones, show only stones.
        if (itemDef.sixth_stones === 0) {
          return `${itemDef.stones} stone`;
        } else if (itemDef.stones > 0) {
          return `${itemDef.stones} ${itemDef.sixth_stones}/6 stone`;
        } else {
          return `${itemDef.sixth_stones}/6 stone`;
        }
      }
    }
    return "";
  }

  private getStorageCapacityText(): string {
    const { itemDef } = this.props;
    if (itemDef) {
      // If only stones, show only stones.
      if (itemDef.storage_sixth_stones === 0) {
        return `Capacity: ${itemDef.storage_stones} stone`;
      } else if (itemDef.storage_stones > 0) {
        return `Capacity: ${itemDef.storage_stones} ${itemDef.storage_sixth_stones}/6 stone`;
      } else {
        return `Capacity: ${itemDef.storage_sixth_stones}/6 stone`;
      }
    }
    return "";
  }

  private getStoredWeightText(): string {
    const { item, itemDef } = this.props;
    if (item && itemDef) {
      let [stones, sixthStones] = getItemContainedWeight(item.id, this.props.allItems, this.props.allItemDefs, []);
      // If only stones, show only stones.
      if (sixthStones === 0) {
        return `Contains: ${stones} stone`;
      } else if (stones > 0) {
        return `Contains: ${stones} ${sixthStones}/6 stone`;
      } else {
        return `Contains: ${sixthStones}/6 stone`;
      }
    }
    return "";
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allItems } = state.items;
  const allItemDefs = state.gameDefs.items;
  const allCharacters = state.characters.characters;
  if ("itemId" in props) {
    const item = allItems[props.itemId];
    const itemDef = allItemDefs[item?.def_id];
    return {
      ...props,
      item,
      itemDef,
      allItems,
      allItemDefs,
      allCharacters,
    };
  } else {
    const itemDef = allItemDefs[props.itemDefId];
    return {
      ...props,
      itemDef,
      allItems,
      allItemDefs,
      allCharacters,
    };
  }
}

export const ItemTooltip = connect(mapStateToProps)(AItemTooltip);
