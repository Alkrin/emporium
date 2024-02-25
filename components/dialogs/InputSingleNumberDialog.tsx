import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./InputSingleNumberDialog.module.scss";
import { FittingView } from "../FittingView";

interface State {
  valueString: string;
}

interface ReactProps {
  title?: string;
  prompt?: string;
  initialValue: number;
  onValueConfirmed: (value: number) => Promise<void>;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AInputSingleNumberDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      valueString: `${this.props.initialValue}`,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{this.props.title ?? ""}</div>
        </FittingView>
        <div className={styles.prompt}>{this.props.prompt ?? ""}</div>

        <div className={styles.contentRow}>
          <input
            className={styles.inputField}
            type={"number"}
            value={this.state.valueString}
            onChange={(e) => {
              this.setState({ valueString: e.target.value });
            }}
          />
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          Confirm Value
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Cancel
        </div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onValueConfirmed(+this.state.valueString);
    this.onCloseClicked();
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const InputSingleNumberDialog = connect(mapStateToProps)(AInputSingleNumberDialog);
