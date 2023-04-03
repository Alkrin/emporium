import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { SubPanelPane } from "../SubPanelPane";
import { DatabaseItemsSubPanel } from "./DatabaseItemsSubPanel";
import styles from "./DatabasePanel.module.scss";

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabasePanel extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.dataButton} onClick={this.onItemsClicked.bind(this)}>
          Items
        </div>
        <SubPanelPane />
      </div>
    );
  }

  private onItemsClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "DatabaseItems",
        content: () => {
          return <DatabaseItemsSubPanel />;
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

export const DatabasePanel = connect(mapStateToProps)(ADatabasePanel);
