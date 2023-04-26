import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { CharacterData, ItemData, ItemDefData, StorageData } from "../../serverAPI";
import styles from "./InventoriesList.module.scss";
import Draggable from "../Draggable";
import DraggableHandle from "../DraggableHandle";
import TooltipSource from "../TooltipSource";
import { ItemTooltip } from "../database/ItemTooltip";
import { DropTypeItem } from "./EditEquipmentSubPanel";
import DropTarget from "../DropTarget";
import { getItemNameText } from "../../lib/itemUtils";
import { showModal } from "../../redux/modalsSlice";
import { SplitBundleDialog } from "./SplitBundleDialog";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  containerIds: number[];
  handleItemDropped: (dropTargetIds: string[], item: ItemData, def: ItemDefData) => void;
}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  allItemDefs: Dictionary<ItemDefData>;
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
                className={styles.fullDraggableHandle}
                draggableId={draggableId}
                dropTypes={[DropTypeItem]}
                draggingRender={() => {
                  return this.renderContainerRowContents(item, def, depth);
                }}
                dropHandler={(dropTargetIds) => {
                  this.props.handleItemDropped(dropTargetIds, item, def);
                }}
              >
                <TooltipSource
                  tooltipParams={{
                    id: `container${containerId}`,
                    content: () => {
                      return <ItemTooltip itemId={containerId} />;
                    },
                  }}
                  className={styles.fullDraggableHandle}
                />
              </DraggableHandle>
              {this.renderContainerRowContents(item, def, depth)}
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
      <div className={styles.containerRowContentWrapper} style={{ marginLeft: `${depth}vmin` }}>
        <div className={styles.containerName}>{getItemNameText(item, def)}</div>
      </div>
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
            {def.bundleable && (
              <DropTarget
                dropId={`Bundle${item.id}`}
                dropTypes={[DropTypeItem]}
                className={styles.fullDraggableHandle}
              />
            )}
            <DraggableHandle
              className={styles.fullDraggableHandle}
              draggableId={draggableId}
              dropTypes={[DropTypeItem]}
              draggingRender={() => {
                return this.renderContainedItemRowContents(item, def, depth);
              }}
              dropHandler={(dropTargetIds) => {
                this.props.handleItemDropped(dropTargetIds, item, def);
              }}
            >
              <TooltipSource
                tooltipParams={{
                  id: `contained${item.id}`,
                  content: () => {
                    return <ItemTooltip itemId={item.id} />;
                  },
                }}
                className={styles.fullDraggableHandle}
              />
            </DraggableHandle>
            {this.renderContainedItemRowContents(item, def, depth)}
          </Draggable>
        );
      }
    } else {
      return null;
    }
  }

  private renderContainedItemRowContents(item: ItemData, def: ItemDefData, depth: number): React.ReactNode {
    return (
      <div className={styles.containedItemRowContentWrapper} style={{ marginLeft: `${depth}vmin` }}>
        <div className={styles.containedItemName}>{getItemNameText(item, def)}</div>
        {def.bundleable && item.count > 1 && (
          <div className={styles.bundleButton} onClick={this.onBundleButtonClick.bind(this, item, def)} />
        )}
      </div>
    );
  }

  private onBundleButtonClick(item: ItemData, def: ItemDefData): void {
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
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  const allItemDefs = state.gameDefs.items;
  const { allItems } = state.items;
  const { currentDraggableId } = state.dragAndDrop;

  return {
    ...props,
    character,
    allStorages,
    allItemDefs,
    allItems,
    currentDraggableId: currentDraggableId ?? "",
  };
}

export const InventoriesList = connect(mapStateToProps)(AInventoriesList);
