import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import TooltipSource from "../TooltipSource";
import styles from "./SearchableDefList.module.scss";

export interface SearchableDef {
  id: number;
  name: string;
  [key: string]: any;
}

interface State {
  searchText: string;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDefId: number;
  allDefs: Dictionary<SearchableDef>;
  onDefSelected: (selectedDefId: number) => void;
  renderTooltip?: (def: SearchableDef) => React.ReactNode;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASearchableDefList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { searchText: "" };
  }

  render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { className, children, selectedDefId, allDefs, onDefSelected, renderTooltip, dispatch, ...otherProps } =
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
          {this.getSortedDefs().map((def) => {
            return this.renderDefRow(def);
          })}
        </div>
      </div>
    );
  }

  private renderDefRow(def: SearchableDef): React.ReactNode {
    const selectedClass = def.id === this.props.selectedDefId ? styles.selected : "";

    if (this.props.renderTooltip) {
      return (
        <TooltipSource
          tooltipParams={{ id: `Item${def.id}`, content: this.props.renderTooltip.bind(this, def) }}
          className={`${styles.listRow} ${selectedClass}`}
          key={`idd${def.id}`}
          onClick={this.onItemClicked.bind(this, def.id)}
        >
          {def.name}
        </TooltipSource>
      );
    } else {
      return (
        <div
          className={`${styles.listRow} ${selectedClass}`}
          key={`idd${def.id}`}
          onClick={this.onItemClicked.bind(this, def.id)}
        >
          {def.name}
        </div>
      );
    }
  }

  private getSortedDefs(): SearchableDef[] {
    const defs: SearchableDef[] = Object.values(this.props.allDefs);

    defs.sort((defA, defB) => {
      return defA.name.localeCompare(defB.name);
    });

    const sortedDefs = defs.filter((def) => {
      return def.name.toLocaleLowerCase().includes(this.state.searchText.trim().toLocaleLowerCase());
    });

    // If the search filter removed the selected item, unselect it.
    if (
      this.props.selectedDefId > 0 &&
      !sortedDefs.find((idd) => {
        return idd.id === this.props.selectedDefId;
      })
    ) {
      // Pushing to the next frame so we don't trigger this directly inside of render().
      requestAnimationFrame(() => {
        this.props.onDefSelected?.(-1);
      });
    }

    return sortedDefs;
  }

  private onItemClicked(itemId: number): void {
    this.props.onDefSelected?.(itemId);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SearchableDefList = connect(mapStateToProps)(ASearchableDefList);
