import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { ArmyData, LocationData, TroopData } from "../../serverAPI";
import styles from "./CreateArmySubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { deleteArmy, setActiveArmyId } from "../../redux/armiesSlice";
import { refetchArmies } from "../../dataSources/ArmiesDataSource";
import { Dictionary } from "../../lib/dictionary";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";

interface State {
  army: ArmyData;
  isSaving: boolean;
}

interface ReactProps {
  isEditMode?: boolean;
}

interface InjectedProps {
  currentUserId: number;
  currentArmyId: number;
  selectedArmy?: ArmyData;
  selectedTroops: TroopData[];
  locations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateArmySubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.isEditMode) {
      if (props.selectedArmy) {
        this.state = {
          army: { ...props.selectedArmy },
          isSaving: false,
        };
      }
    } else {
      // Start with blank army data.
      this.state = {
        army: {
          id: 0,
          name: "",
          location_id: 0,
          user_id: props.currentUserId,
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
            ? `Editing Army #${this.props.selectedArmy?.id} (${this.props.selectedArmy?.name})`
            : "Create New Army"}
        </div>
        <div className={styles.contentRow}>
          <div className={styles.nameLabel}>Name</div>
          <input
            className={styles.nameTextField}
            type={"text"}
            value={this.state.army.name}
            onChange={(e) => {
              // Vertical bar is forbidden because it is used by ActivityOutcomeData_MergeArmies.
              this.setState({ army: { ...this.state.army, name: e.target.value.replace("|", "") } });
            }}
            tabIndex={nextTabIndex++}
            spellCheck={false}
            autoFocus={true}
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
            {this.props.isEditMode ? "Save Changes" : "Save Army"}
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
              preselectedLocationId={this.state.army.location_id}
              onSelectionConfirmed={async (locationId) => {
                this.setState({
                  ...this.state,
                  army: {
                    ...this.state.army,
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
    const location = this.props.locations[this.state.army.location_id];

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
    if (this.state.army.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: {
            title: "Error!",
            message: "Please enter a Name for this army!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid location?
    if (!this.props.locations[this.state.army.location_id]) {
      this.props.dispatch?.(
        showModal({
          id: "NoLocationError",
          content: {
            title: "Error!",
            message: "Please enter a Location for this army!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    if (this.props.isEditMode) {
      // Edit the army.
      const res = await ServerAPI.editArmy(this.state.army);
    } else {
      // Send it to the server!
      const res = await ServerAPI.createArmy(this.state.army);
      if ("error" in res) {
        console.log("Failed to create army.");
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

    // Refetch armies.
    if (this.props.dispatch) {
      await refetchArmies(this.props.dispatch);
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
        id: "DeleteArmyConfirmation",
        content: {
          title: "Delete Army",
          message: `Are you sure you wish to delete ${this.props.selectedArmy?.name}?  This will also destroy associated troop records.  Deletion cannot be undone.`,
          buttonText: "Delete",
          onButtonClick: async () => {
            // Guaranteed true, but have to check to make intellisense shut up.
            if (this.props.selectedArmy) {
              const res = await ServerAPI.deleteArmy(
                this.props.currentArmyId,
                this.props.selectedTroops.map((t) => {
                  return t.id;
                })
              );

              // Get rid of the confirmation modal.
              this.props.dispatch?.(hideModal());
              if ("error" in res) {
                // Error modal.
                this.props.dispatch?.(
                  showModal({
                    id: "DeleteArmyError",
                    content: { title: "Error", message: "An Error occurred during army deletion." },
                  })
                );
              } else {
                // Close the subPanel.
                this.props.dispatch?.(hideSubPanel());
                // Delay so the subpanel is fully gone before we clear out the local character data.
                setTimeout(() => {
                  // Guaranteed true, but have to check to make intellisense shut up.
                  if (this.props.selectedArmy) {
                    // Deselect the army.
                    this.props.dispatch?.(setActiveArmyId(0));

                    // The character itself.
                    this.props.dispatch?.(deleteArmy(this.props.currentArmyId));
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
  const selectedArmy = state.armies.armies[state.armies.activeArmyId];
  const selectedTroops = state.armies.troopsByArmy[state.armies.activeArmyId] ?? [];
  const { locations } = state.locations;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    currentArmyId: state.armies.activeArmyId,
    selectedArmy,
    selectedTroops,
    locations,
  };
}

export const CreateArmySubPanel = connect(mapStateToProps)(ACreateArmySubPanel);
