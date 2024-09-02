import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showToaster } from "../../redux/toastersSlice";
import ServerAPI, { CharacterData, LocationData, StorageData } from "../../serverAPI";
import styles from "./CreateStorageDialog.module.scss";
import { deleteStorage, setActiveStorageId, updateStorage } from "../../redux/storageSlice";
import { Dictionary } from "../../lib/dictionary";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { getPersonalPile } from "../../lib/characterUtils";
import { deleteSpellbook } from "../../redux/spellbooksSlice";
import { deleteItem } from "../../redux/itemsSlice";
import { getAllStorageAssociatedItemIds } from "../../lib/storageUtils";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  isSaving: boolean;
  name: string;
  capacityString: string;
  locationId: number;
  moneyString: string;
}

interface ReactProps {
  isEditMode?: boolean;
}

interface InjectedProps {
  allStorages: Dictionary<StorageData>;
  activeStorageId: number;
  character: CharacterData;
  characters: Dictionary<CharacterData>;
  locations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateStorageDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.isEditMode) {
      const storage = props.allStorages[props.activeStorageId];
      const name = storage.name.includes("Personal Pile")
        ? `${this.props.characters[storage.owner_id].name}'s Personal Pile`
        : storage.name;
      this.state = {
        isSaving: false,
        name,
        locationId: storage.location_id,
        capacityString: storage.capacity.toFixed(0),
        moneyString: storage.money.toFixed(2),
      };
    } else {
      this.state = {
        isSaving: false,
        name: "",
        locationId: 0,
        capacityString: "999999999",
        moneyString: "0.00",
      };
    }
  }

  render(): React.ReactNode {
    const isPersonalPile = this.state.name.includes("Personal Pile");
    const location = this.props.locations[this.state.locationId];

    return (
      <div className={styles.root}>
        <div className={styles.title}>{this.props.isEditMode ? "Edit Storage" : "Create Storage"}</div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldName}>{"Owner"}</div>
          <input
            className={styles.fieldInput}
            type={"text"}
            disabled={true}
            value={
              this.props.isEditMode
                ? this.props.characters[this.props.allStorages[this.props.activeStorageId].owner_id].name
                : this.props.character.name
            }
          />
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldName}>{"Name"}</div>
          <input
            className={styles.fieldInput}
            type={"text"}
            disabled={isPersonalPile} // Can't rename a Personal Pile.
            value={this.state.name}
            onChange={(e) => {
              let newName: string = e.target.value;
              if (newName.includes("Personal Pile")) {
                this.props.dispatch?.(
                  showToaster({
                    content: { title: "Error!", message: "Custom storages cannot be named Personal Pile!" },
                  })
                );
                newName = newName.replace("Personal Pile", "");
              }
              this.setState({ name: newName });
            }}
          />
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldName}>{"Capacity"}</div>
          <input
            className={styles.fieldInput}
            type={"number"}
            value={this.state.capacityString}
            onChange={(e) => {
              this.setState({ capacityString: e.target.value });
            }}
          />
          <div className={styles.fieldSuffix}>{"\xa0Stone"}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldName}>{"Money"}</div>
          <input
            className={styles.fieldInput}
            type={"number"}
            value={this.state.moneyString}
            onChange={(e) => {
              this.setState({ moneyString: e.target.value });
            }}
          />
          <div className={styles.fieldSuffix}>{"\xa0GP"}</div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldName}>{`Location`}</div>
          <input className={styles.fieldInput} type={"text"} value={location?.name ?? "---"} disabled={true} />
          {!isPersonalPile && (
            <EditButton className={styles.editButton} onClick={this.onEditLocationClicked.bind(this)} />
          )}
        </div>

        <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
          {this.props.isEditMode ? "Save Changes" : "Create"}
        </div>

        {this.props.isEditMode && (
          <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
        )}

        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
      </div>
    );
  }

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.state.locationId ? this.state.locationId : this.props.character.location_id}
              onSelectionConfirmed={async (locationId) => {
                this.setState({ locationId });
              }}
            />
          );
        },
      })
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    if (this.props.isEditMode) {
      const storage = this.props.allStorages[this.props.activeStorageId];
      const updatedStorage = {
        ...storage,
        name: this.state.name,
        capacity: +this.state.capacityString,
        money: +this.state.moneyString,
        location_id: this.state.locationId,
        owner_id: this.props.character.id,
      };
      const result = await ServerAPI.editStorage(updatedStorage);
      if ("error" in result) {
        this.props.dispatch?.(showToaster({ content: { title: "ERROR!", message: "Storage update failed!" } }));
      } else {
        // Storage was successfully updated, so push it to redux.
        this.props.dispatch?.(updateStorage(updatedStorage));
        // And close.
        this.props.dispatch?.(hideModal());
      }
    } else {
      // Create the storage.
      const newStorage: StorageData = {
        id: 0,
        name: this.state.name,
        capacity: +this.state.capacityString,
        money: +this.state.moneyString,
        location_id: this.state.locationId,
        owner_id: this.props.character.id,
      };

      const result = await ServerAPI.createStorage(newStorage);
      if ("error" in result) {
        this.props.dispatch?.(showToaster({ content: { title: "ERROR!", message: "Storage creation failed!" } }));
      } else {
        // Storage was successfully created, so push it to redux.
        newStorage.id = result.insertId;
        this.props.dispatch?.(updateStorage(newStorage));
        // And close.
        this.props.dispatch?.(hideModal());
      }
    }

    this.setState({ isSaving: false });
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    // Confirmation dialog.
    this.props.dispatch?.(
      showModal({
        id: "DeleteStorageConfirmation",
        content: () => {
          return (
            <BasicDialog
              title={"Delete Storage"}
              prompt={`Are you sure you wish to delete ${this.state.name}?  This will also destroy all contained items and money.  Deletion cannot be undone.`}
              buttons={[
                {
                  text: "Delete",
                  onClick: async () => {
                    const containedItemIds = getAllStorageAssociatedItemIds(this.props.activeStorageId);
                    const res = await ServerAPI.deleteStorage(this.props.activeStorageId, containedItemIds);

                    // Get rid of the confirmation modal.
                    this.props.dispatch?.(hideModal());
                    if ("error" in res || res.find((r) => "error" in r)) {
                      // Error modal.
                      this.props.dispatch?.(
                        showModal({
                          id: "DeleteStorageError",
                          content: () => (
                            <BasicDialog title={"Error"} prompt={"An Error occurred during storage deletion."} />
                          ),
                        })
                      );
                    } else {
                      // Close the create dialog.
                      this.props.dispatch?.(hideModal());
                      // Delay so the modal is fully gone before we clear out the local data.
                      setTimeout(() => {
                        // Update all local data.
                        // Items.
                        containedItemIds.forEach((itemId) => {
                          // Spellbook data, if any.  No-op if it's not a spellbook.
                          this.props.dispatch?.(deleteSpellbook(itemId));
                          // The item itself.
                          this.props.dispatch?.(deleteItem(itemId));
                        });
                        // The storage itself.
                        this.props.dispatch?.(deleteStorage(this.props.activeStorageId));

                        // Deselect the storage (switch to selected character's personal pile, or else nothing).
                        this.props.dispatch?.(setActiveStorageId(getPersonalPile(this.props.character.id)?.id ?? 0));
                      }, 300);
                    }
                    this.setState({ isSaving: false });
                  },
                },
                {
                  text: "Cancel",
                  onClick: async () => {
                    this.props.dispatch?.(hideModal());
                    this.setState({ isSaving: false });
                  },
                },
              ]}
            />
          );
        },
      })
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { characters } = state.characters;
  const { activeStorageId, allStorages } = state.storages;
  const { locations } = state.locations;

  return {
    ...props,
    activeStorageId,
    allStorages,
    character,
    characters,
    locations,
  };
}

export const CreateStorageDialog = connect(mapStateToProps)(ACreateStorageDialog);
