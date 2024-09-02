import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldTwoNumbers.module.scss";
import { DatabaseEditingDialogFieldDef } from "./DatabaseEditingDialog";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number;
  secondValue: number;
  onValueChange(value: number): void;
  onSecondValueChange(value: number): void;
  tabIndex: number;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

interface State {
  valueString: string;
  secondValueString: string;
}

class ADatabaseEditingDialogFieldTwoNumbers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      valueString: props.value.toFixed(this.props.def.decimalDigits ?? 0),
      secondValueString: props.secondValue.toFixed(this.props.def.decimalDigits ?? 0),
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
          <div className={styles.label}>{def.labelTexts[1]}</div>
          <input
            className={styles.field}
            style={{ width: def.fieldSizes?.[1] ?? "unset" }}
            type={"text"}
            value={this.state.secondValueString}
            readOnly={this.props.isDisabled}
            onChange={(e) => {
              this.setState({ secondValueString: e.target.value });
            }}
            onBlur={() => {
              this.props.onValueChange(+this.state.secondValueString);
            }}
            tabIndex={this.props.tabIndex + 1}
          />
          {def.labelTexts[2] ? <div className={styles.label}>{def.labelTexts[2]}</div> : null}
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.value !== undefined && this.props.value !== prevProps.value) {
      this.setState({ valueString: this.props.value.toFixed(this.props.def.decimalDigits ?? 0) });
    }

    if (this.props.secondValue !== undefined && this.props.secondValue !== prevProps.secondValue) {
      this.setState({ secondValueString: this.props.secondValue.toFixed(this.props.def.decimalDigits ?? 0) });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldTwoNumbers = connect(mapStateToProps)(ADatabaseEditingDialogFieldTwoNumbers);
