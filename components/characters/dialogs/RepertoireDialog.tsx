import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../../redux/modalsSlice";
import { RootState } from "../../../redux/store";
import ServerAPI, { CharacterData, RepertoireEntryData, SpellDefData } from "../../../serverAPI";
import styles from "./RepertoireDialog.module.scss";
import { showToaster } from "../../../redux/toastersSlice";
import { Dictionary } from "../../../lib/dictionary";
import TooltipSource from "../../TooltipSource";
import { SpellTooltip } from "../../database/tooltips/SpellTooltip";
import Draggable from "../../Draggable";
import { DraggableHandle } from "../../DraggableHandle";
import DropTarget from "../../DropTarget";
import { SpellType } from "../../../staticData/types/characterClasses";
import { getCharacterPreparableSpells } from "../../../lib/characterUtils";
import { addRepertoireEntry, removeRepertoireEntry } from "../../../redux/repertoiresSlice";

interface State {
  validSpells: SpellDefData[];
  isSaving: boolean;
}

interface ReactProps {
  character: CharacterData;
  spellTypes: SpellType[];
  spellLevel: number;
  maxSpellsPrepared: number;
}

interface InjectedProps {
  repertoireEntries: RepertoireEntryData[];
  allSpells: Dictionary<SpellDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ARepertoireDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      validSpells: [],
    };
  }

  render(): React.ReactNode {
    const repertoireContents = this.getSortedRepertoireContents();

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.repertoireTitle}>{`Repertoire, L${
              this.props.spellLevel
            } ${this.props.spellTypes.join(" / ")}`}</div>
            <DropTarget dropId={"repertoire"} dropTypes={["repertoire"]} className={styles.repertoireRoot}>
              {repertoireContents.map(this.renderRepertoireEntry.bind(this))}
            </DropTarget>
            <div
              className={styles.repertoireCount}
            >{`Prepared Spells: ${repertoireContents.length}/${this.props.maxSpellsPrepared}`}</div>
          </div>
          <div style={{ width: "3vmin" }} />
          <div className={styles.column}>
            <div className={styles.repertoireTitle}>Preparable Spells</div>
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
    // Figure out which spells can be added to this repertoire.
    const validSpells = getCharacterPreparableSpells(
      this.props.character.id,
      this.props.spellTypes,
      this.props.spellLevel
    );

    // Sort the spells alphabetically.
    validSpells.sort((a: SpellDefData, b: SpellDefData) => {
      return a.name.localeCompare(b.name);
    });

    this.setState({ validSpells });
  }

  private getSortedRepertoireContents(): RepertoireEntryData[] {
    const preparedSpells: RepertoireEntryData[] = this.props.repertoireEntries.filter((entry) => {
      for (let i = 0; i < this.props.spellTypes.length; ++i) {
        const def = this.props.allSpells[entry.spell_id];
        // A spell is valid if it is of the correct level and of a supported type.
        if (def.type_levels[this.props.spellTypes[i]] === this.props.spellLevel) {
          return true;
        }
      }
      return false;
    });

    // Sort the spells alphabetically.
    preparedSpells.sort((a: RepertoireEntryData, b: RepertoireEntryData) => {
      const defA = this.props.allSpells[a.spell_id];
      const defB = this.props.allSpells[b.spell_id];
      return defA.name.localeCompare(defB.name);
    });

    return preparedSpells;
  }

  private renderAvailableSpellList(): React.ReactNode {
    // Available spells are any contained in owned / carried spellbooks that are not already in the repertoire.
    const availableSpells: SpellDefData[] = this.state.validSpells.filter((spellDef) => {
      return !this.props.repertoireEntries.find((entry) => {
        return entry.spell_id === spellDef.id;
      });
    });
    return <>{availableSpells.map(this.renderAvailableSpellListRow.bind(this))}</>;
  }

  private renderAvailableSpellListRow(spellDef: SpellDefData): React.ReactNode {
    const draggableId = `spell${spellDef.id}`;
    return (
      <Draggable className={styles.spellListRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.spellListRowDraggableHandle}
          dropTypes={["repertoire"]}
          draggableId={draggableId}
          draggingRender={this.renderAvailableSpellListRowContents.bind(this, spellDef)}
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
        {this.renderAvailableSpellListRowContents(spellDef)}
      </Draggable>
    );
  }

  private async handleSpellDropped(dropTargetIds: string[], spellDef: SpellDefData): Promise<void> {
    // We dropped the spell in the middle of nowhere, do nothing.
    if (dropTargetIds.length === 0) {
      return;
    }

    // Is there room in the repertoire for this spell?
    const repertoireContents = this.getSortedRepertoireContents();
    if (repertoireContents.length >= this.props.maxSpellsPrepared) {
      // Not enough room!
      this.props.dispatch?.(
        showToaster({
          content: {
            title: "NO ROOM!",
            message: "This repertoire is already full.",
          },
          duration: 5000,
        })
      );
    } else {
      // Try to assign the spell to this repertoire.
      const res = await ServerAPI.addToRepertoire(
        this.props.character.id,
        spellDef.id,
        this.props.spellTypes[0],
        this.props.spellLevel
      );
      if ("error" in res) {
        // Failed.  Try again!
        this.showServerErrorToaster(res.error);
      } else {
        const newEntry: RepertoireEntryData = {
          id: res.insertId,
          character_id: this.props.character.id,
          spell_id: spellDef.id,
          spell_type: this.props.spellTypes[0],
          spell_level: this.props.spellLevel,
        };
        this.props.dispatch?.(addRepertoireEntry(newEntry));
      }
    }
  }

  private renderAvailableSpellListRowContents(spellDef: SpellDefData): React.ReactNode {
    return (
      <div className={styles.spellListRowContentWrapper}>
        <div className={styles.spellName}>{spellDef.name}</div>
      </div>
    );
  }

  private renderRepertoireEntry(entry: RepertoireEntryData): React.ReactNode {
    const spellDef = this.props.allSpells[entry.spell_id];
    const draggableId = `repertoire${entry.id}`;
    return (
      <Draggable className={styles.spellListRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.spellListRowDraggableHandle}
          dropTypes={["repertoire"]}
          draggableId={draggableId}
          draggingRender={this.renderRepertoireRowContents.bind(this, spellDef)}
          dropHandler={(dropTargetIds) => {
            this.handleRepertoireEntryDropped(dropTargetIds, entry);
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
        {this.renderRepertoireRowContents(spellDef)}
      </Draggable>
    );
  }

  private renderRepertoireRowContents(spellDef: SpellDefData): React.ReactNode {
    return (
      <div className={styles.spellListRowContentWrapper}>
        <div className={styles.spellName}>{spellDef.name}</div>
      </div>
    );
  }

  private async handleRepertoireEntryDropped(dropTargetIds: string[], entry: RepertoireEntryData): Promise<void> {
    // We dropped the spell back onto the repertoire, do nothing.
    if (dropTargetIds.length > 0) {
      return;
    }

    // Try to remove the spell from this repertoire.
    const res = await ServerAPI.removeFromRepertoire(entry.id);
    if ("error" in res) {
      // Failed.  Try again!
      this.showServerErrorToaster(res.error);
    } else {
      this.props.dispatch?.(removeRepertoireEntry(entry));
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
  const repertoireEntries = state.repertoires.repertoiresByCharacter[props.character?.id] ?? [];
  return {
    ...props,
    allSpells,
    repertoireEntries,
  };
}

export const RepertoireDialog = connect(mapStateToProps)(ARepertoireDialog);
