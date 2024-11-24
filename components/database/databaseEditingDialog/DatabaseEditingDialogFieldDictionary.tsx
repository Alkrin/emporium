import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldDictionary.module.scss";
import { PassableTabIndex, renderDatabaseEditingDialogField } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";
import { Dictionary } from "../../../lib/dictionary";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: Dictionary<any>;
  onValueChange(value: Dictionary<any>): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldDictionary extends React.Component<Props> {
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
        <div className={styles.subfields}>{this.renderSubfields()}</div>
      </div>
    );
  }

  private renderSubfields(): React.ReactNode {
    if (this.props.def.extra && "fields" in this.props.def.extra) {
      const subfields = this.props.def.extra.fields;
      return (
        <>
          {subfields.map((field, index) => {
            return renderDatabaseEditingDialogField(
              field,
              index,
              this.props.tabIndex,
              this.props.value,
              this.applyDataChange.bind(this)
            );
          })}
        </>
      );
    } else {
      return null;
    }
  }

  private applyDataChange(fieldName: string, value: any): void {
    const newData: Dictionary<any> = {
      ...this.props.value,
      [fieldName]: value,
    };
    this.props.onValueChange(newData);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldDictionary = connect(mapStateToProps)(ADatabaseEditingDialogFieldDictionary);
