import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldNumber.module.scss";
import { DatabaseEditingDialogFieldDef } from "./DatabaseEditingDialog";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number;
  onValueChange(value: number): void;
  tabIndex: number;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

interface State {
  valueString: string;
}

class ADatabaseEditingDialogFieldNumber extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      valueString: props.value.toFixed(this.props.def.decimalDigits ?? 0),
    };
  }

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
            value={this.state.valueString}
            readOnly={this.props.isDisabled}
            onChange={(e) => {
              this.setState({ valueString: e.target.value });
            }}
            onBlur={() => {
              this.props.onValueChange(+this.state.valueString);
            }}
            tabIndex={this.props.tabIndex}
          />
          {def.labelTexts[1] ? <div className={styles.label}>{def.labelTexts[1]}</div> : null}
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.value !== undefined && this.props.value !== prevProps.value) {
      this.setState({ valueString: this.props.value.toFixed(this.props.def.decimalDigits ?? 0) });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldNumber = connect(mapStateToProps)(ADatabaseEditingDialogFieldNumber);
