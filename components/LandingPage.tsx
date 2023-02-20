import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./LandingPage.module.scss";
import Login from "./Login";
import MainPage from "./MainPage";

interface ReactProps {}
interface InjectedProps {
  currentUserId: number;
}

type Props = ReactProps & InjectedProps;

class ALandingPage extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.viewport}>
        {this.props.currentUserId ? <MainPage /> : <Login />}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { id: currentUserId } = state.user;
  return {
    ...props,
    currentUserId,
  };
}

export default connect(mapStateToProps)(ALandingPage);
