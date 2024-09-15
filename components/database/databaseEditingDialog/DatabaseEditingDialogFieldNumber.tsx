import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldNumber.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number;
  onValueChange(value: number): void;
  tabIndex: PassableTabIndex;
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

    const extra = props.def.extra ?? {};

    this.state = {
      valueString: props.value.toFixed(this.getDecimalDigits(props.def)),
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
            tabIndex={this.props.tabIndex.value++}
          />
          {def.labelTexts[1] ? <div className={styles.label}>{def.labelTexts[1]}</div> : null}
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.value !== undefined && this.props.value !== prevProps.value) {
      this.setState({ valueString: this.props.value.toFixed(this.getDecimalDigits(this.props.def)) });
    }
  }

  private getDecimalDigits(def: DatabaseEditingDialogFieldDef): number {
    if (def.extra && "decimalDigits" in def.extra) {
      return def.extra.decimalDigits;
    } else {
      return 0;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldNumber = connect(mapStateToProps)(ADatabaseEditingDialogFieldNumber);
