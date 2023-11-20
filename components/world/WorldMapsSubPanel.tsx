import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { MapData } from "../../serverAPI";
import styles from "./WorldMapsSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { SearchableDefList } from "../database/SearchableDefList";
import { deleteMap, updateMap } from "../../redux/mapsSlice";
import { Dictionary } from "../../lib/dictionary";

interface State {
  selectedMapId: number;
  isSaving: boolean;
  name: string;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

const defaultState: State = {
  selectedMapId: -1,
  isSaving: false,
  name: "",
  min_x: 0,
  max_x: 100,
  min_y: 0,
  max_y: 100,
};

interface ReactProps {}

interface InjectedProps {
  allMaps: Dictionary<MapData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AWorldMapsSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedMapId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>Maps</div>
        <SearchableDefList
          className={styles.mapListRoot}
          selectedDefId={this.state.selectedMapId}
          allDefs={this.props.allMaps}
          onDefSelected={(selectedMapId) => {
            this.setState({ selectedMapId });
            const md = this.props.allMaps[selectedMapId];
            if (md) {
              this.setState({
                selectedMapId,
                isSaving: this.state.isSaving,
                name: md.name,
                min_x: md.min_x,
                max_x: md.max_x,
                min_y: md.min_y,
                max_y: md.max_y,
              });
            }
          }}
        />
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderSizeSection()}
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
          value={this.state.selectedMapId === -1 ? "NEW" : `${this.state.selectedMapId}`}
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

  private renderSizeSection(): React.ReactNode {
    return (
      <>
        <div className={styles.row}>
          <div className={styles.firstLabel}>Min X</div>
          <input
            className={styles.sizeField}
            type={"number"}
            value={this.state.min_x}
            onChange={(e) => {
              this.setState({ min_x: +e.target.value });
            }}
            tabIndex={this.nextTabIndex++}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>Max X</div>
          <input
            className={styles.sizeField}
            type={"number"}
            value={this.state.max_x}
            onChange={(e) => {
              this.setState({ max_x: +e.target.value });
            }}
            tabIndex={this.nextTabIndex++}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>Min Y</div>
          <input
            className={styles.sizeField}
            type={"number"}
            value={this.state.min_y}
            onChange={(e) => {
              this.setState({ min_y: +e.target.value });
            }}
            tabIndex={this.nextTabIndex++}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>Max Y</div>
          <input
            className={styles.sizeField}
            type={"number"}
            value={this.state.max_y}
            onChange={(e) => {
              this.setState({ max_y: +e.target.value });
            }}
            tabIndex={this.nextTabIndex++}
          />
        </div>
      </>
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

    const data: MapData = {
      // If this is a new map, the selectedMapId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedMapId,
      name: this.state.name,
      min_x: this.state.min_x,
      max_x: this.state.max_x,
      min_y: this.state.min_y,
      max_y: this.state.max_y,
    };

    if (this.state.selectedMapId === -1) {
      // Brand new map.
      const res = await ServerAPI.createMap(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateMap(data));

        // Select the spell in the list.
        this.setState({ selectedMapId: data.id });
      }
    } else {
      // Editing old spellDef.
      const res = await ServerAPI.editMap(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditMapFailure",
            content: { title: "Error!", message: "Changes were not saved.  Please try again." },
          })
        );
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateMap(data));
      }
    }

    this.setState({ isSaving: false });
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedMapId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteMap",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedMapId}?  This cannot be undone.`,
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
                const res = await ServerAPI.deleteMap(this.state.selectedMapId);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and delete locally.
                  this.props.dispatch?.(deleteMap(this.state.selectedMapId));
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
  const allMaps = state.maps.maps;
  return {
    ...props,
    allMaps,
  };
}

export const WorldMapsSubPanel = connect(mapStateToProps)(AWorldMapsSubPanel);
