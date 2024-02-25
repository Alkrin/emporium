import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteTroopDef, updateTroopDef } from "../../redux/gameDefsSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { TroopDefData } from "../../serverAPI";
import styles from "./DatabaseTroopsSubPanel.module.scss";
import { SearchableDefList } from "./SearchableDefList";
import { SubPanelCloseButton } from "../SubPanelCloseButton";

interface State {
  selectedTroopId: number;
  isSaving: boolean;
  // Data fields.
  name: string;
  description: string;
  ac: number;
  move: number;
  morale: number;
  individual_br: number;
  platoon_br: number;
  platoon_size: number;
  wage: number;
}

const defaultState: State = {
  selectedTroopId: -1,
  isSaving: false,
  name: "",
  description: "",
  ac: 0,
  move: 0,
  morale: 0,
  individual_br: 0,
  platoon_br: 0,
  platoon_size: 120,
  wage: 0,
};

interface ReactProps {}

interface InjectedProps {
  allTroopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseTroopsSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedTroopId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>Troop Database</div>
        <SearchableDefList
          className={styles.troopListRoot}
          selectedDefId={this.state.selectedTroopId}
          allDefs={this.props.allTroopDefs}
          onDefSelected={(selectedTroopId) => {
            this.setState({ selectedTroopId });
            const tdd = this.props.allTroopDefs[selectedTroopId];
            if (tdd) {
              this.setState({
                selectedTroopId,
                isSaving: this.state.isSaving,
                ...this.props.allTroopDefs[selectedTroopId],
              });
            }
          }}
        />
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderDescriptionSection()}
          {this.renderACSection()}
          {this.renderMoveSection()}
          {this.renderMoraleSection()}
          {this.renderIndividualBRSection()}
          {this.renderPlatoonBRSection()}
          {this.renderPlatoonSizeSection()}
          {this.renderWageSection()}
        </div>
        <div className={styles.createNewButton} onClick={this.onCreateNewClicked.bind(this)}>
          Create New
        </div>
        <div className={`${styles.deleteButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
          Delete
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
          value={this.state.selectedTroopId === -1 ? "NEW" : `${this.state.selectedTroopId}`}
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

  private renderACSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>AC</div>
        <input
          className={styles.smallInputField}
          type={"number"}
          value={this.state.ac}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ ac: +e.target.value });
          }}
        />
      </div>
    );
  }

  private renderMoveSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Move</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.move}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ move: +e.target.value });
          }}
        />
        <div className={styles.secondLabel}>'</div>
      </div>
    );
  }

  private renderMoraleSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Morale</div>
        <input
          className={styles.smallInputField}
          type={"number"}
          value={this.state.morale}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ morale: +e.target.value });
          }}
        />
      </div>
    );
  }

  private renderIndividualBRSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Individual BR</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.individual_br}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ individual_br: +e.target.value });
          }}
        />
      </div>
    );
  }

  private renderPlatoonBRSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Platoon BR</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.platoon_br}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ platoon_br: +e.target.value });
          }}
        />
      </div>
    );
  }

  private renderPlatoonSizeSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Platoon Size</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.platoon_size}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ platoon_size: +e.target.value });
          }}
        />
      </div>
    );
  }

  private renderWageSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Wage</div>
        <input
          className={styles.mediumInputField}
          type={"number"}
          value={this.state.wage}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ wage: +e.target.value });
          }}
        />
        <div className={styles.secondLabel}>gp</div>
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

    const data: TroopDefData = {
      // If this is a new troop, the selectedTroopId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedTroopId,
      name: this.state.name,
      description: this.state.description,
      ac: this.state.ac,
      move: this.state.move,
      morale: this.state.morale,
      individual_br: this.state.individual_br,
      platoon_br: this.state.platoon_br,
      platoon_size: this.state.platoon_size,
      wage: this.state.wage,
    };

    if (this.state.selectedTroopId === -1) {
      // Brand new troopDef.
      const res = await ServerAPI.createTroopDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateTroopDef(data));

        // Select the spell in the list.
        this.setState({ selectedTroopId: data.id });
      }
    } else {
      // Editing old troopDef.
      const res = await ServerAPI.editTroopDef(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditTroopDefFailure",
            content: { title: "Error!", message: "Changes were not saved.  Please try again." },
          })
        );
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateTroopDef(data));
      }
    }

    this.setState({ isSaving: false });
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedTroopId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteTroopDef",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedTroopId}?  This cannot be undone.`,
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
                const res = await ServerAPI.deleteTroopDef(this.state.selectedTroopId);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and delete locally.
                  this.props.dispatch?.(deleteTroopDef(this.state.selectedTroopId));
                  this.setState(defaultState);
                }
              },
            },
          ],
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allTroopDefs = state.gameDefs.troops;
  return {
    ...props,
    allTroopDefs,
  };
}

export const DatabaseTroopsSubPanel = connect(mapStateToProps)(ADatabaseTroopsSubPanel);
