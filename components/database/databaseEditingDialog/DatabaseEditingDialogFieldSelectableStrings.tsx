import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldSelectableStrings.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { SelectStringsDialog } from "../../dialogs/SelectStringsDialog";
import { DatabaseEditingDialogFieldDef, ExtraFieldDataNamedValues } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: string[];
  onValueChange(value: string[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldSelectableStrings extends React.Component<Props> {
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
        <div className={styles.row}>
          {this.props.value.length > 0 && <div className={styles.selections}>{this.props.value.sort().join(", ")}</div>}
        </div>
      </div>
    );
  }

  private onEditClick(): void {
    const extra = this.props.def.extra as ExtraFieldDataNamedValues;
    this.props.dispatch?.(
      showModal({
        id: "EditSelectableStrings",
        content: () => {
          return (
            <SelectStringsDialog
              availableStrings={extra.validStrings}
              preselectedStrings={this.props.value}
              onSelectionConfirmed={this.props.onValueChange}
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

export const DatabaseEditingDialogFieldSelectableStrings = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldSelectableStrings
);
