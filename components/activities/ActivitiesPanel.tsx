import * as React from "react";
import styles from "./ActivitiesPanel.module.scss";
import { SubPanelPane } from "../SubPanelPane";
import { ActivitiesList } from "./ActivitiesList";
import { ActivityData } from "../../serverAPI";
import { Dictionary } from "../../lib/dictionary";
import { Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import { connect } from "react-redux";
import { ActivitySheet } from "./ActivitySheet";

interface State {
  currentActivityId: number;
  prevActivityId: number;
}

interface ReactProps {}

interface InjectedProps {
  activities: Dictionary<ActivityData>;
  activeActivityId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivitiesPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentActivityId: props.activeActivityId || 0,
      prevActivityId: 0,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <ActivitiesList />
        <ActivitySheet
          key={this.state.currentActivityId || "None"}
          activityId={this.state.currentActivityId}
          exiting={false}
        />
        {this.state.prevActivityId ? (
          <ActivitySheet
            key={this.state.prevActivityId || "None"}
            activityId={this.state.prevActivityId}
            exiting={true}
          />
        ) : null}
        <SubPanelPane />
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // If the active activity has changed, animate the old one out and the new one in.
    if (this.props.activeActivityId !== this.state.currentActivityId) {
      this.setState({
        currentActivityId: this.props.activeActivityId,
        prevActivityId: this.state.currentActivityId,
      });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeActivityId, activities } = state.activities;

  return {
    ...props,
    activities,
    activeActivityId,
  };
}

export const ActivitiesPanel = connect(mapStateToProps)(AActivitiesPanel);
