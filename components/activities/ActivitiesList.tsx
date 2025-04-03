import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { ActivityData, ActivityOutcomeData } from "../../serverAPI";
import styles from "./ActivitiesList.module.scss";
import { setActiveActivityId } from "../../redux/activitiesSlice";
import { CreateActivitySubPanel } from "./CreateActivitySubPanel";
import { FilterDropdowns, FilterType, FilterValueAny, FilterValues, isFilterMetOwner } from "../FilterDropdowns";

interface State {
  filters: FilterValues;
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  activities: Dictionary<ActivityData>;
  outcomesByActivity: Dictionary<ActivityOutcomeData[]>;
  currentUserId: number;
  activeActivityId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivitiesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        [FilterType.Owner]: this.props.currentUserId.toString(),
      },
    };
  }

  render(): React.ReactNode {
    const activities = this.sortActivities();

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.newActivityButton} onClick={this.onCreateNewClicked.bind(this)}>
            Add New Activity
          </div>
          Filters
          <div className={styles.filtersContainer}>
            <FilterDropdowns
              filterOrder={[[FilterType.Owner]]}
              filterValues={this.state.filters}
              onFilterChanged={(filters) => {
                this.setState({ filters });
              }}
            />
          </div>
        </div>
        <div className={styles.listContainer}>
          {activities.map((activity, index) => {
            return this.renderActivityRow(activity, index);
          })}
        </div>
      </div>
    );
  }

  private sortActivities(): ActivityData[] {
    const todayTime: number = new Date().getTime();

    const permittedActivities = Object.values(this.props.activities).filter((activity) => {
      if (this.props.activeRole !== "player") {
        return true;
      } else {
        return activity.user_id === this.props.currentUserId;
      }
    });

    const filteredActivities = permittedActivities.filter((activity) => {
      // Apply Owner filter.
      if (!isFilterMetOwner(this.state.filters, activity.user_id)) {
        return false;
      }

      return true;
    });

    const activities = filteredActivities.sort((a, b) => {
      // Unresolved, then in progress, then resolved.

      // Activities that need resolved should go first.
      const aEnd = new Date(a.end_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      const aCompleted = aEnd <= todayTime;
      const bCompleted = bEnd <= todayTime;
      const aResolved = this.props.outcomesByActivity[a.id]?.length > 0;
      const bResolved = this.props.outcomesByActivity[b.id]?.length > 0;

      const aCompletedUnresolved = aCompleted && !aResolved;
      const bCompletedUnresolved = bCompleted && !bResolved;

      // Completed, unresolved activities show first.
      let dateOrder = 1;
      if (aCompletedUnresolved !== bCompletedUnresolved) {
        return aCompletedUnresolved ? -1 : 1;
      }

      // Uncompleted activities show second.
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }

      // Completed, resolved activities show last.
      if (aResolved && bResolved) {
        dateOrder = -1;
      }

      // After that, sort by end date, so you can see what's coming up.
      if (aEnd - bEnd !== 0) {
        return (aEnd - bEnd) * dateOrder;
      }

      // After that, sort by name.
      return a.name.localeCompare(b.name);
    });

    return activities;
  }

  private renderActivityRow(activity: ActivityData, index: number): React.ReactNode {
    const outcomes = this.props.outcomesByActivity[activity.id] ?? [];
    const selectedClass = activity.id === this.props.activeActivityId ? styles.selected : "";
    const localEndDate = new Date(activity.end_date);
    let localEndDateTime = localEndDate.getTime() + localEndDate.getTimezoneOffset() * 60000;
    const readyClass = new Date(activity.end_date).getTime() < new Date().getTime() ? styles.ready : "";
    const resolvedClass = outcomes.length > 0 ? styles.resolved : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass} ${readyClass} ${resolvedClass}`}
        key={`activityRow${index}`}
        onClick={this.onActivityRowClick.bind(this, activity.id)}
      >
        <div className={styles.listName}>
          #{activity.id}: {activity.name}
        </div>
        <div className={styles.listEndDate}>{dateFormat(localEndDateTime, "d. mmm yyyy")}</div>
        <div
          className={`${styles.editButton} ${resolvedClass}`}
          onClick={this.onActivityEditClick.bind(this, activity.id)}
        />
      </div>
    );
  }

  private onActivityRowClick(activityId: number): void {
    if (this.props.activeActivityId !== activityId) {
      this.props.dispatch?.(setActiveActivityId(activityId));
    }
  }

  private onActivityEditClick(activityId: number): void {
    // Editing also selects the activity.
    this.onActivityRowClick(activityId);
    // Open the activityCreator in edit mode.
    this.props.dispatch?.(
      showSubPanel({
        id: "EditActivity",
        content: () => {
          return <CreateActivitySubPanel isEditMode />;
        },
      })
    );
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateNewActivity",
        content: () => {
          return <CreateActivitySubPanel />;
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { activeActivityId } = state.activities;

  return {
    ...props,
    activities: state.activities.activities,
    activeRole,
    currentUserId: state.user.currentUser.id,
    activeActivityId,
    outcomesByActivity: state.activities.outcomesByActivity,
  };
}

export const ActivitiesList = connect(mapStateToProps)(AActivitiesList);
