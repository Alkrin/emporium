import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldNumberArray.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number[];
  onValueChange(value: number[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

interface State {
  valueStrings: string[];
}

class ADatabaseEditingDialogFieldNumberArray extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const value: number[] = props.value ?? Array(this.getArraySize(props.def)).fill(0);
    const decimalDigits = this.getDecimalDigits(props.def);

    this.state = {
      valueStrings: value.map((v) => {
        return v.toFixed(decimalDigits);
      }),
    };
  }

  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        {this.props.def.extra && "headerText" in this.props.def.extra ? (
          <div className={styles.header}>{this.props.def.extra.headerText}</div>
        ) : null}
        <div className={styles.wrapRow}>
          {this.state.valueStrings.map((vs, index) => {
            return (
              <div className={styles.entry} key={index}>
                <div className={styles.label}>{def.labelTexts[index]}</div>
                <input
                  className={styles.field}
                  style={{ width: def.fieldSizes?.[0] ?? "unset" }}
                  type={"text"}
                  value={vs}
                  readOnly={this.props.isDisabled}
                  onChange={(e) => {
                    const newValues = [...this.state.valueStrings];
                    newValues[index] = e.target.value;
                    this.setState({ valueStrings: newValues });
                  }}
                  onBlur={() => {
                    this.props.onValueChange(this.state.valueStrings.map((vs) => +vs));
                  }}
                  tabIndex={this.props.tabIndex.value++}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    const arraySize = this.getArraySize(this.props.def);
    if (arraySize !== this.getArraySize(prevProps.def)) {
      // If the size of the array changes, trim or expand the state array to match.
      const valueStrings: string[] = [];
      for (let i = 0; i < arraySize; ++i) {
        valueStrings[i] =
          this.state.valueStrings[i] ??
          this.props.def.defaults?.[i]?.toFixed(this.getDecimalDigits(this.props.def)) ??
          (0).toFixed(this.getDecimalDigits(this.props.def));
      }
      this.setState({ valueStrings });
    }
    requestAnimationFrame(() => {
      if (this.props.value !== undefined && this.props.value !== prevProps.value) {
        // If the value changes, update the state array to match.
        this.setState({ valueStrings: this.props.value.map((v) => v.toFixed(this.getDecimalDigits(this.props.def))) });
      }
    });
  }

  private getDecimalDigits(def: DatabaseEditingDialogFieldDef): number {
    if (def.extra && "decimalDigits" in def.extra) {
      return def.extra.decimalDigits;
    } else {
      return 0;
    }
  }

  private getArraySize(def: DatabaseEditingDialogFieldDef): number {
    if (def.extra && "arraySize" in def.extra) {
      return def.extra.arraySize;
    } else {
      return 1;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldNumberArray = connect(mapStateToProps)(ADatabaseEditingDialogFieldNumberArray);
