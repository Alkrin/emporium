import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { StructureComponentData, StructureComponentDefData } from "../../serverAPI";
import styles from "./CreateStructureComponentSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { updateStructureComponent } from "../../redux/structuresSlice";
import { BasicDialog } from "../dialogs/BasicDialog";
import { SavingVeil } from "../SavingVeil";

interface State {
  componentDefId: number;
  countString: string;
  isSaving: boolean;
}

interface ReactProps {
  structureId: number;
}

interface InjectedProps {
  componentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateStructureComponentSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      componentDefId: 0,
      countString: "0",
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;

    const componentDef = this.props.componentDefs[this.state.componentDefId];

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{"Create New Structure Component"}</div>
        <div className={styles.contentRow}>
          <div className={styles.typeLabel}>{"Type"}</div>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.column}>
            <div className={styles.listContainer}>
              {this.getSortedComponentDefs().map(this.renderTypeRow.bind(this))}
            </div>
          </div>
          <div className={styles.infoPanel}>
            {this.state.componentDefId === 0 ? null : (
              <>
                <div className={styles.componentLabel}>{componentDef.name}</div>
                <div className={styles.horizontalLine} />
                <div className={styles.descriptionContainer}>
                  <div className={styles.descriptionLabel}>{componentDef.description}</div>
                </div>
                <div className={styles.horizontalLine} />
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>{"Cost:"}</div>
                  <div className={styles.infoValue}>{componentDef.cost}</div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Quantity"}</div>
          <input
            className={styles.countTextField}
            type={"number"}
            value={this.state.countString}
            onChange={(e) => {
              this.setState({ countString: e.target.value });
            }}
            tabIndex={nextTabIndex++}
          />
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.createButton} onClick={this.onCreateClicked.bind(this)}>
            {"Create"}
          </div>
        </div>
        <SavingVeil show={this.state.isSaving} />
        <SubPanelCloseButton />
      </div>
    );
  }

  private getSortedComponentDefs(): StructureComponentDefData[] {
    const defs = Object.values(this.props.componentDefs);
    defs.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });

    return defs;
  }

  private renderTypeRow(def: StructureComponentDefData, index: number): React.ReactNode {
    return (
      <div
        className={`${styles.listRow} ${def.id === this.state.componentDefId ? styles.selected : ""}`}
        key={`typeRow${index}`}
        onClick={() => {
          this.setState({ componentDefId: def.id });
        }}
      >
        <div className={styles.listName}>{def.name}</div>
      </div>
    );
  }

  private async onCreateClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid type?
    if (this.state.componentDefId === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoTypeError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please select a Type for this structure component!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid count?
    if (+this.state.countString <= 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoCountError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please enter a non-zero component quantity!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Create a new structure component.
    const newComponent: StructureComponentData = {
      id: 0,
      structure_id: this.props.structureId,
      component_id: this.state.componentDefId,
      quantity: +this.state.countString,
    };

    // Send it to the server!
    const res = await ServerAPI.createStructureComponent(newComponent);
    if ("error" in res) {
      console.log("Failed to create structure component.");
    } else {
      // Successfully created, so add it to the local data.
      newComponent.id = res.insertId;
      this.props.dispatch?.(updateStructureComponent(newComponent));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const componentDefs = state.gameDefs.structureComponents;
  return {
    ...props,
    componentDefs,
  };
}

export const CreateStructureComponentSubPanel = connect(mapStateToProps)(ACreateStructureComponentSubPanel);
