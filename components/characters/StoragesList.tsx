import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { UserRole } from "../../redux/userSlice";
import { CharacterData, ItemData, ItemDefData, StorageData } from "../../serverAPI";
import styles from "./StoragesList.module.scss";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAny,
  FilterValues,
  isFilterMetLocation,
  isFilterMetOwner,
} from "../FilterDropdowns";
import { EditButton } from "../EditButton";
import { getPersonalPile } from "../../lib/characterUtils";
import { setActiveStorageId } from "../../redux/storageSlice";
import { showModal } from "../../redux/modalsSlice";
import { CreateStorageDialog } from "./dialogs/CreateStorageDialog";
import DropTarget from "../DropTarget";
import { DropTypeItem } from "./dialogs/EditStoragesSubPanel";
import { getStorageDisplayName } from "../../lib/storageUtils";

interface State {
  filters: FilterValues;
}

interface ReactProps {
  handleItemDropped: (dropTargetIds: string[], item: ItemData, def: ItemDefData) => void;
}

interface InjectedProps {
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  activeCharacterId: number;
  allStorages: Dictionary<StorageData>;
  activeStorageId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AStoragesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        [FilterType.Owner]: this.props.currentUserId.toString(),
        [FilterType.Location]: FilterValueAny,
      },
    };
  }

  render(): React.ReactNode {
    const storages = this.sortPermittedStorages();

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.newStorageButton} onClick={this.onCreateNewClicked.bind(this)}>
            Add New Storage
          </div>
          Filters
          <div className={styles.filtersContainer}>
            <FilterDropdowns
              filterOrder={[[FilterType.Owner], [FilterType.Location]]}
              filterValues={this.state.filters}
              onFilterChanged={(filters) => {
                this.setState({ filters });
              }}
            />
          </div>
        </div>
        <div className={styles.listContainer}>
          {storages.map((storage, index) => {
            return this.renderStorageRow(storage, index);
          })}
        </div>
      </div>
    );
  }

  private renderStorageRow(storage: StorageData, index: number): React.ReactNode {
    const selectedClass = storage.id === this.props.activeStorageId ? styles.selected : "";
    const ownedClass = storage.owner_id === this.props.activeCharacterId ? styles.owned : "";
    const deadClass = this.props.characters[storage.owner_id].dead ? styles.dead : "";

    const name = getStorageDisplayName(storage.id);

    const draggableId = `Storage${storage.id}`;

    return (
      <DropTarget
        dropId={draggableId}
        dropTypes={[DropTypeItem]}
        className={`${styles.listRow} ${selectedClass} ${ownedClass} ${deadClass}`}
        key={`storageRow${index}`}
        onClick={this.onStorageRowClick.bind(this, storage.id)}
      >
        <div className={styles.listName}>{name}</div>
        <EditButton className={styles.editButton} onClick={this.onStorageEditClick.bind(this, storage.id)} />
      </DropTarget>
    );
  }

  private onStorageRowClick(storageId: number): void {
    if (this.props.activeStorageId !== storageId) {
      this.props.dispatch?.(setActiveStorageId(storageId));
    }
  }

  private onStorageEditClick(storageId: number): void {
    // Editing also selects the storage.
    this.onStorageRowClick(storageId);
    // Open the storageCreator in edit mode.
    this.props.dispatch?.(
      showModal({
        id: "EditStorage",
        content: () => {
          return <CreateStorageDialog isEditMode />;
        },
        escapable: true,
      })
    );
  }

  private sortPermittedStorages(): StorageData[] {
    const permittedStorages = Object.values(this.props.allStorages).filter((storage) => {
      return (
        this.props.activeRole !== "player" ||
        // Storages are owned by characters, not players, so we have to chain back through the owner to find the user.
        this.props.characters[storage.owner_id].user_id === this.props.currentUserId
      );
    });

    const filteredStorages = permittedStorages.filter((storage) => {
      // Apply Owner filter.
      if (!isFilterMetOwner(this.state.filters, this.props.characters[storage.owner_id].user_id)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, storage.location_id)) {
        return false;
      }

      return true;
    });

    const personalPileId = getPersonalPile(this.props.activeCharacterId)?.id ?? 0;
    filteredStorages.sort((storageA, storageB) => {
      // The selected character's Personal Pile is always first.
      if (storageA.id === personalPileId) {
        return -1;
      } else if (storageB.id === personalPileId) {
        return 1;
      }

      // Then the other storages owned by that character.
      const aOwned = storageA.owner_id === this.props.activeCharacterId;
      const bOwned = storageB.owner_id === this.props.activeCharacterId;
      if (aOwned !== bOwned) {
        if (aOwned) {
          return -1;
        } else {
          return 1;
        }
      }

      // Dead characters' storages go last.
      const aDead = this.props.characters[storageA.owner_id].dead;
      const bDead = this.props.characters[storageB.owner_id].dead;
      if (aDead !== bDead) {
        if (aDead) {
          return 1;
        } else {
          return -1;
        }
      }

      // And an alphy sort when the others don't apply.
      const nameA = getStorageDisplayName(storageA.id);
      const nameB = getStorageDisplayName(storageB.id);

      return nameA.localeCompare(nameB);
    });

    return filteredStorages;
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "CreateNewStorage",
        content: () => {
          return <CreateStorageDialog />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { activeCharacterId } = state.characters;
  const { allStorages, activeStorageId } = state.storages;

  return {
    ...props,
    characters: state.characters.characters,
    activeRole,
    currentUserId: state.user.currentUser.id,
    activeCharacterId,
    allStorages,
    activeStorageId,
  };
}

export const StoragesList = connect(mapStateToProps)(AStoragesList);
