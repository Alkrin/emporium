import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { ActivityData, UserData } from "../../serverAPI";
import styles from "./ActivitiesList.module.scss";
import { setActiveActivityId } from "../../redux/activitiesSlice";
import { CreateActivitySubPanel } from "./CreateActivitySubPanel";

interface State {
  filterOwnerId: number;
  filterLocationId: number; // Location or Activity?
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  activities: Dictionary<ActivityData>;
  currentUserId: number;
  users: Dictionary<UserData>;
  activeActivityId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivitiesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filterOwnerId: -1,
      filterLocationId: -1,
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
            <div className={styles.filterText}>Owner</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterOwnerId}
              onChange={(e) => {
                this.setState({ filterOwnerId: +e.target.value });
              }}
            >
              <option value={-1}>Any</option>
              {this.sortPermittedUsers().map(({ id, name }) => {
                return (
                  <option value={id} key={`user${name}`}>
                    {name}
                  </option>
                );
              })}
            </select>
            <div className={styles.filterText}>Location</div>
            <select
              className={styles.filterSelector}
              value={this.state.filterLocationId}
              onChange={(e) => {
                this.setState({ filterLocationId: +e.target.value });
              }}
            >
              <option value={-1}>Any</option>
            </select>
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
    const activities = Object.values(this.props.activities)
      .filter((activity) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return activity.user_id === this.props.currentUserId;
        }
      })
      .sort((a, b) => {
        // Activities that need resolved should go first.
        const aEnd = a.end_date.getTime();
        const bEnd = b.end_date.getTime();
        const aReady = aEnd <= todayTime;
        const bReady = bEnd <= todayTime;
        if (aReady !== bReady) {
          // TODO: Is this the right direction?
          return aReady ? -1 : 1;
        }

        // After that, sort by end date, so you can see what's coming up.
        if (aEnd - bEnd !== 0) {
          // TODO: Is this the right direction?
          return aEnd - bEnd;
        }

        // After that, sort by name.
        return a.name.localeCompare(b.name);
      });

    return activities;
  }

  private sortPermittedUsers(): UserData[] {
    const permittedUsers = Object.values(this.props.users)
      .filter((user) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return user.id === this.props.currentUserId;
        }
      })
      .sort();

    return permittedUsers;
  }

  private renderActivityRow(activity: ActivityData, index: number): React.ReactNode {
    const selectedClass = activity.id === this.props.activeActivityId ? styles.selected : "";
    const readyClass = activity.end_date.getTime() < new Date().getTime() ? styles.ready : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass} ${readyClass}`}
        key={`activityRow${index}`}
        onClick={this.onActivityRowClick.bind(this, activity.id)}
      >
        <div className={styles.listName}>
          #{activity.id}: {activity.name}
        </div>
        <div className={styles.listEndDate}>{dateFormat(activity.end_date, "d. mmm yyyy")}</div>
        <div className={styles.editButton} onClick={this.onActivityEditClick.bind(this, activity.id)} />
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
        escapable: true,
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
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { users } = state.user;
  const { activeActivityId } = state.activities;
  return {
    ...props,
    activities: state.activities.activities,
    activeRole,
    currentUserId: state.user.currentUser.id,
    users,
    activeActivityId,
  };
}

export const ActivitiesList = connect(mapStateToProps)(AActivitiesList);
