import * as React from "react";
import { connect } from "react-redux";
import { ReduxDispatch, RootState } from "../redux/store";
import styles from "./MainPage.module.scss";

interface ReactProps {}
interface InjectedProps {
  dispatch?: ReduxDispatch;
}

type Props = ReactProps & InjectedProps;

class AMainPage extends React.Component<Props> {
  render(): React.ReactNode {
    return <div className={styles.root}>Logged In!</div>;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export default connect(mapStateToProps)(AMainPage);
