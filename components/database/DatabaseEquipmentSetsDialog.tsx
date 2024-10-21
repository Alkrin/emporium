import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, {
  CharacterEquipmentSlots,
  EquipmentSetData,
  EquipmentSetItemData,
  ItemDefData,
} from "../../serverAPI";
import styles from "./DatabaseEquipmentSetsDialog.module.scss";
import { SearchableDefList } from "./SearchableDefList";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { deleteEquipmentSet, updateEquipmentSet, updateItemsForEquipmentSet } from "../../redux/gameDefsSlice";
import { AllClassesArray } from "../../staticData/characterClasses/AllClasses";
import { getEquippableItemsForSlot } from "../../lib/characterUtils";
import { EquipmentSetInventoriesList } from "./EquipmentSetInventoriesList";
import { SavingVeil } from "../SavingVeil";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  selectedSetId: number;
  isSaving: boolean;
  name: string;
  class_name: string;
  items: EquipmentSetItemData[];
}

const defaultState: State = {
  selectedSetId: 0,
  isSaving: false,
  name: "",
  class_name: "---",
  items: [],
};

interface ReactProps {}

interface InjectedProps {
  allEquipmentSets: Dictionary<EquipmentSetData>;
  allEquipmentSetItems: Dictionary<EquipmentSetItemData[]>;
  allItemDefs: Dictionary<ItemDefData>;

  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEquipmentSetsDialog extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedSetId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>{"EquipmentSet Database"}</div>
        <SearchableDefList
          className={styles.setListRoot}
          selectedDefId={this.state.selectedSetId}
          allDefs={this.props.allEquipmentSets}
          onDefSelected={(selectedSetId) => {
            this.setState({ selectedSetId: selectedSetId });
            const sdd = this.props.allEquipmentSets[selectedSetId];
            if (sdd) {
              this.setState({
                selectedSetId: selectedSetId,
                isSaving: this.state.isSaving,
                ...this.props.allEquipmentSets[selectedSetId],
                items: this.props.allEquipmentSetItems[selectedSetId] ?? [],
              });
            }
          }}
        />
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderClassSection()}
          {this.renderEquipmentSection()}
        </div>
        <div className={styles.containersPanelRoot}>
          <EquipmentSetInventoriesList
            items={this.state.items}
            className={styles.inventoryList}
            createItem={this.createItem.bind(this)}
            deleteItem={this.deleteItem.bind(this)}
          />
        </div>
        <div className={styles.createNewButton} onClick={this.onCreateNewClicked.bind(this)}>
          {"Create New"}
        </div>
        <div className={`${styles.deleteButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
          {"Delete"}
        </div>
        <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
          {"Save"}
        </div>
        <SavingVeil show={this.state.isSaving} />
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
          value={this.state.selectedSetId === -1 ? "NEW" : `${this.state.selectedSetId}`}
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

  private renderClassSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Class</div>
        <select
          className={styles.classSelector}
          value={this.state.class_name}
          onChange={(e) => {
            this.setState({
              class_name: e.target.value,
            });
          }}
          tabIndex={this.nextTabIndex++}
        >
          <option value={"---"}>---</option>
          {AllClassesArray.map(({ name }) => {
            return (
              <option value={name} key={`class${name}`}>
                {name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  private renderEquipmentSection(): React.ReactNode {
    return (
      <>
        {CharacterEquipmentSlots.map((slotName) => {
          const slotDisplayName = slotName.charAt(5).toUpperCase() + slotName.slice(6);
          const isDisabled = this.state.class_name === "---";
          const equippableItems = getEquippableItemsForSlot(this.state.class_name, slotName);
          return (
            <div className={styles.row} key={slotName}>
              <div className={styles.firstLabel}>{slotDisplayName}</div>
              <select
                disabled={isDisabled}
                className={styles.itemSelector}
                value={
                  // Either the itemDef id equipped here, or a zero for no item equipped.
                  this.state.items.find((item) => {
                    return item.slot_name === slotName;
                  })?.def_id ?? 0
                }
                onChange={(e) => {
                  const oldItem = this.state.items.find((item) => {
                    return item.slot_name === slotName;
                  });
                  // If an item is selected, make an entry for it.
                  if (+e.target.value > 0) {
                    const items = [...this.state.items];
                    items.push({
                      set_id: this.state.selectedSetId,
                      def_id: +e.target.value,
                      item_id: this.getNextItemIdForItemSet(items),
                      slot_name: slotName,
                    });
                    this.setState({ items });
                    if (oldItem) {
                      this.deleteItem(oldItem.item_id);
                    }
                  } else {
                    // Delete the item and anything it contains.
                    this.deleteItem(oldItem?.item_id ?? 0);
                  }
                }}
                tabIndex={this.nextTabIndex++}
              >
                <option value={0}>---</option>
                {equippableItems.map(({ name, id }) => {
                  return (
                    <option value={id} key={`item${id}`}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </>
    );
  }

  private createItem(containerItemId: number, itemDefId: number): void {
    const items = [...this.state.items];
    items.push({
      set_id: this.state.selectedSetId,
      def_id: itemDefId,
      item_id: this.getNextItemIdForItemSet(items),
      slot_name: `Container${containerItemId}`,
    });

    this.setState({ items });
  }

  private deleteItem(itemId: number): void {
    // One deletion per frame so the item list can update itself along the way.
    requestAnimationFrame(() => {
      if (itemId) {
        // Delete anything contained in this item.
        const containerSlotName = `Container${itemId}`;
        this.state.items
          .filter((item) => {
            return item.slot_name === containerSlotName;
          })
          .map((item) => {
            return item.item_id;
          })
          .forEach(this.deleteItem.bind(this));

        // Delete the item itself.
        const items = this.state.items.filter((item) => {
          return item.item_id !== itemId;
        });

        this.setState({ items });
      }
    });
  }

  private getNextItemIdForItemSet(items: EquipmentSetItemData[]): number {
    let nextId: number = 1;

    items.forEach((item) => {
      if (item.item_id >= nextId) {
        nextId = item.item_id + 1;
      }
    });

    return nextId;
  }

  private onCreateNewClicked(): void {
    if (this.state.isSaving) {
      return;
    }
    // Deselects any current equipment set and clears all data fields.
    this.setState(defaultState);
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid name?
    if (this.state.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please enter a Name for this Equipment Set!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid class?
    if (this.state.class_name === "---") {
      this.props.dispatch?.(
        showModal({
          id: "NoClassError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please select a Class for this Equipment Set!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    const setData: EquipmentSetData = {
      // If this is a new set, the selectedSetId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedSetId,
      name: this.state.name,
      class_name: this.state.class_name,
    };

    if (this.state.selectedSetId === -1) {
      // Brand new EquipmentSet.
      const res = await ServerAPI.createEquipmentSet(setData, this.state.items);

      if (
        "error" in res ||
        res.length === 0 ||
        !!res.find((entry) => {
          return "error" in entry;
        })
      ) {
        this.props.dispatch?.(
          showModal({
            id: "CreateEquipmentSetFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"EquipmentSet was not created.  Please try again."} />,
          })
        );
      } else if (!("error" in res)) {
        // Should be guaranteed true, but this gives us valid intellisense.
        if ("insertId" in res[0]) {
          setData.id = res[0].insertId;
        }

        // Push the set data into Redux.
        this.props.dispatch?.(updateEquipmentSet(setData));
        // Push the item data into Redux.
        this.props.dispatch?.(updateItemsForEquipmentSet({ set_id: setData.id, items: this.state.items }));

        // Select the set in the list.
        this.setState({ selectedSetId: setData.id });
      }
    } else {
      // Editing old equipment set.
      const res = await ServerAPI.editEquipmentSet(setData, this.state.items);

      if (
        "error" in res ||
        res.length === 0 ||
        !!res.find((entry) => {
          return "error" in entry;
        })
      ) {
        this.props.dispatch?.(
          showModal({
            id: "EditEquipmentSetFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Edit EquipmentSet has failed.  Please try again."} />,
          })
        );
      } else if (!("error" in res)) {
        // Push the set data into Redux.
        this.props.dispatch?.(updateEquipmentSet(setData));
        // Push the item data into Redux.
        this.props.dispatch?.(updateItemsForEquipmentSet({ set_id: setData.id, items: this.state.items }));
      }
    }

    this.setState({ isSaving: false });
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedSetId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteEquipmentSet",
        content: () => (
          <BasicDialog
            title={"Please Confirm"}
            prompt={`Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedSetId}?  This cannot be undone.`}
            buttons={[
              {
                text: "Delete",
                onClick: async () => {
                  this.setState({ isSaving: true });
                  this.props.dispatch?.(hideModal());
                  const res = await ServerAPI.deleteEquipmentSet(this.state.selectedSetId);

                  if (
                    "error" in res ||
                    res.length === 0 ||
                    !!res.find((entry) => {
                      return "error" in entry;
                    })
                  ) {
                    this.props.dispatch?.(
                      showModal({
                        id: "DeleteEquipmentSetFailure",
                        content: () => (
                          <BasicDialog title={"Error!"} prompt={"Delete EquipmentSet has failed.  Please try again."} />
                        ),
                      })
                    );
                    this.setState({ isSaving: false });
                  } else if (!("error" in res)) {
                    // Delete successful, so deselect and delete locally.
                    this.props.dispatch?.(deleteEquipmentSet(this.state.selectedSetId));
                    this.setState(defaultState);
                  }
                },
              },
              {
                text: "Cancel",
              },
            ]}
          />
        ),
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allEquipmentSets = state.gameDefs.equipmentSets;
  const allItemDefs = state.gameDefs.items;
  const allEquipmentSetItems = state.gameDefs.equipmentSetItemsBySet;
  return {
    ...props,
    allEquipmentSets,
    allItemDefs,
    allEquipmentSetItems,
  };
}

export const DatabaseEquipmentSetsDialog = connect(mapStateToProps)(ADatabaseEquipmentSetsDialog);
