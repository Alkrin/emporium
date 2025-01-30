import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../../redux/modalsSlice";
import { RootState } from "../../../redux/store";
import ServerAPI, { ItemData, ItemDefData, SpellDefData, SpellbookEntryData } from "../../../serverAPI";
import styles from "./SpellbookDialog.module.scss";
import { showToaster } from "../../../redux/toastersSlice";
import { Dictionary } from "../../../lib/dictionary";
import TooltipSource from "../../TooltipSource";
import { SpellTooltip } from "../../database/tooltips/SpellTooltip";
import Draggable from "../../Draggable";
import { DraggableHandle } from "../../DraggableHandle";
import DropTarget from "../../DropTarget";
import { addSpellbookEntry, removeSpellbookEntry } from "../../../redux/spellbooksSlice";

interface State {
  spellsByTypeAndLevel: Dictionary<SpellDefData[]>;
  isSaving: boolean;
}

interface ReactProps {
  item: ItemData;
  def: ItemDefData;
}

interface InjectedProps {
  allSpells: Dictionary<SpellDefData>;
  spellbookEntries: SpellbookEntryData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASpellbookDialog extends React.Component<Props, State> {
  private pagesUsed: number = 0;

  constructor(props: Props) {
    super(props);

    this.state = {
      spellsByTypeAndLevel: {},
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.spellListTitle}>{`Spellbook #${this.props.item.id}`}</div>
            <DropTarget dropId={"spellbook"} dropTypes={["spellbook"]} className={styles.spellbookRoot}>
              {this.renderSpellbookContents()}
            </DropTarget>
            <div className={styles.spellbookPageCount}>{`Pages Used: ${this.pagesUsed}/100`}</div>
          </div>
          <div style={{ width: "3vmin" }} />
          <div className={styles.column}>
            <div className={styles.spellListTitle}>All Spells</div>
            <div className={styles.spellListRoot}>{this.renderAvailableSpellList()}</div>
          </div>
        </div>
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)} tabIndex={4}>
          Close
        </div>
      </div>
    );
  }

  componentDidMount(): void {
    // Figure out which spells can be recorded in this spellbook.
    const validSpells = Object.values(this.props.allSpells).filter((spellDef) => {
      const spellTypes = Object.keys(spellDef.type_levels);
      let isValid: boolean = false;
      spellTypes.forEach((type) => {
        if (!isValid && this.props.def.storage_filters.includes(type)) {
          isValid = true;
        }
      });
      return isValid;
    });

    // Split the valid spells by type and level (e.g. L1 Arcane, L2 Eldritch, etc.).
    const spellsByTypeAndLevel: Dictionary<SpellDefData[]> = {};
    validSpells.forEach((spellDef) => {
      Object.entries(spellDef.type_levels).forEach(([type, level]) => {
        const typeAndLevel: string = `L${level} ${type}`;
        if (this.props.def.storage_filters.includes(type)) {
          if (!spellsByTypeAndLevel[typeAndLevel]) {
            spellsByTypeAndLevel[typeAndLevel] = [];
          }
          spellsByTypeAndLevel[typeAndLevel].push(spellDef);
        }
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

  private getSortedSpellbookContents(): Dictionary<SpellbookEntryData[]> {
    // Split the valid spells by type and level (e.g. L1 Arcane, L2 Eldritch, etc.).
    const spellsByLevel: Dictionary<SpellbookEntryData[]> = {};

    this.props.spellbookEntries.forEach((entry) => {
      const def = this.props.allSpells[entry.spell_id];

      // A spell might be different levels for different spell types, so we assume the lowest
      // level from a spelltype that this particular spellbook permits.
      const level = this.getPagesForSpell(def);

      if (!spellsByLevel[level]) {
        spellsByLevel[level] = [];
      }
      spellsByLevel[level].push(entry);
    });

    // Sort the spells alphabetically.
    Object.values(spellsByLevel).forEach((spells) => {
      spells.sort((a: SpellbookEntryData, b: SpellbookEntryData) => {
        const defA = this.props.allSpells[a.spell_id];
        const defB = this.props.allSpells[b.spell_id];
        return defA.name.localeCompare(defB.name);
      });
    });

    return spellsByLevel;
  }

  private renderSpellbookContents(): React.ReactNode {
    const entries = Object.entries(this.getSortedSpellbookContents());
    entries.sort((a, b) => {
      // Sort by level.
      return +a - +b;
    });

    // TODO: Does this calculate when it should, or do I need to put this into State?
    let pagesUsed: number = 0;
    entries.forEach(([level, spells]) => {
      pagesUsed += +level * spells.length;
    });
    this.pagesUsed = pagesUsed;

    return <>{entries.map(this.renderSpellbookSection.bind(this))}</>;
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
          const draggableId = `spell${spellDef.id}`;
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
    const validTypeLevels = Object.entries(spellDef.type_levels)
      .filter(([type, level]) => {
        return this.props.def.storage_filters.includes(type);
      })
      .sort(([typeA, levelA], [typeB, levelB]) => {
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

    // Is there room in the spellbook for this spell?
    const pages = this.getPagesForSpell(spellDef);
    if (pages + this.pagesUsed > 100) {
      // Not enough room!
      this.props.dispatch?.(
        showToaster({
          content: {
            title: "NO ROOM!",
            message: `${spellDef.name} uses ${pages} pages.  This spellbook only has ${
              100 - this.pagesUsed
            } pages left!`,
          },
          duration: 5000,
        })
      );
    } else {
      // Try to assign the spell to this spellbook.
      const res = await ServerAPI.addToSpellbook(this.props.item.id, spellDef.id);
      if ("error" in res) {
        // Failed.  Try again!
        this.showServerErrorToaster(res.error);
      } else {
        const newEntry: SpellbookEntryData = {
          id: res.insertId,
          spell_id: spellDef.id,
          spellbook_id: this.props.item.id,
        };
        this.props.dispatch?.(addSpellbookEntry(newEntry));
      }
    }
  }

  private renderSpellListRowContents(spellDef: SpellDefData): React.ReactNode {
    return (
      <div className={styles.spellListRowContentWrapper}>
        <div className={styles.spellName}>{spellDef.name}</div>
      </div>
    );
  }

  private renderSpellbookSection(entry: [string, SpellbookEntryData[]]): React.ReactNode {
    const [level, spells] = entry;

    return (
      <div key={level}>
        <div className={styles.spellListHeader}>{`L${level}`}</div>
        {spells.map((entry) => {
          const spellDef = this.props.allSpells[entry.spell_id];
          const draggableId = `spellbook${spellDef.id}`;
          return (
            <Draggable className={styles.spellListRowDraggable} draggableId={draggableId} key={draggableId}>
              <DraggableHandle
                className={styles.spellListRowDraggableHandle}
                dropTypes={["spellbook"]}
                draggableId={draggableId}
                draggingRender={this.renderSpellbookRowContents.bind(this, spellDef)}
                dropHandler={(dropTargetIds) => {
                  this.handleSpellbookEntryDropped(dropTargetIds, entry);
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

  private async handleSpellbookEntryDropped(dropTargetIds: string[], entry: SpellbookEntryData): Promise<void> {
    // We dropped the spell back onto the spellbook, do nothing.
    if (dropTargetIds.length > 0) {
      return;
    }

    // Try to remove the spell from this spellbook.
    const res = await ServerAPI.removeFromSpellbook(entry.id);
    if ("error" in res) {
      // Failed.  Try again!
      this.showServerErrorToaster(res.error);
    } else {
      this.props.dispatch?.(removeSpellbookEntry(entry));
    }
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private showServerErrorToaster(errorText: string): void {
    this.props.dispatch?.(
      showToaster({
        id: "ServerError",
        content: { title: "Server Error", message: errorText },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { spells: allSpells } = state.gameDefs;
  const spellbookEntries = state.spellbooks.books[props.item.id] ?? [];
  return {
    ...props,
    allSpells,
    spellbookEntries,
  };
}

export const SpellbookDialog = connect(mapStateToProps)(ASpellbookDialog);
