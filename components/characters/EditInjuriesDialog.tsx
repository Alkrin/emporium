import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData, ProficiencyData } from "../../serverAPI";
import styles from "./EditInjuriesDialog.module.scss";
import { showToaster } from "../../redux/toastersSlice";
import TooltipSource from "../TooltipSource";
import Draggable from "../Draggable";
import { DraggableHandle } from "../DraggableHandle";
import DropTarget from "../DropTarget";
import { AbilityOrProficiency, ProficiencySource } from "../../staticData/types/abilitiesAndProficiencies";
import { AllInjuries, AllInjuriesArray } from "../../staticData/injuries/AllInjuries";
import { addInjury, removeInjury } from "../../redux/proficienciesSlice";

interface State {
  isSaving: boolean;
}

interface ReactProps {
  character: CharacterData;
}

interface InjectedProps {
  proficiencies: ProficiencyData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditInjuriesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.injuriesTitle}>{`Current Injuries`}</div>
            <DropTarget dropId={"injury"} dropTypes={["injury"]} className={styles.injuryRoot}>
              {this.getSortedInjuries().map(this.renderInjuryRow.bind(this))}
            </DropTarget>
          </div>
          <div style={{ width: "3vmin" }} />
          <div className={styles.column}>
            <div className={styles.injuriesTitle}>{"Possible Injuries"}</div>
            <div className={styles.possibleInjuriesRoot}>
              {this.getAvailableInjuries().map(this.renderPossibleInjuriesListRow.bind(this))}
            </div>
          </div>
        </div>
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)} tabIndex={4}>
          Close
        </div>
      </div>
    );
  }

  private getAvailableInjuries(): AbilityOrProficiency[] {
    const available = AllInjuriesArray.filter((injury) => {
      return !this.props.proficiencies?.find((i) => {
        return i.feature_id === injury.id;
      });
    });
    available.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return available;
  }

  private getSortedInjuries(): ProficiencyData[] {
    const injuries =
      this.props.proficiencies?.filter((prof) => {
        return prof.source === ProficiencySource.Injury;
      }) ?? [];
    injuries.sort((a, b) => {
      const injuryA = AllInjuries[a.feature_id];
      const injuryB = AllInjuries[b.feature_id];
      return injuryA.name.localeCompare(injuryB.name);
    });

    return injuries;
  }

  private renderPossibleInjuriesListRow(injuryDef: AbilityOrProficiency): React.ReactNode {
    const draggableId = `injury${injuryDef.id}`;
    return (
      <Draggable className={styles.injuryDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.injuryDraggableHandle}
          dropTypes={["injury"]}
          draggableId={draggableId}
          draggingRender={this.renderPossibleInjuriesListRowContents.bind(this, injuryDef)}
          dropHandler={(dropTargetIds) => {
            this.handlePossibleInjuryDropped(dropTargetIds, injuryDef);
          }}
        >
          <TooltipSource
            className={styles.injuryDraggableHandle}
            tooltipParams={{
              id: draggableId,
              content: () => {
                return (
                  <div className={styles.tooltipRoot}>
                    <div className={styles.tooltipTitle}>{injuryDef.name}</div>
                    <div className={styles.tooltipText}>{injuryDef.description[0]}</div>
                  </div>
                );
              },
            }}
          ></TooltipSource>
        </DraggableHandle>
        {this.renderPossibleInjuriesListRowContents(injuryDef)}
      </Draggable>
    );
  }

  private async handlePossibleInjuryDropped(dropTargetIds: string[], injuryDef: AbilityOrProficiency): Promise<void> {
    // We dropped the possible injury in the middle of nowhere, do nothing.
    if (dropTargetIds.length === 0) {
      return;
    }

    // Try to assign the injury to this charactyer.
    const res = await ServerAPI.addInjury(this.props.character.id, injuryDef.id);
    if ("error" in res) {
      // Failed.  Try again!
      this.showServerErrorToaster(res.error);
    } else {
      this.props.dispatch?.(addInjury({ characterId: this.props.character.id, injuryId: injuryDef.id }));
    }
  }

  private renderPossibleInjuriesListRowContents(injuryDef: AbilityOrProficiency): React.ReactNode {
    return (
      <div className={styles.injuryRowContentWrapper}>
        <div className={styles.injuryName}>{injuryDef.name}</div>
      </div>
    );
  }

  private renderInjuryRow(entry: ProficiencyData): React.ReactNode {
    const injuryDef = AllInjuries[entry.feature_id];
    const draggableId = `injury${entry.feature_id}`;
    return (
      <Draggable className={styles.injuryRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.injuryDraggableHandle}
          dropTypes={["injury"]}
          draggableId={draggableId}
          draggingRender={this.renderInjuryRowContents.bind(this, injuryDef)}
          dropHandler={(dropTargetIds) => {
            this.handleInjuryDropped(dropTargetIds, entry);
          }}
        >
          <TooltipSource
            className={styles.injuryDraggableHandle}
            tooltipParams={{
              id: draggableId,
              content: () => {
                return (
                  <div className={styles.tooltipRoot}>
                    <div className={styles.tooltipTitle}>{injuryDef.name}</div>
                    <div className={styles.tooltipText}>{injuryDef.description[0]}</div>
                  </div>
                );
              },
            }}
          ></TooltipSource>
        </DraggableHandle>
        {this.renderInjuryRowContents(injuryDef)}
      </Draggable>
    );
  }

  private renderInjuryRowContents(injuryDef: AbilityOrProficiency): React.ReactNode {
    return (
      <div className={styles.injuryRowContentWrapper}>
        <div className={styles.injuryName}>{injuryDef.name}</div>
      </div>
    );
  }

  private async handleInjuryDropped(dropTargetIds: string[], entry: ProficiencyData): Promise<void> {
    // We dropped the injury back onto the available list, do nothing.
    if (dropTargetIds.length > 0) {
      return;
    }

    // Try to remove the injury from this character.
    const res = await ServerAPI.removeInjury(entry.character_id, entry.feature_id);
    if ("error" in res) {
      // Failed.  Try again!
      this.showServerErrorToaster(res.error);
    } else {
      this.props.dispatch?.(removeInjury({ characterId: entry.character_id, injuryId: entry.feature_id }));
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
  const proficiencies = state.proficiencies.proficienciesByCharacterId[props.character.id];
  return {
    ...props,
    proficiencies,
  };
}

export const EditInjuriesDialog = connect(mapStateToProps)(AEditInjuriesDialog);
