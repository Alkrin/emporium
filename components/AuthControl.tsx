import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { UserData } from "../serverAPI";
import styles from "./AuthControl.module.scss";
import TooltipSource from "./TooltipSource";
import { Dispatch } from "@reduxjs/toolkit";
import { hideModal, showModal } from "../redux/modalsSlice";
import { setCurrentUser } from "../redux/userSlice";
import { BasicDialog } from "./dialogs/BasicDialog";

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
          content: this.props.user.name,
        }}
        onClick={() => {
          this.props.dispatch?.(
            showModal({
              id: "LogOut",
              content: () => (
                <BasicDialog
                  title={this.props.user.name}
                  buttons={[
                    {
                      text: "Log Out",
                      onClick: async () => {
                        this.props.dispatch?.(
                          setCurrentUser({
                            id: 0,
                            name: "",
                            role: "player",
                          })
                        );
                        this.props.dispatch?.(hideModal());
                      },
                    },
                    { text: "Stay!" },
                  ]}
                />
              ),
            })
          );
        }}
      >
        <div className={styles.initialContainer}>{this.props.user.name.charAt(0)}</div>
      </TooltipSource>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    user: state.user.currentUser,
  };
}

export default connect(mapStateToProps)(AAuthControl);
