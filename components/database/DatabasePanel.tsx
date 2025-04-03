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
import { DatabaseProficiencyRollsDialog } from "./DatabaseProficiencyRollsDialog";
import { DatabaseResearchCategoriesDialog } from "./DatabaseResearchCategoriesDialog";
import { DatabaseResearchSubcategoriesDialog } from "./DatabaseResearchSubcategoriesDialog";
import { DatabaseHarvestingCategoriesDialog } from "./DatabaseHarvestingCategoriesDialog";

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
        <div className={styles.dataButton} onClick={this.onHarvestingCategoriesClicked.bind(this)}>
          {"Harvesting Categories"}
        </div>
        <div className={styles.dataButton} onClick={this.onItemsClicked.bind(this)}>
          {"Items"}
        </div>
        <div className={styles.dataButton} onClick={this.onProficiencyRollsClicked.bind(this)}>
          {"Proficiency Rolls"}
        </div>
        <div className={styles.dataButton} onClick={this.onResearchCategoriesClicked.bind(this)}>
          {"Research Categories"}
        </div>
        <div className={styles.dataButton} onClick={this.onResearchSubcategoriesClicked.bind(this)}>
          {"Research Subcategories"}
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
      })
    );
  }

  private onHarvestingCategoriesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseHarvestingCategories",
        content: () => {
          return <DatabaseHarvestingCategoriesDialog />;
        },
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
      })
    );
  }

  private onProficiencyRollsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseProficiencyRolls",
        content: () => {
          return <DatabaseProficiencyRollsDialog />;
        },
      })
    );
  }

  private onResearchCategoriesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseResearchCategories",
        content: () => {
          return <DatabaseResearchCategoriesDialog />;
        },
      })
    );
  }

  private onResearchSubcategoriesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseResearchSubcategories",
        content: () => {
          return <DatabaseResearchSubcategoriesDialog />;
        },
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
