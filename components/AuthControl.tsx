import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { UserData } from "../serverAPI";
import styles from "./AuthControl.module.scss";
import TooltipSource from "./TooltipSource";
import { Dispatch } from "@reduxjs/toolkit";
import { showModal } from "../redux/modalsSlice";

interface ReactProps {}
interface InjectedProps {
  user: UserData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AAuthControl extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <TooltipSource
        className={styles.root}
        tooltipParams={{
          id: "AuthControl",
          content: "Click to show a Modal dialog",
        }}
        onClick={() => {
          this.props.dispatch?.(
            showModal({
              id: "TESTO",
              content: {
                title: "Modal Dialog",
                message:
                  "This dialog blocks all other interactions.  It can be closed by hitting Escape.",
                buttonText: "Close",
              },
              escapable: true,
            })
          );
        }}
      >
        <div className={styles.initialContainer}>
          {this.props.user.name.charAt(0)}
        </div>
      </TooltipSource>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    user: state.user,
  };
}

export default connect(mapStateToProps)(AAuthControl);
