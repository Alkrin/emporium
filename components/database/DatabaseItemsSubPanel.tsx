import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteItemDef, updateItemDef } from "../../redux/gameDefsSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { ItemDefData, SpellDefData } from "../../serverAPI";
import styles from "./DatabaseItemsSubPanel.module.scss";
import { SearchableDefList } from "./SearchableDefList";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { ScrollArea } from "../ScrollArea";
import { SavingVeil } from "../SavingVeil";
import { EditButton } from "../EditButton";
import { SelectSpellsDialog } from "../dialogs/SelectSpellsDialog";

interface State {
  selectedItemId: number;
  isSaving: boolean;
  name: string;
  description: string;
  stones: number;
  sixth_stones: number;
  storage_stones: number;
  storage_sixth_stones: number;
  storage_filters: string;
  has_charges: boolean;
  number_per_stone: number;
  ac: number;
  damage_die: number;
  damage_dice: number;
  damage_die_2h: number;
  damage_dice_2h: number;
  range_increment: number;
  fixed_weight: boolean;
  magic_bonus: number;
  conditional_magic_bonus: number;
  conditional_magic_bonus_type: string;
  max_cleaves: number;
  tags: string;
  purchase_quantity: number;
  cost_gp: number;
  cost_sp: number;
  cost_cp: number;
  sale_gp: number;
  sale_sp: number;
  sale_cp: number;
  spell_ids: number[];
}

const defaultState: State = {
  selectedItemId: -1,
  isSaving: false,
  name: "",
  description: "",
  stones: 0,
  sixth_stones: 0,
  storage_stones: 0,
  storage_sixth_stones: 0,
  storage_filters: "",
  has_charges: false,
  number_per_stone: 0,
  ac: 0,
  damage_die: 0,
  damage_dice: 0,
  damage_die_2h: 0,
  damage_dice_2h: 0,
  range_increment: 0,
  fixed_weight: false,
  magic_bonus: 0,
  conditional_magic_bonus: 0,
  conditional_magic_bonus_type: "",
  max_cleaves: 99,
  tags: "",
  purchase_quantity: 1,
  cost_gp: 0,
  cost_sp: 0,
  cost_cp: 0,
  sale_gp: 0,
  sale_sp: 0,
  sale_cp: 0,
  spell_ids: [],
};

interface ReactProps {}

interface InjectedProps {
  allItemDefs: Dictionary<ItemDefData>;
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseItemsSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = this.state.selectedItemId === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>{"Item Database"}</div>
        <SearchableDefList
          className={styles.itemListRoot}
          selectedDefId={this.state.selectedItemId}
          allDefs={this.props.allItemDefs}
          onDefSelected={(selectedItemId) => {
            this.setState({ selectedItemId });
            const idd = this.props.allItemDefs[selectedItemId];
            if (idd) {
              this.setState({
                selectedItemId,
                isSaving: this.state.isSaving,
                ...this.props.allItemDefs[selectedItemId],
                storage_filters: this.props.allItemDefs[selectedItemId].storage_filters?.join(","),
                tags: this.props.allItemDefs[selectedItemId].tags?.join(","),
              });
            }
          }}
        />
        <ScrollArea className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderDescriptionSection()}
          {this.renderSizeSection()}
          {this.renderPriceSection()}
          {this.renderChargeSection()}
          {this.renderStorageSection()}
          {this.renderEquipmentSection()}
          {this.renderTagsSection()}
        </ScrollArea>
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
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderIdSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>{"ID"}</div>
        <input
          className={styles.idField}
          type={"text"}
          value={this.state.selectedItemId === -1 ? "NEW" : `${this.state.selectedItemId}`}
          readOnly={true}
        />
      </div>
    );
  }

  private renderNameSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>{"Name"}</div>
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
        <div className={styles.labelText}>{"Description"}</div>
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

  private renderChargeSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Has Charges?"}</div>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.has_charges}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ has_charges: e.target.checked });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Associated Spells\xa0"}</div>
          <EditButton onClick={this.onEditAssociatedSpellsClick.bind(this)} />
        </div>
        {this.state.spell_ids.length > 0 && (
          <div className={styles.associatedSpells}>
            {this.state.spell_ids
              .map((sid) => {
                const def = this.props.allSpellDefs[sid];
                return def.name;
              })
              .join(", ")}
          </div>
        )}
      </div>
    );
  }

  private renderSizeSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Size"}</div>
          <input
            className={styles.sizeStonesField}
            type={"number"}
            value={this.state.stones}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ stones: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"and"}</div>
          <input
            className={styles.sizeSixthStonesField}
            type={"number"}
            value={this.state.sixth_stones}
            min={0}
            max={5}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ sixth_stones: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"/ 6 stone"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"\xa0\xa0\xa0\xa0or Number per Stone"}</div>
          <input
            className={styles.numberPerStoneField}
            type={"number"}
            value={this.state.number_per_stone}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ number_per_stone: +e.target.value });
            }}
          />
        </div>
      </div>
    );
  }

  private renderPriceSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Purchase Price"}</div>
          <input
            className={styles.gpInputField}
            type={"number"}
            value={this.state.cost_gp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ cost_gp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"gp"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.cost_sp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ cost_sp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"sp"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.cost_cp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ cost_cp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"cp"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Sale Price"}</div>
          <input
            className={styles.gpInputField}
            type={"number"}
            value={this.state.sale_gp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ sale_gp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"gp"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.sale_sp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ sale_sp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"sp"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.sale_cp}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ sale_cp: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"cp"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Purchase Quantity"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.purchase_quantity}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ purchase_quantity: +e.target.value });
            }}
          />
        </div>
      </div>
    );
  }

  private renderStorageSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Storage"}</div>
          <input
            className={styles.storageStonesField}
            type={"number"}
            value={this.state.storage_stones}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ storage_stones: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"and"}</div>
          <input
            className={styles.storageSixthStonesField}
            type={"number"}
            value={this.state.storage_sixth_stones}
            min={0}
            max={5}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ storage_sixth_stones: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"/ 6 stone"}</div>
        </div>
        <div className={styles.labelText}>{"Storage Filters (comma separated)"}</div>
        <textarea
          className={styles.storageFiltersField}
          value={this.state.storage_filters}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ storage_filters: e.target.value });
          }}
        />
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Stored Items Are Weightless?"}</div>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.fixed_weight}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ fixed_weight: e.target.checked });
            }}
          />
        </div>
      </div>
    );
  }

  private renderEquipmentSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Armor Class"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.ac}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ ac: +e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"1H Attack Damage"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.damage_dice}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ damage_dice: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"d"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.damage_die}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ damage_die: +e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"2H Attack Damage"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.damage_dice_2h}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ damage_dice_2h: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"d"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.damage_die_2h}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ damage_die_2h: +e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Range Increment"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.range_increment}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ range_increment: +e.target.value });
            }}
          />
          <div className={styles.secondLabel}>{"feet"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Max Cleaves"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.max_cleaves}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ max_cleaves: +e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{`Magical Bonus +`}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.magic_bonus}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ magic_bonus: +e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Conditional Magical Bonus +"}</div>
          <input
            className={styles.smallInputField}
            type={"number"}
            value={this.state.conditional_magic_bonus}
            min={0}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ conditional_magic_bonus: +e.target.value });
            }}
          />
        </div>
        <div className={styles.column}>
          <div className={styles.firstLabel}>{"Condition (e.g. Undead, Evil, etc.)"}</div>
          <input
            className={styles.textInput}
            type={"text"}
            value={this.state.conditional_magic_bonus_type}
            tabIndex={this.nextTabIndex++}
            onChange={(e) => {
              this.setState({ conditional_magic_bonus_type: e.target.value });
            }}
          />
        </div>
      </div>
    );
  }

  private renderTagsSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>{"Tags"}</div>
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

  private onCreateNewClicked(): void {
    if (this.state.isSaving) {
      return;
    }
    // Deselects any current item and clears all data fields.
    this.setState(defaultState);
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    const data: ItemDefData = {
      // If this is a new item, the selectedItemId is -1, and will be overwritten by the DB with a real value.
      id: this.state.selectedItemId,
      name: this.state.name,
      description: this.state.description,
      stones: this.state.stones,
      sixth_stones: this.state.sixth_stones,
      storage_stones: this.state.storage_stones,
      storage_sixth_stones: this.state.storage_sixth_stones,
      storage_filters: this.state.storage_filters.split(","),
      has_charges: this.state.has_charges,
      number_per_stone: this.state.number_per_stone,
      ac: this.state.ac,
      damage_die: this.state.damage_die,
      damage_dice: this.state.damage_dice,
      damage_die_2h: this.state.damage_die_2h,
      damage_dice_2h: this.state.damage_dice_2h,
      range_increment: this.state.range_increment,
      fixed_weight: this.state.fixed_weight,
      magic_bonus: this.state.magic_bonus,
      conditional_magic_bonus: this.state.conditional_magic_bonus,
      conditional_magic_bonus_type: this.state.conditional_magic_bonus_type,
      max_cleaves: this.state.max_cleaves,
      tags: this.state.tags.split(","),
      purchase_quantity: this.state.purchase_quantity,
      cost_gp: this.state.cost_gp,
      cost_sp: this.state.cost_sp,
      cost_cp: this.state.cost_cp,
      sale_gp: this.state.sale_gp,
      sale_sp: this.state.sale_sp,
      sale_cp: this.state.sale_cp,
      spell_ids: this.state.spell_ids,
    };

    if (this.state.selectedItemId === -1) {
      // Brand new itemDef.
      const res = await ServerAPI.createItemDef(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateItemDef(data));

        // Select the item in the list.
        this.setState({ selectedItemId: data.id });
      }
    } else {
      // Editing old itemDef.
      const res = await ServerAPI.editItemDef(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditItemDefFailure",
            content: { title: "Error!", message: "Changes were not saved.  Please try again." },
          })
        );
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateItemDef(data));
      }
    }

    this.setState({ isSaving: false });
  }

  private onEditAssociatedSpellsClick(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditAssociatedSpells",
        content: () => {
          return (
            <SelectSpellsDialog
              preselectedSpellIds={this.state.spell_ids}
              onSelectionConfirmed={(spell_ids) => {
                this.setState({ spell_ids });
              }}
            />
          );
        },
        widthVmin: 45,
      })
    );
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (this.state.selectedItemId === -1) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteItemDef",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.state.selectedItemId}?  This cannot be undone.`,
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
                const res = await ServerAPI.deleteItemDef(this.state.selectedItemId);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and delete locally.
                  this.props.dispatch?.(deleteItemDef(this.state.selectedItemId));
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
  const allItemDefs = state.gameDefs.items;
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    allItemDefs,
    allSpellDefs,
  };
}

export const DatabaseItemsSubPanel = connect(mapStateToProps)(ADatabaseItemsSubPanel);
