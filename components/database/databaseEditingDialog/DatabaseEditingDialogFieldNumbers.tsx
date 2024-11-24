import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldNumbers.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  values: number[];
  onValueChange(fieldName: string, value: number): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

interface State {
  valueStrings: string[];
}

class ADatabaseEditingDialogFieldNumbers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const decimalDigits = this.getDecimalDigits(props.def);

    this.state = {
      valueStrings: props.values.map((v) => v.toFixed(decimalDigits)),
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
          {def.labelTexts.length > 0 ? <div className={styles.label}>{def.labelTexts[0]}</div> : null}
          {def.fieldNames.map((fieldName, index) => {
            return (
              <React.Fragment key={index}>
                <input
                  className={styles.field}
                  style={{ width: def.fieldSizes?.[index] ?? "unset" }}
                  type={"text"}
                  value={this.state.valueStrings[index]}
                  readOnly={this.props.isDisabled}
                  onChange={(e) => {
                    const newArray = [...this.state.valueStrings];
                    newArray[index] = e.target.value;
                    this.setState({ valueStrings: newArray });
                  }}
                  onBlur={() => {
                    this.props.onValueChange(fieldName, +this.state.valueStrings[index]);
                  }}
                  tabIndex={this.props.tabIndex.value++}
                />
                {def.labelTexts.length > index + 1 ? (
                  <div className={styles.label}>{def.labelTexts[index + 1]}</div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    const decimalDigits = this.getDecimalDigits(this.props.def);

    if (this.props.values !== undefined && this.props.values !== prevProps.values) {
      this.setState({ valueStrings: this.props.values.map((v) => v.toFixed(decimalDigits)) });
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

export const DatabaseEditingDialogFieldNumbers = connect(mapStateToProps)(ADatabaseEditingDialogFieldNumbers);
