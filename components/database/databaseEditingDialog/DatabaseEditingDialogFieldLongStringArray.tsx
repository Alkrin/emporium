import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldLongStringArray.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: string[];
  onValueChange(value: string[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldLongStringArray extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        {def.labelTexts.map((labelText, index) => {
          return (
            <React.Fragment key={`${labelText} ${index}`}>
              <div className={styles.row}>
                <div className={styles.label}>{labelText}</div>
              </div>
              <div className={styles.row}>
                <textarea
                  className={styles.field}
                  style={{ height: def.fieldSizes?.[index] ?? "7vmin" }}
                  value={this.props.value[index]}
                  onChange={(e) => {
                    const newValue: string[] = Array.from(this.props.value);
                    newValue[index] = e.target.value;
                    this.props.onValueChange(newValue);
                  }}
                  tabIndex={this.props.tabIndex.value++}
                  readOnly={this.props.isDisabled}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldLongStringArray = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldLongStringArray
);
