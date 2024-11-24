import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldNamedValues.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { DatabaseEditingDialogFieldDef, ExtraFieldDataNamedValues } from "./databaseUtils";
import { SelectNamedValuesDialog } from "../../dialogs/SelectNamedValuesDialog";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  allowMultiSelect?: boolean;
  value: any | any[];
  onValueChange(value: any | any[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldNamedValues extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{def.labelTexts[0]}</div>
          <EditButton
            className={styles.editButton}
            onClick={this.onEditClick.bind(this)}
            tabIndex={this.props.tabIndex.value++}
          />
        </div>

        {this.props.allowMultiSelect ? (
          (this.props.value ?? []).sort().map((v: any, index: number) => {
            return (
              <div className={styles.row} key={index}>
                <div className={styles.selections}>{this.getNameForValue(v)}</div>
              </div>
            );
          })
        ) : (
          <div className={styles.row}>
            <div className={styles.selections}>{this.getNameForValue(this.props.value)}</div>
          </div>
        )}
      </div>
    );
  }

  private getNameForValue(value: any): string {
    const vs = JSON.stringify(value);
    const matchingEntry = this.getExtra().availableValues.find((e) => {
      const value = e[1];
      return vs === JSON.stringify(value);
    });

    return matchingEntry?.[0] ?? "---";
  }

  private getExtra(): ExtraFieldDataNamedValues {
    const extra = this.props.def.extra as ExtraFieldDataNamedValues;
    return extra;
  }

  private onEditClick(): void {
    const extra = this.getExtra();
    this.props.dispatch?.(
      showModal({
        id: "EditNamedValues",
        content: () => {
          return (
            <SelectNamedValuesDialog
              prompt={extra.prompt}
              allowMultiSelect={this.props.allowMultiSelect}
              availableValues={extra.availableValues}
              preselectedValues={this.props.allowMultiSelect ? this.props.value : [this.props.value]}
              onSelectionConfirmed={(value: any[]) => {
                if (this.props.allowMultiSelect) {
                  this.props.onValueChange(value);
                } else {
                  this.props.onValueChange(value[0]);
                }
              }}
            />
          );
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldNamedValues = connect(mapStateToProps)(ADatabaseEditingDialogFieldNamedValues);
