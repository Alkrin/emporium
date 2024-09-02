import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldBoolean.module.scss";
import { DatabaseEditingDialogFieldDef } from "./DatabaseEditingDialog";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: boolean;
  onValueChange(value: boolean): void;
  tabIndex: number;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldBoolean extends React.Component<Props> {
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
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.props.value}
            tabIndex={this.props.tabIndex}
            onChange={(e) => {
              this.props.onValueChange(e.target.checked);
            }}
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

export const DatabaseEditingDialogFieldBoolean = connect(mapStateToProps)(ADatabaseEditingDialogFieldBoolean);
