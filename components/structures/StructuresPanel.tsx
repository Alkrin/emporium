import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { SubPanelPane } from "../SubPanelPane";
import styles from "./StructuresPanel.module.scss";
import { StructureComponentData, StructureData } from "../../serverAPI";
import { StructuresList } from "./StructuresList";
import { StructureSheet } from "./StructureSheet";

interface State {
  currentStructureId: number;
  prevStructureId: number;
}

interface ReactProps {}

interface InjectedProps {
  structures: Dictionary<StructureData>;
  componentsByStructure: Dictionary<StructureComponentData[]>;
  activeStructureId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AStructuresPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentStructureId: props.activeStructureId || 0,
      prevStructureId: 0,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <StructuresList />
        <StructureSheet
          key={this.state.currentStructureId || "None"}
          structureId={this.state.currentStructureId}
          exiting={false}
        />
        {this.state.prevStructureId ? (
          <StructureSheet
            key={this.state.prevStructureId || "None"}
            structureId={this.state.prevStructureId}
            exiting={true}
          />
        ) : null}
        <SubPanelPane />
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // If the active structure has changed, animate the old one out and the new one in.
    if (this.props.activeStructureId !== this.state.currentStructureId) {
      this.setState({
        currentStructureId: this.props.activeStructureId,
        prevStructureId: this.state.currentStructureId,
      });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { structures, componentsByStructure, activeStructureId } = state.structures;

  return {
    ...props,
    structures,
    componentsByStructure,
    activeStructureId,
  };
}

export const StructuresPanel = connect(mapStateToProps)(AStructuresPanel);
