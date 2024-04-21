import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  StructureData,
  LocationData,
  StructureComponentData,
  StructureComponentDefData,
} from "../../serverAPI";
import styles from "./CreateStructureSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { deleteArmy, setActiveArmyId } from "../../redux/armiesSlice";
import { refetchArmies } from "../../dataSources/ArmiesDataSource";
import { Dictionary } from "../../lib/dictionary";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { refetchStructures } from "../../dataSources/StructuresDataSource";
import { deleteStructure, setActiveStructureId } from "../../redux/structuresSlice";

interface State {
  structure: StructureData;
  isSaving: boolean;
}

interface ReactProps {
  isEditMode?: boolean;
}

interface InjectedProps {
  currentUserId: number;
  currentStructureId: number;
  selectedStructure?: StructureData;
  selectedComponents: StructureComponentData[];
  locations: Dictionary<LocationData>;
  componentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateStructureSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.isEditMode) {
      if (props.selectedStructure) {
        this.state = {
          structure: { ...props.selectedStructure },
          isSaving: false,
        };
      }
    } else {
      // Start with blank army data.
      this.state = {
        structure: {
          id: 0,
          name: "",
          description: "",
          location_id: 0,
          owner_id: props.currentUserId,
          maintenance_date: "",
        },
        isSaving: false,
      };
    }
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>
          {this.props.isEditMode
            ? `Editing Structure #${this.props.selectedStructure?.id} (${this.props.selectedStructure?.name})`
            : "Create New Structure"}
        </div>
        <div className={styles.contentRow}>
          <div className={styles.nameLabel}>Name</div>
          <input
            className={styles.nameTextField}
            type={"text"}
            value={this.state.structure.name}
            onChange={(e) => {
              this.setState({ structure: { ...this.state.structure, name: e.target.value } });
            }}
            tabIndex={nextTabIndex++}
            spellCheck={false}
            autoFocus={true}
          />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.descriptionLabel}>Description</div>
          <textarea
            className={styles.descriptionTextField}
            value={this.state.structure.description}
            onChange={(e) => {
              this.setState({ structure: { ...this.state.structure, description: e.target.value } });
            }}
            tabIndex={nextTabIndex++}
            spellCheck={false}
          />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.locationLabel}>Location</div>
          <input
            className={styles.locationTextField}
            type={"text"}
            value={this.getLocationName()}
            tabIndex={nextTabIndex++}
            spellCheck={false}
            disabled={true}
          />
          <EditButton className={styles.editButton} onClick={this.onEditLocationClicked.bind(this)} />
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
            {this.props.isEditMode ? "Save Changes" : "Save Structure"}
          </div>

          {this.props.isEditMode && (
            <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
              Delete
            </div>
          )}
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

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        widthVmin: 61,
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.state.structure.location_id}
              onSelectionConfirmed={async (locationId) => {
                this.setState({
                  ...this.state,
                  structure: {
                    ...this.state.structure,
                    location_id: locationId,
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private getLocationName(): string {
    const location = this.props.locations[this.state.structure.location_id];

    if (location) {
      return location.name;
    } else {
      return "Please Select A Location";
    }
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid name?
    if (this.state.structure.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: {
            title: "Error!",
            message: "Please enter a Name for this structure!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid location?
    if (!this.props.locations[this.state.structure.location_id]) {
      this.props.dispatch?.(
        showModal({
          id: "NoLocationError",
          content: {
            title: "Error!",
            message: "Please enter a Location for this structure!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    if (this.props.isEditMode) {
      // Edit the army.
      const res = await ServerAPI.editStructure(this.state.structure);
    } else {
      // Send it to the server!
      const res = await ServerAPI.createStructure(this.state.structure);
      if ("error" in res) {
        console.log("Failed to create structure.");
      } else {
        // First output is the insert query.  Select that army.
        if ("insertId" in res) {
          const iid = res.insertId;
          requestAnimationFrame(() => {
            this.props.dispatch?.(setActiveArmyId(iid));
          });
        }
      }
    }

    // Refetch structures.
    if (this.props.dispatch) {
      await refetchStructures(this.props.dispatch);
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Confirmation dialog.
    this.props.dispatch?.(
      showModal({
        id: "DeleteStructureConfirmation",
        content: {
          title: "Delete Structure",
          message: `Are you sure you wish to delete ${this.props.selectedStructure?.name}?  This will also destroy associated structure component records.  Deletion cannot be undone.`,
          buttonText: "Delete",
          onButtonClick: async () => {
            // Guaranteed true, but have to check to make intellisense shut up.
            if (this.props.selectedStructure) {
              const res = await ServerAPI.deleteStructure(this.props.currentStructureId);

              // Get rid of the confirmation modal.
              this.props.dispatch?.(hideModal());
              if ("error" in res) {
                // Error modal.
                this.props.dispatch?.(
                  showModal({
                    id: "DeleteStructureError",
                    content: { title: "Error", message: "An Error occurred during structure deletion." },
                  })
                );
              } else {
                // Close the subPanel.
                this.props.dispatch?.(hideSubPanel());
                // Delay so the subpanel is fully gone before we clear out the local structure data.
                setTimeout(() => {
                  // Guaranteed true, but have to check to make intellisense shut up.
                  if (this.props.selectedStructure) {
                    // Deselect the structure.
                    this.props.dispatch?.(setActiveStructureId(0));

                    // The structure itself.
                    this.props.dispatch?.(deleteStructure(this.props.currentStructureId));
                  }
                }, 300);
              }
              this.setState({ isSaving: false });
            }
          },
          extraButtons: [
            {
              text: "Cancel",
              onClick: () => {
                this.props.dispatch?.(hideModal());
                this.setState({ isSaving: false });
              },
            },
          ],
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const selectedStructure = state.structures.structures[state.structures.activeStructureId];
  const selectedComponents = state.structures.componentsByStructure[state.structures.activeStructureId] ?? [];
  const { locations } = state.locations;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    currentStructureId: state.structures.activeStructureId,
    selectedStructure,
    selectedComponents,
    locations,
    componentDefs: state.gameDefs.structureComponents,
  };
}

export const CreateStructureSubPanel = connect(mapStateToProps)(ACreateStructureSubPanel);
