import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { ArmyData } from "../../serverAPI";
import { SubPanelPane } from "../SubPanelPane";
import styles from "./ArmiesPanel.module.scss";
import { ArmiesList } from "./ArmiesList";
import { ArmySheet } from "./ArmySheet";

interface State {
  currentArmyId: number;
  prevArmyId: number;
}

interface ReactProps {}

interface InjectedProps {
  armies: Dictionary<ArmyData>;
  activeArmyId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AArmiesPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentArmyId: props.activeArmyId || 0,
      prevArmyId: 0,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <ArmiesList />
        <ArmySheet key={this.state.currentArmyId || "None"} armyId={this.state.currentArmyId} exiting={false} />
        {this.state.prevArmyId ? (
          <ArmySheet key={this.state.prevArmyId || "None"} armyId={this.state.prevArmyId} exiting={true} />
        ) : null}
        <SubPanelPane />
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // If the active army has changed, animate the old one out and the new one in.
    if (this.props.activeArmyId !== this.state.currentArmyId) {
      this.setState({
        currentArmyId: this.props.activeArmyId,
        prevArmyId: this.state.currentArmyId,
      });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { armies, activeArmyId } = state.armies;

  return {
    ...props,
    armies,
    activeArmyId,
  };
}

export const ArmiesPanel = connect(mapStateToProps)(AArmiesPanel);
