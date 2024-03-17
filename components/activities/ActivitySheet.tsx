import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { ActivityData, ActivityOutcomeData, CharacterData } from "../../serverAPI";
import styles from "./ActivitySheet.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ActivityPreparednessDisplay } from "./ActivityPreparednessDisplay";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { ActivityResolutionSubPanel } from "./ActivityResolutionSubPanel";
import { ActivityOutcomesList } from "./ActivityOutcomeList";
import { CreateActivitySubPanel } from "./CreateActivitySubPanel";
import { SheetRoot } from "../SheetRoot";

interface ReactProps {
  activityId: number;
  exiting: boolean;
}

interface InjectedProps {
  allActivities: Dictionary<ActivityData>;
  allCharacters: Dictionary<CharacterData>;
  activity?: ActivityData;
  outcomes: ActivityOutcomeData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivitySheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    if (this.props.activity) {
      // Dates are stored in UTC, so we have to pretend we are in a UTC time zone, else display is wrong.
      const localStartDate = new Date(this.props.activity.start_date);
      let localStartDateTime = localStartDate.getTime() + localStartDate.getTimezoneOffset() * 60000;
      const localEndDate = new Date(this.props.activity.end_date);
      let localEndDateTime = localEndDate.getTime() + localEndDate.getTimezoneOffset() * 60000;
      return (
        <SheetRoot className={`${styles.root} ${animationClass}`}>
          <div className={styles.nameLabel}>{`#${this.props.activity.id}: ${this.props.activity.name}`}</div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>Start:</div>
            <div className={styles.dateValue}>{dateFormat(localStartDateTime, "d. mmm yyyy")}</div>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>Exploration Level:</div>
              <div className={styles.summaryValue}>{this.getExplorationLevelText()}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>End:</div>
            <div className={styles.dateValue}>{dateFormat(localEndDateTime, "d. mmm yyyy")}</div>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>Delve Level:</div>
              <div className={styles.summaryValue}>{this.getDelveLevelText()}</div>
            </div>
          </div>
          <textarea
            className={styles.descriptionTextField}
            value={this.props.activity.description}
            disabled
            spellCheck={false}
          />
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={styles.normalText}>Participants</div>
              <div className={styles.participantsList}>
                {this.props.activity.participants.map((p) => {
                  const character = this.props.allCharacters[p.characterId];
                  return (
                    <div key={p.characterId}>{`${character.name} L${p.characterLevel} ${character.class_name}`}</div>
                  );
                })}
              </div>
            </div>
            <div className={styles.preparednessContainer}>
              <ActivityPreparednessDisplay participants={this.props.activity.participants} cellSizeVmin={7} />
            </div>
          </div>
          <div className={styles.resolutionRow}>
            <div className={styles.column}>
              <div className={styles.normalText}>Resolution</div>
              <textarea
                className={styles.resolutionTextField}
                value={this.props.activity.resolution_text}
                disabled
                spellCheck={false}
              />
            </div>
            <div className={styles.column}>
              <div className={styles.normalText}>Outcomes</div>
              <ActivityOutcomesList className={styles.outcomesList} outcomes={this.props.outcomes} />
            </div>
          </div>
          <div className={styles.buttonRow}>
            <div className={styles.actionButton} onClick={this.onResolveClicked.bind(this)}>
              {this.props.activity.resolution_text.length > 0 ? "Clone Activity" : "Resolve Activity"}
            </div>
          </div>
        </SheetRoot>
      );
    } else {
      return (
        <SheetRoot className={`${styles.root} ${animationClass}`}>
          <div className={styles.placeholder} />
        </SheetRoot>
      );
    }
  }

  private onResolveClicked(): void {
    if (this.props.activity) {
      if (this.props.activity.resolution_text.length > 0) {
        // Open the activityCreator in edit mode.
        this.props.dispatch?.(
          showSubPanel({
            id: "CloneActivity",
            content: () => {
              return <CreateActivitySubPanel isClone />;
            },
            escapable: true,
          })
        );
      } else {
        this.props.dispatch?.(
          showSubPanel({
            id: "ActivityResolution",
            content: () => {
              return <ActivityResolutionSubPanel />;
            },
          })
        );
      }
    }
  }

  private getExplorationLevelText(): string {
    if (this.props.activity) {
      const totalLevel: number = this.props.activity.participants.reduce((subtotal, p) => {
        return subtotal + p.characterLevel;
      }, 0);

      return `${totalLevel} / 6 ≈ ${(totalLevel / 6).toFixed(2)} = ${Math.floor(totalLevel / 6)}`;
    } else {
      return "";
    }
  }

  private getDelveLevelText(): string {
    if (this.props.activity) {
      const numParticipants = this.props.activity.participants.length;
      const totalLevel: number = this.props.activity.participants.reduce((subtotal, p) => {
        return subtotal + p.characterLevel;
      }, 0);

      return `${totalLevel} / ${Math.max(numParticipants, 4)} ≈ ${(totalLevel / Math.max(numParticipants, 4)).toFixed(
        2
      )} = ${Math.round(totalLevel / Math.max(numParticipants, 4))}`;
    } else {
      return "";
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities: allActivities } = state.activities;
  const activity = allActivities[props.activityId] ?? null;
  const allCharacters = state.characters.characters;
  const outcomes = state.activities.outcomesByActivity[props.activityId] ?? [];
  return {
    ...props,
    allActivities,
    activity,
    allCharacters,
    outcomes,
  };
}

export const ActivitySheet = connect(mapStateToProps)(AActivitySheet);
