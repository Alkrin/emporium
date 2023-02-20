import * as React from "react";
import { connect } from "react-redux";
import { ReduxDispatch, RootState } from "../redux/store";
import { setCurrentUser } from "../redux/userSlice";
import ServerAPI from "../serverAPI";

import styles from "./Login.module.scss";

interface State {
  isAuthenticating: boolean;
  errorMessage: string;
}

interface ReactProps {}
interface InjectedProps {
  currentUserId: number;
  dispatch?: ReduxDispatch;
}

type Props = ReactProps & InjectedProps;

class ALogin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isAuthenticating: false,
      errorMessage: "",
    };
  }

  private nameField: HTMLInputElement | null = null;
  private passField: HTMLInputElement | null = null;

  render(): React.ReactNode {
    return (
      <>
        <img className={styles.acksBanner} src={"/images/ACKSBanner.png"} />
        <div className={styles.root}>
          <div className={styles.inputLabel}>User Name</div>
          <input
            className={styles.inputField}
            type="text"
            ref={(ref) => {
              this.nameField = ref;
              ref?.focus();
            }}
            tabIndex={1}
            spellCheck={false}
            disabled={this.state.isAuthenticating}
          />
          <div className={styles.inputLabel}>Password</div>
          <input
            className={styles.inputField}
            type="password"
            ref={(ref) => (this.passField = ref)}
            tabIndex={2}
            spellCheck={false}
            disabled={this.state.isAuthenticating}
          />
          <div
            className={styles.loginButton}
            onClick={this.onLoginClick.bind(this)}
            tabIndex={3}
          >
            Log In
          </div>
          {this.state.isAuthenticating && (
            <div className={styles.authenticatingRoot}>
              <img className={styles.authingAxe} src="/images/AxeIcon.png" />
              <div className={styles.authingLabelContainer}>
                <span className={styles.authingLabel}>Authenticating</span>
                <span className={styles.authingEllipsisOne}>.</span>
                <span className={styles.authingEllipsisTwo}>.</span>
                <span className={styles.authingEllipsisThree}>.</span>
              </div>
            </div>
          )}
        </div>
        {this.state.errorMessage.length > 0 && (
          <div className={styles.errorMessage}>{this.state.errorMessage}</div>
        )}
      </>
    );
  }

  private async onLoginClick(): Promise<void> {
    if (this.state.isAuthenticating) {
      return;
    }

    this.setState({ isAuthenticating: true, errorMessage: "" });

    const result = await ServerAPI.authenticate(
      this.nameField?.value ?? "",
      this.passField?.value ?? ""
    );

    setTimeout(() => {
      this.setState({ isAuthenticating: false });

      if ("error" in result) {
        // Show error state.
        this.setState({
          errorMessage: "Credentials were rejected... is Caps Lock on?",
        });
      } else if (result.id) {
        // Transition to logged-in page/state.
        this.props.dispatch?.(setCurrentUser(result));
      }
    }, 5000);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { id: currentUserId } = state.user;
  return {
    ...props,
    currentUserId,
  };
}

export default connect(mapStateToProps)(ALogin);
