import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { SpellDefData } from "../../serverAPI";
import styles from "./SelectSpellsDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import TooltipSource from "../TooltipSource";
import { SpellTooltip } from "../database/tooltips/SpellTooltip";
import Draggable from "../Draggable";
import { DraggableHandle } from "../DraggableHandle";
import DropTarget from "../DropTarget";

interface State {
  selectedSpellIds: number[];
  spellsByTypeAndLevel: Dictionary<SpellDefData[]>;
}

interface ReactProps {
  preselectedSpellIds?: number[];
  onSelectionConfirmed: (selectedSpellIds: number[]) => void;
}

interface InjectedProps {
  allSpells: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectSpellsDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedSpellIds: props.preselectedSpellIds ?? [],
      spellsByTypeAndLevel: {},
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.spellListTitle}>{"Selected Spells"}</div>
            <DropTarget dropId={"spellbook"} dropTypes={["spellbook"]} className={styles.spellbookRoot}>
              {this.renderSelectedSpells()}
            </DropTarget>
          </div>
          <div style={{ width: "3vmin" }} />
          <div className={styles.column}>
            <div className={styles.spellListTitle}>{"All Spells"}</div>
            <div className={styles.spellListRoot}>{this.renderAvailableSpellList()}</div>
          </div>
        </div>
        <div className={styles.actionButton} onClick={this.onConfirmClicked.bind(this)} tabIndex={4}>
          {"Confirm Selection"}
        </div>
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)} tabIndex={4}>
          {"Close"}
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    // For this dialog, any spell will do.
    const validSpells = Object.values(this.props.allSpells);

    // Split the valid spells by type and level (e.g. L1 Arcane, L2 Eldritch, etc.).
    const spellsByTypeAndLevel: Dictionary<SpellDefData[]> = {};
    validSpells.forEach((spellDef) => {
      Object.entries(spellDef.type_levels).forEach(([type, level]) => {
        const typeAndLevel: string = `L${level} ${type}`;

        if (!spellsByTypeAndLevel[typeAndLevel]) {
          spellsByTypeAndLevel[typeAndLevel] = [];
        }
        spellsByTypeAndLevel[typeAndLevel].push(spellDef);
      });
    });

    // Sort the spells alphabetically.
    Object.values(spellsByTypeAndLevel).forEach((spells) => {
      spells.sort((a: SpellDefData, b: SpellDefData) => {
        return a.name.localeCompare(b.name);
      });
    });

    this.setState({ spellsByTypeAndLevel });
  }

  private getSortedSpellSelection(): Dictionary<SpellDefData[]> {
    // Split the valid spells by type and level (e.g. L1 Arcane, L2 Eldritch, etc.).
    const spellsByLevel: Dictionary<SpellDefData[]> = {};

    this.state.selectedSpellIds.forEach((spellId) => {
      const def = this.props.allSpells[spellId];

      // A spell might be different levels for different spell types, but we assume the lowest available option.
      const level = this.getPagesForSpell(def);

      if (!spellsByLevel[level]) {
        spellsByLevel[level] = [];
      }
      spellsByLevel[level].push(def);
    });

    // Sort the spells alphabetically.
    Object.values(spellsByLevel).forEach((spells) => {
      spells.sort((a: SpellDefData, b: SpellDefData) => {
        return a.name.localeCompare(b.name);
      });
    });

    return spellsByLevel;
  }

  private renderSelectedSpells(): React.ReactNode {
    const entries = Object.entries(this.getSortedSpellSelection());
    entries.sort((a, b) => {
      // Sort by level.
      return +a - +b;
    });

    return <>{entries.map(this.renderSpellSelectionSection.bind(this))}</>;
  }

  private renderAvailableSpellList(): React.ReactNode {
    // Order spell sections by type, then by level.
    const keys = Object.keys(this.state.spellsByTypeAndLevel);
    keys.sort((a, b) => {
      const aType = a.slice(3);
      const bType = b.slice(3);
      const typeComp = aType.localeCompare(bType);

      if (typeComp) return typeComp;

      return a.localeCompare(b);
    });

    return <>{keys.map(this.renderSpellListSection.bind(this))}</>;
  }

  private renderSpellListSection(typeAndLevel: string): React.ReactNode {
    const spells = this.state.spellsByTypeAndLevel[typeAndLevel];
    return (
      <div key={typeAndLevel}>
        <div className={styles.spellListHeader}>{typeAndLevel}</div>
        {spells.map((spellDef) => {
          const draggableId = `spell,${typeAndLevel},${spellDef.id}`;
          return (
            <Draggable className={styles.spellListRowDraggable} draggableId={draggableId} key={draggableId}>
              <DraggableHandle
                className={styles.spellListRowDraggableHandle}
                dropTypes={["spellbook"]}
                draggableId={draggableId}
                draggingRender={this.renderSpellListRowContents.bind(this, spellDef)}
                dropHandler={(dropTargetIds) => {
                  this.handleSpellDropped(dropTargetIds, spellDef);
                }}
              >
                <TooltipSource
                  className={styles.spellListRowDraggableHandle}
                  tooltipParams={{
                    id: draggableId,
                    content: () => {
                      return <SpellTooltip spellId={spellDef.id} />;
                    },
                  }}
                ></TooltipSource>
              </DraggableHandle>
              {this.renderSpellListRowContents(spellDef)}
            </Draggable>
          );
        })}
      </div>
    );
  }

  private getPagesForSpell(spellDef: SpellDefData): number {
    const validTypeLevels = Object.entries(spellDef.type_levels).sort(([typeA, levelA], [typeB, levelB]) => {
      return levelA - levelB;
    });

    // If there is no valid match, we set the level to 101 so it can't fit in any spellbook.
    const minLevel = validTypeLevels[0]?.[1] ?? 101;

    return minLevel;
  }

  private async handleSpellDropped(dropTargetIds: string[], spellDef: SpellDefData): Promise<void> {
    // We dropped the spell in the middle of nowhere, do nothing.
    if (dropTargetIds.length === 0) {
      return;
    }

    if (!this.state.selectedSpellIds.includes(spellDef.id)) {
      this.setState({ selectedSpellIds: [...this.state.selectedSpellIds, spellDef.id] });
    }
  }

  private renderSpellListRowContents(spellDef: SpellDefData): React.ReactNode {
    return (
      <div className={styles.spellListRowContentWrapper}>
        <div className={styles.spellName}>{spellDef.name}</div>
      </div>
    );
  }

  private renderSpellSelectionSection(entry: [string, SpellDefData[]]): React.ReactNode {
    const [level, spells] = entry;

    return (
      <div key={level}>
        <div className={styles.spellListHeader}>{`L${level}`}</div>
        {spells.map((spellDef) => {
          const draggableId = `spellbook${spellDef.id}`;
          return (
            <Draggable className={styles.spellListRowDraggable} draggableId={draggableId} key={draggableId}>
              <DraggableHandle
                className={styles.spellListRowDraggableHandle}
                dropTypes={["spellbook"]}
                draggableId={draggableId}
                draggingRender={this.renderSpellbookRowContents.bind(this, spellDef)}
                dropHandler={(dropTargetIds) => {
                  this.handleSpellbookEntryDropped(dropTargetIds, spellDef);
                }}
              >
                <TooltipSource
                  className={styles.spellListRowDraggableHandle}
                  tooltipParams={{
                    id: draggableId,
                    content: () => {
                      return <SpellTooltip spellId={spellDef.id} />;
                    },
                  }}
                ></TooltipSource>
              </DraggableHandle>
              {this.renderSpellbookRowContents(spellDef)}
            </Draggable>
          );
        })}
      </div>
    );
  }

  private renderSpellbookRowContents(spellDef: SpellDefData): React.ReactNode {
    return (
      <div className={styles.spellListRowContentWrapper}>
        <div className={styles.spellName}>{spellDef.name}</div>
      </div>
    );
  }

  private async handleSpellbookEntryDropped(dropTargetIds: string[], def: SpellDefData): Promise<void> {
    // We dropped the spell back onto the spellbook, do nothing.
    if (dropTargetIds.length > 0) {
      return;
    }

    this.setState({ selectedSpellIds: this.state.selectedSpellIds.filter((sid) => sid !== def.id) });
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedSpellIds);
    this.onCloseClicked();
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { spells: allSpells } = state.gameDefs;
  return {
    ...props,
    allSpells,
  };
}

export const SelectSpellsDialog = connect(mapStateToProps)(ASelectSpellsDialog);
