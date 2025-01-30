import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { CharacterData, ItemData, ItemDefData, SpellDefData, StorageData } from "../../serverAPI";
import styles from "./InventoriesList.module.scss";
import Draggable from "../Draggable";
import { DraggableHandle } from "../DraggableHandle";
import TooltipSource from "../TooltipSource";
import { ItemTooltip } from "../database/tooltips/ItemTooltip";
import { DropTypeItem } from "./dialogs/EditEquipmentSubPanel";
import DropTarget from "../DropTarget";
import { getItemNameText } from "../../lib/itemUtils";
import { showModal } from "../../redux/modalsSlice";
import { SplitBundleDialog } from "./dialogs/SplitBundleDialog";
import { Tag } from "../../lib/tags";
import { SpellbookDialog } from "./dialogs/SpellbookDialog";
import { SplitButton } from "../SplitButton";
import { EditButton } from "../EditButton";
import { SpellbookButton } from "../SpellbookButton";
import { EditItemDialog } from "./dialogs/EditItemDialog";
import { SpellTooltip } from "../database/tooltips/SpellTooltip";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  containerIds: number[];
  handleItemDropped: (dropTargetIds: string[], item: ItemData, def: ItemDefData) => void;
}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
  allSpellDefs: Dictionary<SpellDefData>;
  allItems: Dictionary<ItemData>;
  currentDraggableId: string;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AInventoriesList extends React.Component<Props> {
  render(): React.ReactNode {
    const {
      className,
      containerIds,
      character,
      allStorages,
      allItemDefs,
      allSpellDefs,
      allItems,
      currentDraggableId,
      handleItemDropped,
      dispatch,
      ...otherProps
    } = this.props;

    this.props.containerIds.sort((a, b) => {
      const itemA = this.props.allItems[a];
      const itemB = this.props.allItems[b];
      const defA = this.props.allItemDefs[itemA.def_id];
      const defB = this.props.allItemDefs[itemB.def_id];

      const alphaSort = defA.name.localeCompare(defB.name);

      // If the names are different, sort by name.
      if (alphaSort) {
        return alphaSort;
      }

      // If the names are the same, sort by itemId.
      return a - b;
    });

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {this.props.containerIds.map((id) => {
          return this.renderContainerSection(id, 0);
        })}
      </div>
    );
  }

  private renderContainerSection(containerId: number, depth: number): React.ReactNode {
    const item = this.props.allItems[containerId];
    const def = this.props.allItemDefs[item?.def_id];
    if (def) {
      const containedItems = Object.values(this.props.allItems).filter((i) => {
        return i.container_id === item.id;
      });

      const draggableId = `Container${item.id}`;
      return (
        <div key={draggableId}>
          <DropTarget dropId={draggableId} dropTypes={[DropTypeItem]}>
            <Draggable className={styles.containerRowDraggable} draggableId={draggableId}>
              <DraggableHandle
                className={styles.draggableHandle}
                draggableId={draggableId}
                dropTypes={[DropTypeItem]}
                draggingRender={() => {
                  return this.renderContainerRowContents(item, def, depth);
                }}
                dropHandler={(dropTargetIds) => {
                  this.props.handleItemDropped(dropTargetIds, item, def);
                }}
              >
                {this.renderContainerRowContents(item, def, depth)}
              </DraggableHandle>
            </Draggable>
          </DropTarget>
          {containedItems.map((it) => {
            return this.renderContainedItemRow(it, depth + 1);
          })}
        </div>
      );
    } else {
      return null;
    }
  }

  private renderContainerRowContents(item: ItemData, def: ItemDefData, depth: number): React.ReactNode {
    return (
      <TooltipSource
        tooltipParams={{
          id: `container${item.id}`,
          content: () => {
            return <ItemTooltip itemId={item.id} />;
          },
        }}
        className={styles.containerRowContentWrapper}
        style={{ marginLeft: `${depth}vmin` }}
      >
        <div className={styles.containerName}>{getItemNameText(item, def)}</div>
      </TooltipSource>
    );
  }

  private renderContainedItemRow(item: ItemData, depth: number): React.ReactNode {
    const def = this.props.allItemDefs[item.def_id];
    if (def) {
      if (def.storage_stones > 0 || def.storage_sixth_stones > 0) {
        return this.renderContainerSection(item.id, depth);
      } else {
        const draggableId = `contained${item.id}`;

        return (
          <Draggable className={styles.containedItemRowDraggable} draggableId={draggableId} key={draggableId}>
            {
              // Charged items cannot be stacked because each needs to track its charges separately.
              !def.has_charges && (
                <DropTarget dropId={`Bundle${item.id}`} dropTypes={[DropTypeItem]} className={styles.fullDropTarget} />
              )
            }
            <DraggableHandle
              className={styles.draggableHandle}
              draggableId={draggableId}
              dropTypes={[DropTypeItem]}
              draggingRender={() => {
                return this.renderContainedItemRowContents(item, def, depth);
              }}
              dropHandler={(dropTargetIds) => {
                this.props.handleItemDropped(dropTargetIds, item, def);
              }}
            >
              {this.renderContainedItemRowContents(item, def, depth)}
            </DraggableHandle>
          </Draggable>
        );
      }
    } else {
      return null;
    }
  }

  private renderContainedItemRowContents(item: ItemData, def: ItemDefData, depth: number): React.ReactNode {
    const isSpellbook = def.tags.includes(Tag.Spellbook);
    return (
      <>
        <TooltipSource
          tooltipParams={{
            id: `contained${item.id}`,
            content: () => {
              return <ItemTooltip itemId={item.id} />;
            },
          }}
          className={styles.containedItemRowContentWrapper}
          style={{ marginLeft: `${depth}vmin` }}
        >
          <div className={styles.containedItemName}>{getItemNameText(item, def)}</div>
          {
            // A charged item cannot be stacked or split, only spent.
            !def.has_charges && item.count > 1 && (
              <SplitButton className={styles.editButton} onMouseDown={this.onBundleButtonClick.bind(this, item, def)} />
            )
          }
          {isSpellbook && (
            <SpellbookButton
              className={styles.editButton}
              onMouseDown={this.onSpellbookButtonClick.bind(this, item, def)}
            />
          )}
          <EditButton className={styles.editButton} onMouseDown={this.onItemEditButtonClick.bind(this, item, def)} />
        </TooltipSource>
        {[...def.spell_ids, ...item.spell_ids].map((sid, spellIndex) => {
          const spellDef = this.props.allSpellDefs[sid];
          if (spellDef) {
            return (
              <TooltipSource
                key={`spell${spellIndex}`}
                className={styles.associatedSpellRow}
                tooltipParams={{
                  id: `${spellDef.id} ${spellIndex}`,
                  content: () => {
                    return <SpellTooltip spellId={sid} />;
                  },
                }}
                style={{ marginLeft: `${depth + 1}vmin` }}
              >
                {spellDef.name}
              </TooltipSource>
            );
          } else {
            return null;
          }
        })}
      </>
    );
  }

  private onBundleButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "splitBundleDialog",
        content: () => {
          return <SplitBundleDialog item={item} def={def} />;
        },
        escapable: true,
      })
    );
  }

  private onSpellbookButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "spellbookDialog",
        content: () => {
          return <SpellbookDialog item={item} def={def} />;
        },
        escapable: true,
      })
    );
  }

  private onItemEditButtonClick(item: ItemData, def: ItemDefData, e: React.MouseEvent): void {
    // We are inside a DraggableHandle, so we are consuming the event here to prevent a drag.
    e.stopPropagation();

    this.props.dispatch?.(
      showModal({
        id: "editItemDialog",
        content: () => {
          return <EditItemDialog item={item} def={def} />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  const allItemDefs = state.gameDefs.items;
  const allSpellDefs = state.gameDefs.spells;
  const { allItems } = state.items;
  const { currentDraggableId } = state.dragAndDrop;

  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
    allSpellDefs,
    allItems,
    currentDraggableId: currentDraggableId ?? "",
  };
}

export const InventoriesList = connect(mapStateToProps)(AInventoriesList);
