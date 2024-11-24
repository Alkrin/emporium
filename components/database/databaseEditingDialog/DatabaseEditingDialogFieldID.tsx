import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldID.module.scss";

interface ReactProps {
  value: number;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldID extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{"ID"}</div>
          <input
            className={styles.field}
            type={"text"}
            value={this.props.value === 0 ? "NEW" : `${this.props.value}`}
            readOnly={true}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldID = connect(mapStateToProps)(ADatabaseEditingDialogFieldID);
