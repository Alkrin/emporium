import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./ColorPickerDialog.module.scss";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { ModalCloseButton } from "../ModalCloseButton";

interface State {
  color: string;
}

interface ReactProps {
  initialValue: string;
  onValueConfirmed: (newColor: string) => Promise<void>;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AColorPickerDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      color: this.props.initialValue,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>{"Pick a Color"}</div>
        </div>
        <HexColorPicker
          color={this.state.color}
          onChange={(newColor) => {
            this.setState({ color: newColor });
          }}
        />
        <HexColorInput
          color={this.state.color}
          onChange={(newColor) => {
            this.setState({ color: newColor });
          }}
        />

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Value"}
        </div>
        <ModalCloseButton />
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onValueConfirmed(this.state.color);
    this.onCloseClicked();
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const ColorPickerDialog = connect(mapStateToProps)(AColorPickerDialog);
