import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteSpellDef, updateSpellDef } from "../../redux/gameDefsSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, {
  SpellDefData,
  SpellDefData_StringToTypeLevels,
  SpellDefData_TypeLevelsToString,
} from "../../serverAPI";
import styles from "./DatabaseSpellsSubPanel.module.scss";
import { SearchableDefList } from "./SearchableDefList";
import { SubPanelCloseButton } from "../SubPanelCloseButton";

interface State {
  selectedSpellId: number;
  isSaving: boolean;
  name: string;
  description: string;
  spell_range: string;
  duration: string;
  tags: string;
  type_levels: string;
  table_image: string;
}

const defaultState: State = {
  selectedSpellId: -1,
  isSaving: false,
  name: "",
  description: "",
  spell_range: "",
  duration: "",
  tags: "",
  type_levels: "",
  table_image: "",
};

interface ReactProps {}

interface InjectedProps {
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseSpellsSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedSpellId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>Spell Database</div>
        <SearchableDefList
          className={styles.spellListRoot}
          selectedDefId={this.state.selectedSpellId}
          allDefs={this.props.allSpellDefs}
          onDefSelected={(selectedSpellId) => {
            this.setState({ selectedSpellId });
            const sdd = this.props.allSpellDefs[selectedSpellId];
            if (sdd) {
              this.setState({
                selectedSpellId,
                isSaving: this.state.isSaving,
                ...this.props.allSpellDefs[selectedSpellId],
                tags: this.props.allSpellDefs[selectedSpellId].tags?.join(","),
                type_levels: SpellDefData_TypeLevelsToString(sdd.type_levels),
              });
            }
          }}
        />
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderDescriptionSection()}
          {this.renderRangeSection()}
          {this.renderDurationSection()}
          {this.renderTypeLevelsSection()}
          {this.renderTableDataSection()}
          {this.renderTagsSection()}
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
          value={this.state.selectedSpellId === -1 ? "NEW" : `${this.state.selectedSpellId}`}
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

  private renderRangeSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Range</div>
        <input
          className={styles.rangeField}
          type={"text"}
          value={this.state.spell_range}
          autoFocus
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ spell_range: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderDurationSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Duration</div>
        <input
          className={styles.durationField}
          type={"text"}
          value={this.state.duration}
          autoFocus
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ duration: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderTagsSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>Tags</div>
        <textarea
          className={styles.tagsField}
          value={this.state.tags}
          spellCheck={false}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ tags: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderTypeLevelsSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>Type/Levels (e.g. "Arcane:1")</div>
        <textarea
          className={styles.typeLevelsField}
          value={this.state.type_levels}
          spellCheck={false}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ type_levels: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderTableDataSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>Table Image</div>
        <textarea
          className={styles.tableDataField}
          value={this.state.table_image}
          spellCheck={false}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ table_image: e.target.value });
          }}
        />
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

    const data: SpellDefData = {
      // If this is a new spell, the selectedSpellId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedSpellId,
      name: this.state.name,
      description: this.state.description,
      spell_range: this.state.spell_range,
      duration: this.state.duration,
      tags: this.state.tags.split(","),
      type_levels: SpellDefData_StringToTypeLevels(this.state.type_levels),
      table_image: this.state.table_image,
    };

    if (this.state.selectedSpellId === -1) {
      // Brand new spellDef.
      const res = await ServerAPI.createSpellDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateSpellDef(data));

        // Select the spell in the list.
        this.setState({ selectedSpellId: data.id });
      }
    } else {
      // Editing old spellDef.
      const res = await ServerAPI.editSpellDef(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditSpellDefFailure",
            content: { title: "Error!", message: "Changes were not saved.  Please try again." },
          })
        );
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateSpellDef(data));
      }
    }

    this.setState({ isSaving: false });
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedSpellId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteSpellDef",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedSpellId}?  This cannot be undone.`,
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
                const res = await ServerAPI.deleteSpellDef(this.state.selectedSpellId);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and delete locally.
                  this.props.dispatch?.(deleteSpellDef(this.state.selectedSpellId));
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
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    allSpellDefs,
  };
}

export const DatabaseSpellsSubPanel = connect(mapStateToProps)(ADatabaseSpellsSubPanel);
