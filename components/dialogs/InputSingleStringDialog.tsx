import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./InputSingleStringDialog.module.scss";
import { FittingView } from "../FittingView";
import { BasicDialog } from "./BasicDialog";

interface State {
  valueString: string;
}

interface ReactProps {
  title?: string;
  prompt?: string;
  initialValue: string;
  allowEmptyValue?: boolean;
  onValueConfirmed: (value: string) => Promise<void>;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AInputSingleStringDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      valueString: this.props.initialValue,
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
            type={"text"}
            value={this.state.valueString}
            onChange={(e) => {
              this.setState({ valueString: e.target.value });
            }}
          />
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Value"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Cancel"}
        </div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    const value = this.state.valueString.trim();
    if (value.length === 0 && !this.props.allowEmptyValue) {
      this.props.dispatch?.(
        showModal({
          id: "BlankValue",
          content: () => {
            return <BasicDialog title={"Error!"} prompt={"A blank value is not permitted."} />;
          },
        })
      );
    } else {
      this.props.onValueConfirmed(this.state.valueString);
      this.onCloseClicked();
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const InputSingleStringDialog = connect(mapStateToProps)(AInputSingleStringDialog);
