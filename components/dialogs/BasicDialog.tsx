import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./BasicDialog.module.scss";
import { FittingView } from "../FittingView";

export interface DialogButtonDef {
  text: React.ReactNode;
  onClick?: () => Promise<void>;
}

interface ReactProps {
  title?: string;
  prompt?: string;
  buttons?: DialogButtonDef[];
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ABasicDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{this.props.title ?? ""}</div>
        </FittingView>
        <div className={styles.prompt}>{this.props.prompt ?? ""}</div>

        {(this.props.buttons?.length ?? 0) > 0 ? (
          this.props.buttons?.map(this.renderButton.bind(this))
        ) : (
          <div className={styles.button} onClick={this.onCloseClicked.bind(this)}>
            {"Okay"}
          </div>
        )}
      </div>
    );
  }

  private renderButton(def: DialogButtonDef, index: number): React.ReactNode {
    return (
      <div
        key={index}
        className={styles.button}
        onClick={() => {
          if (def.onClick) {
            def.onClick();
          } else {
            this.onCloseClicked();
          }
        }}
      >
        {def.text}
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

export const BasicDialog = connect(mapStateToProps)(ABasicDialog);
