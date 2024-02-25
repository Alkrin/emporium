import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { SubPanelPane } from "../SubPanelPane";
import styles from "./ToolsPanel.module.scss";
import { ToolsHexClearingSubPanel } from "./ToolsHexClearingSubPanel";

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AToolsPanel extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.toolButton} onClick={this.onHexClearingClicked.bind(this)}>
          Hex Clearing
        </div>
        <SubPanelPane />
      </div>
    );
  }

  private onHexClearingClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "ToolsHexClearing",
        content: () => {
          return <ToolsHexClearingSubPanel />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const ToolsPanel = connect(mapStateToProps)(AToolsPanel);
