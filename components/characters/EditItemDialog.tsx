import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showToaster } from "../../redux/toastersSlice";
import ServerAPI, { CharacterData, ItemData, ItemDefData, SpellDefData, StorageData } from "../../serverAPI";
import styles from "./EditItemDialog.module.scss";
import { EditButton } from "../EditButton";
import { SavingVeil } from "../SavingVeil";
import { SelectAdventurersDialog } from "../dialogs/SelectAdventurersDialog";
import { updateItem } from "../../redux/itemsSlice";
import { SelectSpellsDialog } from "../dialogs/SelectSpellsDialog";

interface State {
  isSaving: boolean;
  itemCount: number;
  notes: string;
  isForSale: boolean;
  ownerIds: number[];
  isUnused: boolean;
  spellIds: number[];
}

interface ReactProps {
  item: ItemData;
  def: ItemDefData;
}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditItemDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      itemCount: props.item.count,
      notes: props.item.notes,
      isForSale: props.item.is_for_sale,
      ownerIds: props.item.owner_ids,
      isUnused: props.item.is_unused,
      spellIds: props.item.spell_ids,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.itemName}>{this.props.def.name}</div>
        <div className={styles.itemDescription}>{this.props.def.description}</div>
        <div className={styles.notesLabel}>{"Notes"}</div>
        <textarea
          className={styles.notesField}
          value={this.state.notes}
          onChange={(e) => {
            this.setState({ notes: e.target.value });
          }}
        />
        <div className={styles.row}>
          <div className={styles.ownersLabel}>{"Associated Spells"}</div>
          <EditButton className={styles.inlineEditButton} onClick={this.onEditAssociatedSpellsClicked.bind(this)} />
        </div>
        {this.state.spellIds.length > 0 && (
          <div className={styles.associatedSpells}>
            {this.state.spellIds
              .map((sid) => {
                const def = this.props.allSpellDefs[sid];
                return def.name;
              })
              .join(", ")}
          </div>
        )}
        <div className={styles.flagRow}>
          <div className={styles.normalText}>{"Is For Sale?"}</div>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.isForSale}
            onChange={(e) => {
              this.setState({ isForSale: e.target.checked });
            }}
          />
        </div>
        <div className={styles.flagRow}>
          <div className={styles.normalText}>{"Is Unused (grants XP when sold)?"}</div>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.isUnused}
            onChange={(e) => {
              this.setState({ isUnused: e.target.checked });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.ownersLabel}>{"Owners"}</div>
          <EditButton className={styles.inlineEditButton} onClick={this.onEditOwnersClicked.bind(this)} />
        </div>
        <div className={styles.listContainer}>{this.getSortedOwners().map(this.renderOwnerRow.bind(this))}</div>

        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Item Count"}</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.itemCount}
            min={0}
            onChange={(e) => {
              this.setState({ itemCount: +e.target.value });
            }}
          />
        </div>
        <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
          {"Save"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Close"}
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private onEditAssociatedSpellsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditAssociatedSpells",
        content: () => {
          return (
            <SelectSpellsDialog
              preselectedSpellIds={this.state.spellIds}
              onSelectionConfirmed={(spellIds) => {
                this.setState({ spellIds });
              }}
            />
          );
        },
        widthVmin: 45,
      })
    );
  }

  private renderOwnerRow(owner: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`ownerRow${index}`}>
        <div className={styles.listLevel}>{`L${owner.level}`}</div>
        <div className={styles.listClass}>{owner.class_name}</div>
        <div className={styles.listName}>{owner.name}</div>
      </div>
    );
  }

  private getSortedOwners(): CharacterData[] {
    const sorted = [...this.state.ownerIds].sort((a, b) => {
      const characterA = this.props.allCharacters[a];
      const characterB = this.props.allCharacters[b];

      // Sort by level first.  Highest levels at the top.
      if (characterA.level !== characterB.level) {
        return characterB.level - characterA.level;
      }
      return characterA.name.localeCompare(characterB.name);
    });

    return sorted.map((characterID) => this.props.allCharacters[characterID]);
  }

  private onEditOwnersClicked(): void {
    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "Adventurers",
        widthVmin: 60,
        content: () => {
          return (
            <SelectAdventurersDialog
              preselectedAdventurerIDs={this.state.ownerIds}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                this.setState({ ownerIds: adventurerIDs });
              }}
            />
          );
        },
      })
    );
  }

  private async onSaveClicked(): Promise<void> {
    this.setState({ isSaving: true });

    // Create the item.  Save the changes.  Show a toaster.
    const newItem: ItemData = {
      ...this.props.item,
      count: this.state.itemCount,
      notes: this.state.notes,
      is_for_sale: this.state.isForSale,
      owner_ids: this.state.ownerIds,
      is_unused: this.state.isUnused,
      spell_ids: this.state.spellIds,
    };

    let toasterTitle: string = "";
    let toasterMessage: string = `Item updated!`;

    const result = await ServerAPI.editItem(newItem);
    if ("error" in result) {
      toasterTitle = "ERROR!";
      toasterMessage = "Item update failed!";
    } else {
      // Item was successfully updated on the server, so update locally!
      this.props.dispatch?.(updateItem(newItem));
      this.props.dispatch?.(hideModal());
    }

    this.props.dispatch?.(showToaster({ content: { title: toasterTitle, message: toasterMessage } }));

    this.setState({ isSaving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    allCharacters,
    allSpellDefs,
  };
}

export const EditItemDialog = connect(mapStateToProps)(AEditItemDialog);
