import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { ActivityData, CharacterData } from "../../serverAPI";
import styles from "./ActivitySheet.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ActivityPreparednessDisplay } from "./ActivityPreparednessDisplay";

interface ReactProps {
  activityId: number;
  exiting: boolean;
}

interface InjectedProps {
  allActivities: Dictionary<ActivityData>;
  allCharacters: Dictionary<CharacterData>;
  activity?: ActivityData;
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
        <div className={`${styles.root} ${animationClass}`}>
          <div className={styles.nameLabel}>{`#${this.props.activity.id}: ${this.props.activity.name}`}</div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>Start:</div>
            <div className={styles.dateValue}>{dateFormat(localStartDateTime, "d. mmm yyyy")}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>End:</div>
            <div className={styles.dateValue}>{dateFormat(localEndDateTime, "d. mmm yyyy")}</div>
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
                  return `${character.name} L${p.characterLevel} ${character.class_name}`;
                })}
              </div>
            </div>
            <div className={styles.preparednessContainer}>
              <ActivityPreparednessDisplay participants={this.props.activity.participants} cellSizeVmin={7} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={`${styles.root} ${animationClass}`}>
          <div className={styles.placeholder} />
        </div>
      );
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities: allActivities } = state.activities;
  const activity = allActivities[props.activityId] ?? null;
  const allCharacters = state.characters.characters;
  return {
    ...props,
    allActivities,
    activity,
    allCharacters,
  };
}

export const ActivitySheet = connect(mapStateToProps)(AActivitySheet);
