import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { CharacterData } from "../../serverAPI";
import styles from "./InputSingleNumberOfTwoDialog.module.scss";

interface State {
  firstNumberString: string;
  secondNumberString: string;
  saving: boolean;
}

interface ReactProps {
  firstNumberPrompt: string;
  secondNumberPrompt: string;
  applyFirstNumber: (value: number) => Promise<boolean>;
  applySecondNumber: (value: number) => Promise<boolean>;
  initialFirstValue?: number;
  initialSecondValue?: number;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AInputSingleNumberOfTwoDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      firstNumberString: props.initialFirstValue === undefined ? "0" : props.initialFirstValue.toString(),
      secondNumberString: props.initialSecondValue === undefined ? "0" : props.initialSecondValue.toString(),
      saving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.rowText}>{this.props.firstNumberPrompt}</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.firstNumberString}
            min={0}
            onChange={(e) => {
              this.setState({ firstNumberString: e.target.value });
            }}
            tabIndex={1}
            autoFocus
          />
          <div className={styles.dialogButton} onClick={this.onApplyFirstClicked.bind(this)}>
            {"Apply"}
          </div>
        </div>
        <div className={styles.orText}>{"- or -"}</div>
        <div className={styles.row}>
          <div className={styles.rowText}>{this.props.secondNumberPrompt}</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.secondNumberString}
            min={0}
            onChange={(e) => {
              this.setState({ secondNumberString: e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onApplySecondClicked.bind(this)}>
            {"Apply"}
          </div>
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Close"}
        </div>
      </div>
    );
  }

  private async onApplyFirstClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });

    const shouldClose = await this.props.applyFirstNumber(+this.state.firstNumberString);
    if (shouldClose) {
      this.onCloseClicked();
    }

    this.setState({ saving: false });
  }

  private async onApplySecondClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });

    const shouldClose = await this.props.applySecondNumber(+this.state.secondNumberString);
    if (shouldClose) {
      this.onCloseClicked();
    }

    this.setState({ saving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  return {
    ...props,
    character,
  };
}

export const InputSingleNumberOfTwoDialog = connect(mapStateToProps)(AInputSingleNumberOfTwoDialog);
