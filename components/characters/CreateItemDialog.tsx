import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { Dictionary } from "../../lib/dictionary";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showToaster } from "../../redux/toastersSlice";
import ServerAPI, { CharacterData, ItemData, ItemDefData, StorageData } from "../../serverAPI";
import { ItemTooltip } from "../database/ItemTooltip";
import { SearchableDefList } from "../database/SearchableDefList";
import styles from "./CreateItemDialog.module.scss";

interface State {
  isSaving: boolean;
  selectedItemId: number;
  numToCreate: number;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateItemDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      selectedItemId: -1,
      numToCreate: 1,
    };
  }

  render(): React.ReactNode {
    const canCreateClass = this.state.selectedItemId > 0 && !this.state.isSaving ? "" : styles.disabled;
    const canEditCount = this.state.selectedItemId > 0 && this.props.allItemDefs[this.state.selectedItemId]?.bundleable;
    return (
      <div className={styles.root}>
        <SearchableDefList
          className={styles.itemListRoot}
          selectedDefId={this.state.selectedItemId}
          onDefSelected={(selectedItemId) => {
            this.setState({ selectedItemId, numToCreate: 1 });
          }}
          renderTooltip={(def) => {
            return <ItemTooltip itemDefId={def.id} />;
          }}
        />
        <div className={styles.countRow}>
          <div className={styles.countLabel}>Num to Create</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.numToCreate}
            min={1}
            onChange={(e) => {
              this.setState({ numToCreate: +e.target.value });
            }}
            disabled={!canEditCount}
          />
        </div>
        <div className={styles.asteriskRow}>Created Items will be added to the Personal Pile.</div>
        <div className={`${styles.createButton} ${canCreateClass}`} onClick={this.onCreateClicked.bind(this)}>
          Create
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
      </div>
    );
  }

  private async onCreateClicked(): Promise<void> {
    this.setState({ isSaving: true });

    const personalPileName = `Personal Pile ${this.props.character.id}`;
    const personalPile = Object.values(this.props.allStorages).find((storage) => {
      return storage.name === personalPileName;
    });

    if (personalPile) {
      // Create the item.  Add it to the personal pile.  Show a toaster.
      const newItem: ItemData = {
        id: 0,
        def_id: this.state.selectedItemId,
        count: this.state.numToCreate,
        container_id: 0,
        storage_id: personalPile.id,
      };

      let toasterTitle: string = "";
      let toasterMessage: string = `${this.props.allItemDefs[this.state.selectedItemId]?.name ?? "Item"} created!`;

      const result = await ServerAPI.createItem(newItem);
      if ("error" in result) {
        toasterTitle = "ERROR!";
        toasterMessage = "Item creation failed!";
      } else {
        // Item was successfully created, so refetch!
        if (this.props.dispatch) {
          await refetchItems(this.props.dispatch);
        }
      }

      this.props.dispatch?.(showToaster({ content: { title: toasterTitle, message: toasterMessage } }));
    }

    this.setState({ isSaving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  const allItemDefs = state.gameDefs.items;
  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
  };
}

export const CreateItemDialog = connect(mapStateToProps)(ACreateItemDialog);
