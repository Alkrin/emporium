import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteTroopDef, updateStructureComponentDef, updateTroopDef } from "../../redux/gameDefsSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { StructureComponentDefData, TroopDefData } from "../../serverAPI";
import styles from "./DatabaseStructureComponentsSubPanel.module.scss";
import { SearchableDefList } from "./SearchableDefList";
import { SubPanelCloseButton } from "../SubPanelCloseButton";

interface State {
  selectedStructureComponentId: number;
  isSaving: boolean;
  // Data fields.
  name: string;
  description: string;
  costString: string;
}

const defaultState: State = {
  selectedStructureComponentId: -1,
  isSaving: false,
  name: "",
  description: "",
  costString: "0",
};

interface ReactProps {}

interface InjectedProps {
  allStructureComponentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseStructureComponentsSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedStructureComponentId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>Structure Component Database</div>
        <SearchableDefList
          className={styles.structureComponentListRoot}
          selectedDefId={this.state.selectedStructureComponentId}
          allDefs={this.props.allStructureComponentDefs}
          onDefSelected={(selectedStructureComponentId) => {
            this.setState({ selectedStructureComponentId });
            const scdd = this.props.allStructureComponentDefs[selectedStructureComponentId];
            if (scdd) {
              this.setState({
                selectedStructureComponentId,
                isSaving: this.state.isSaving,
                ...this.props.allStructureComponentDefs[selectedStructureComponentId],
                costString: this.props.allStructureComponentDefs[selectedStructureComponentId].cost.toFixed(2),
              });
            }
          }}
        />
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderDescriptionSection()}
          {this.renderCostSection()}
        </div>
        <div className={styles.createNewButton} onClick={this.onCreateNewClicked.bind(this)}>
          Create New
        </div>
        <div className={`${styles.deleteButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
          Delete
        </div>
        <div className={`${styles.cloneButton} ${deletableClass}`} onClick={this.onCloneClicked.bind(this)}>
          Clone
        </div>
        <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
          Save
        </div>
        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderIdSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>ID</div>
        <input
          className={styles.idField}
          type={"text"}
          value={this.state.selectedStructureComponentId === -1 ? "NEW" : `${this.state.selectedStructureComponentId}`}
          readOnly={true}
        />
      </div>
    );
  }

  private renderNameSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Name</div>
        <input
          className={styles.nameField}
          type={"text"}
          value={this.state.name}
          autoFocus
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ name: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderDescriptionSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>Description</div>
        <textarea
          className={styles.descriptionField}
          value={this.state.description}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ description: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderCostSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Cost</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.costString}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ costString: e.target.value });
          }}
        />
        <div className={styles.secondLabel}>{"\xa0GP"}</div>
      </div>
    );
  }

  private onCreateNewClicked(): void {
    if (this.state.isSaving) {
      return;
    }
    // Deselects any current spell and clears all data fields.
    this.setState(defaultState);
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    const data: StructureComponentDefData = {
      // If this is a new structure component, the selectedStructureComponentId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedStructureComponentId,
      name: this.state.name,
      description: this.state.description,
      cost: +this.state.costString,
    };

    if (this.state.selectedStructureComponentId === -1) {
      // Brand new structureComponentDef.
      const res = await ServerAPI.createStructureComponentDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateStructureComponentDef(data));

        // Select the structure component in the list.
        this.setState({ selectedStructureComponentId: data.id });
      }
    } else {
      // Editing old structureComponentDef.
      const res = await ServerAPI.editStructureComponentDef(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditStructureComponentDefFailure",
            content: { title: "Error!", message: "Changes were not saved.  Please try again." },
          })
        );
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateStructureComponentDef(data));
      }
    }

    this.setState({ isSaving: false });
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedStructureComponentId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteStructureComponentDef",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedStructureComponentId}?  This cannot be undone.`,
          buttonText: "Cancel",
          onButtonClick: () => {
            this.props.dispatch?.(hideModal());
          },
          extraButtons: [
            {
              text: "Delete",
              onClick: async () => {
                this.setState({ isSaving: true });
                this.props.dispatch?.(hideModal());
                const res = await ServerAPI.deleteTroopDef(this.state.selectedStructureComponentId);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and delete locally.
                  this.props.dispatch?.(deleteTroopDef(this.state.selectedStructureComponentId));
                  this.setState(defaultState);
                }
              },
            },
          ],
        },
      })
    );
  }

  private async onCloneClicked(): Promise<void> {
    // By setting the selection to -1, we retain all other values while
    // allowing the Save button to create a new item.
    this.setState({ selectedStructureComponentId: -1 });
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allStructureComponentDefs = state.gameDefs.structureComponents;
  return {
    ...props,
    allStructureComponentDefs,
  };
}

export const DatabaseStructureComponentsSubPanel = connect(mapStateToProps)(ADatabaseStructureComponentsSubPanel);
