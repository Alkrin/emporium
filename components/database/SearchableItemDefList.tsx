import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { ItemDefData } from "../../serverAPI";
import TooltipSource from "../TooltipSource";
import styles from "./SearchableItemDefList.module.scss";

interface State {
  searchText: string;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedItemId: number;
  onItemSelected: (selectedItemId: number) => void;
  renderTooltip?: (def: ItemDefData) => React.ReactNode;
}

interface InjectedProps {
  allItemDefs: Dictionary<ItemDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASearchableItemDefList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { searchText: "" };
  }

  render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { className, children, selectedItemId, onItemSelected, renderTooltip, allItemDefs, dispatch, ...otherProps } =
      this.props;

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        <div className={styles.searchRow}>
          <div className={styles.searchLabel}>Search</div>
          <input
            className={styles.searchField}
            type={"text"}
            value={this.state.searchText}
            onChange={(e) => {
              this.setState({ searchText: e.target.value });
            }}
          />
        </div>
        <div className={styles.itemListRoot}>
          {this.getSortedItems().map((itemDef) => {
            return this.renderItemRow(itemDef);
          })}
        </div>
      </div>
    );
  }

  private renderItemRow(itemDef: ItemDefData): React.ReactNode {
    const selectedClass = itemDef.id === this.props.selectedItemId ? styles.selected : "";

    if (this.props.renderTooltip) {
      return (
        <TooltipSource
          tooltipParams={{ id: `Item${itemDef.id}`, content: this.props.renderTooltip.bind(this, itemDef) }}
          className={`${styles.listRow} ${selectedClass}`}
          key={`idd${itemDef.id}`}
          onClick={this.onItemClicked.bind(this, itemDef.id)}
        >
          {itemDef.name}
        </TooltipSource>
      );
    } else {
      return (
        <div
          className={`${styles.listRow} ${selectedClass}`}
          key={`idd${itemDef.id}`}
          onClick={this.onItemClicked.bind(this, itemDef.id)}
        >
          {itemDef.name}
        </div>
      );
    }
  }

  private getSortedItems(): ItemDefData[] {
    const items: ItemDefData[] = Object.values(this.props.allItemDefs);

    items.sort((itemA, itemB) => {
      return itemA.name.localeCompare(itemB.name);
    });

    const sortedItems = items.filter((idd) => {
      return idd.name.toLocaleLowerCase().includes(this.state.searchText.trim().toLocaleLowerCase());
    });

    // If the search filter removed the selected item, unselect it.
    if (
      this.props.selectedItemId > 0 &&
      !sortedItems.find((idd) => {
        return idd.id === this.props.selectedItemId;
      })
    ) {
      // Pushing to the next frame so we don't trigger this directly inside of render().
      requestAnimationFrame(() => {
        this.props.onItemSelected?.(-1);
      });
    }

    return sortedItems;
  }

  private onItemClicked(itemId: number): void {
    const itemDef = this.props.allItemDefs[itemId];
    if (!itemDef) {
      return;
    }

    this.props.onItemSelected?.(itemId);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allItemDefs = state.gameDefs.items;
  return {
    ...props,
    allItemDefs,
  };
}

export const SearchableItemDefList = connect(mapStateToProps)(ASearchableItemDefList);
