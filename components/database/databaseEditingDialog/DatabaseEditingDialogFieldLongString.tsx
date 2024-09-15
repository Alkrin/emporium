import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldLongString.module.scss";
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

class ADatabaseEditingDialogFieldLongString extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{def.labelTexts[0]}</div>
        </div>
        <div className={styles.row}>
          <textarea
            className={styles.field}
            style={{ height: def.fieldSizes?.[0] ?? "7vmin" }}
            value={this.props.value}
            onChange={(e) => {
              this.props.onValueChange(e.target.value);
            }}
            tabIndex={this.props.tabIndex.value++}
            readOnly={this.props.isDisabled}
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

export const DatabaseEditingDialogFieldLongString = connect(mapStateToProps)(ADatabaseEditingDialogFieldLongString);
