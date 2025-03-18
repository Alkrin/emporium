import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./ExportDialog.module.scss";
import { FittingView } from "../FittingView";

export interface DialogButtonDef {
  text: React.ReactNode;
  onClick?: () => Promise<void>;
}

interface ReactProps {
  title: string;
  json: string;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AExportDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{this.props.title}</div>
        </FittingView>

        <textarea className={styles.field} value={this.props.json} readOnly={true} />

        <div className={styles.button} onClick={this.onCloseClicked.bind(this)}>
          {"Close"}
        </div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const ExportDialog = connect(mapStateToProps)(AExportDialog);
