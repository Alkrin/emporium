import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { SubPanelPane } from "../SubPanelPane";
import { DatabaseItemsSubPanel } from "./DatabaseItemsSubPanel";
import { DatabaseSpellsSubPanel } from "./DatabaseSpellsSubPanel";
import styles from "./DatabasePanel.module.scss";
import { DatabaseEquipmentSetsSubPanel } from "./DatabaseEquipmentSetsSubPanel";
import { DatabaseTroopsSubPanel } from "./DatabaseTroopsSubPanel";
import { DatabaseStructureComponentsSubPanel } from "./DatabaseStructureComponentsSubPanel";

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabasePanel extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.dataButton} onClick={this.onEquipmentSetsClicked.bind(this)}>
          Equipment Sets
        </div>
        <div className={styles.dataButton} onClick={this.onItemsClicked.bind(this)}>
          Items
        </div>
        <div className={styles.dataButton} onClick={this.onSpellsClicked.bind(this)}>
          Spells
        </div>
        <div className={styles.dataButton} onClick={this.onStructureComponentsClicked.bind(this)}>
          Structure Components
        </div>
        <div className={styles.dataButton} onClick={this.onTroopsClicked.bind(this)}>
          Troops
        </div>
        <SubPanelPane />
      </div>
    );
  }

  private onEquipmentSetsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseEquipmentSets",
        content: () => {
          return <DatabaseEquipmentSetsSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private onItemsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseItems",
        content: () => {
          return <DatabaseItemsSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private onSpellsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseSpells",
        content: () => {
          return <DatabaseSpellsSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private onStructureComponentsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseStructureComponents",
        content: () => {
          return <DatabaseStructureComponentsSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private onTroopsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseTroops",
        content: () => {
          return <DatabaseTroopsSubPanel />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabasePanel = connect(mapStateToProps)(ADatabasePanel);
