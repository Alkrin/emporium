import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldString.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: string;
  onValueChange(value: string): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldString extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{def.labelTexts[0]}</div>
          <input
            className={styles.field}
            style={{ width: def.fieldSizes?.[0] ?? "unset" }}
            type={"text"}
            value={this.props.value}
            readOnly={this.props.isDisabled}
            onChange={(e) => {
              this.props.onValueChange(e.target.value);
            }}
            tabIndex={this.props.tabIndex.value++}
          />
          {def.labelTexts[1] ? <div className={styles.label}>{def.labelTexts[1]}</div> : null}
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

export const DatabaseEditingDialogFieldString = connect(mapStateToProps)(ADatabaseEditingDialogFieldString);
