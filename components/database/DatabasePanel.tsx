import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { SubPanelPane } from "../SubPanelPane";
import { DatabaseItemsDialog } from "./DatabaseItemsDialog";
import { DatabaseSpellsDialog } from "./DatabaseSpellsDialog";
import styles from "./DatabasePanel.module.scss";
import { DatabaseEquipmentSetsDialog } from "./DatabaseEquipmentSetsDialog";
import { DatabaseTroopsDialog } from "./DatabaseTroopsDialog";
import { DatabaseStructureComponentsDialog } from "./DatabaseStructureComponentsDialog";
import { showModal } from "../../redux/modalsSlice";
import { DatabaseAbilitiesDialog } from "./DatabaseAbilitiesDialog";
import { DatabaseCharacterClassesDialog } from "./DatabaseCharacterClassesDialog";

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabasePanel extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.dataButton} onClick={this.onAbilitiesClicked.bind(this)}>
          {"Abilities"}
        </div>
        <div className={styles.dataButton} onClick={this.onCharacterClassesClicked.bind(this)}>
          {"Character Classes"}
        </div>
        <div className={styles.dataButton} onClick={this.onEquipmentSetsClicked.bind(this)}>
          {"Equipment Sets"}
        </div>
        <div className={styles.dataButton} onClick={this.onItemsClicked.bind(this)}>
          {"Items"}
        </div>
        <div className={styles.dataButton} onClick={this.onSpellsClicked.bind(this)}>
          {"Spells"}
        </div>
        <div className={styles.dataButton} onClick={this.onStructureComponentsClicked.bind(this)}>
          {"Structure Components"}
        </div>
        <div className={styles.dataButton} onClick={this.onTroopsClicked.bind(this)}>
          {"Troops"}
        </div>
        <SubPanelPane />
      </div>
    );
  }

  private onAbilitiesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseAbilities",
        content: () => {
          return <DatabaseAbilitiesDialog />;
        },
        escapable: true,
      })
    );
  }

  private onCharacterClassesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseCharacterClasses",
        content: () => {
          return <DatabaseCharacterClassesDialog />;
        },
        escapable: true,
      })
    );
  }

  private onEquipmentSetsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseEquipmentSets",
        content: () => {
          return <DatabaseEquipmentSetsDialog />;
        },
        escapable: true,
      })
    );
  }

  private onItemsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseItems",
        content: () => {
          return <DatabaseItemsDialog />;
        },
        escapable: true,
      })
    );
  }

  private onSpellsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseSpells",
        content: () => {
          return <DatabaseSpellsDialog />;
        },
        escapable: true,
      })
    );
  }

  private onStructureComponentsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseStructureComponents",
        content: () => {
          return <DatabaseStructureComponentsDialog />;
        },
        escapable: true,
      })
    );
  }

  private onTroopsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseTroops",
        content: () => {
          return <DatabaseTroopsDialog />;
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
