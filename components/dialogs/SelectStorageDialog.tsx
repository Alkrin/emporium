import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectStorageDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { CharacterData, StorageData } from "../../serverAPI";
import TooltipSource from "../TooltipSource";
import { StorageTooltip } from "../tooltips/StorageTooltip";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { UserRole } from "../../redux/userSlice";
import { getPersonalPile } from "../../lib/characterUtils";

interface State {
  selectedStorageId: number;
}

interface ReactProps {
  preselectedStorageId: number;
  onSelectionConfirmed: (storageId: number) => Promise<void>;
  focusedCharacterId?: number;
  focusedLocationId?: number;
}

interface InjectedProps {
  allStorages: Dictionary<StorageData>;
  activeRole: UserRole;
  characters: Dictionary<CharacterData>;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectStorageDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStorageId: props.preselectedStorageId,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Storage"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderStorageRow(
                {
                  id: 0,
                  name: "---",
                  capacity: 0,
                  location_id: 0,
                  owner_id: 0,
                  money: 0,
                },
                -1
              )}
              {this.getSortedStorages().map(this.renderStorageRow.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          Confirm Selection
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Cancel
        </div>
      </div>
    );
  }

  private renderStorageRow(storage: StorageData, index: number): React.ReactNode {
    const selectedClass = storage.id === this.state.selectedStorageId ? styles.selected : "";
    const ownedClass = storage.owner_id === this.props.focusedCharacterId ? styles.owned : "";
    const deadClass = this.props.characters[storage.owner_id]?.dead ? styles.dead : "";
    return (
      <TooltipSource
        className={`${styles.listRow} ${selectedClass} ${ownedClass} ${deadClass}`}
        key={`storageRow${index}`}
        tooltipParams={{
          id: `Storage${storage.id}`,
          content: () => {
            return storage.id === 0 ? null : <StorageTooltip data={storage} />;
          },
        }}
        onClick={() => {
          this.setState({ selectedStorageId: storage.id });
        }}
      >
        <div className={styles.listName}>{getStorageDisplayName(storage.id)}</div>
      </TooltipSource>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedStorageId);
    this.onCloseClicked();
  }

  private getSortedStorages(): StorageData[] {
    const permittedStorages = Object.values(this.props.allStorages).filter((storage) => {
      return (
        this.props.activeRole !== "player" ||
        // Storages are owned by characters, not players, so we have to chain back through the owner to find the user.
        this.props.characters[storage.owner_id].user_id === this.props.currentUserId
      );
    });

    const personalPileId = getPersonalPile(this.props.focusedCharacterId ?? 0)?.id ?? 0;
    permittedStorages.sort((storageA, storageB) => {
      // The focused character's Personal Pile is always first.
      if (storageA.id === personalPileId) {
        return -1;
      } else if (storageB.id === personalPileId) {
        return 1;
      }

      // Then the other storages owned by that character.
      const aOwned = storageA.owner_id === this.props.focusedCharacterId;
      const bOwned = storageB.owner_id === this.props.focusedCharacterId;
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

      // Storages in the focused location before those elsewhere.
      const aHere = storageA.location_id === this.props.focusedCharacterId;
      const bHere = storageB.location_id === this.props.focusedCharacterId;
      if (aHere !== bHere) {
        if (aHere) {
          return -1;
        } else {
          return 1;
        }
      }

      // And an alphy sort when the others don't apply.
      const nameA = getStorageDisplayName(storageA.id);
      const nameB = getStorageDisplayName(storageB.id);

      return nameA.localeCompare(nameB);
    });

    return permittedStorages;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allStorages } = state.storages;
  const { activeRole } = state.hud;
  const { characters } = state.characters;
  const currentUserId = state.user.currentUser.id;

  return {
    ...props,
    allStorages,
    activeRole,
    characters,
    currentUserId,
  };
}

export const SelectStorageDialog = connect(mapStateToProps)(ASelectStorageDialog);
