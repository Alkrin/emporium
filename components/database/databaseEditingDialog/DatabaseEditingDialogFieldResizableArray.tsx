import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldResizableArray.module.scss";
import { PassableTabIndex, renderDatabaseEditingDialogField } from "./DatabaseEditingDialog";
import {
  DatabaseEditingDialogField,
  DatabaseEditingDialogFieldDef,
  setDefaultValuesForFieldDef,
} from "./databaseUtils";
import { AddButton } from "../../AddButton";
import { DeleteButton } from "../../DeleteButton";
import { AbilityFilterv2, AbilityInstancev2 } from "../../../staticData/types/abilitiesAndProficiencies";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: any[];
  onValueChange(value: any[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldResizableArray extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    const value: any[] = this.props.value ?? [];

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.header}>{this.props.def.labelTexts[0]}</div>
          <AddButton onClick={this.onAddClicked.bind(this)} />
        </div>
        <div className={styles.arrayWrapper}>{value.map(this.renderArrayEntry.bind(this))}</div>
      </div>
    );
  }

  private renderArrayEntry(value: any, index: number): React.ReactNode {
    return (
      <div className={`${styles.entry} ${index % 2 ? styles.alternater : ""}`} key={index}>
        <div className={styles.entryIndex}>{`${index}:`}</div>
        <div className={styles.entryContent}>{this.renderEntryContents(value, index)}</div>
        <DeleteButton
          className={styles.deleteButton}
          onClick={() => {
            const newValue = [...this.props.value];
            newValue.splice(index, 1);
            this.props.onValueChange(newValue);
          }}
        />
      </div>
    );
  }

  private renderEntryContents(value: any, valueIndex: number): React.ReactNode {
    if (this.props.def.extra && "entryDef" in this.props.def.extra) {
      switch (this.props.def.extra.entryDef.type) {
        case DatabaseEditingDialogField.AbilityFilter: {
          return renderDatabaseEditingDialogField(
            this.props.def.extra.entryDef,
            0,
            this.props.tabIndex,
            { [""]: value },
            this.applyAbilityFilterDataChange.bind(this, valueIndex)
          );
        }
        case DatabaseEditingDialogField.AbilityInstance: {
          return renderDatabaseEditingDialogField(
            this.props.def.extra.entryDef,
            0,
            this.props.tabIndex,
            { [""]: value },
            this.applyAbilityInstanceDataChange.bind(this, valueIndex)
          );
        }
        case DatabaseEditingDialogField.Dictionary: {
          if (this.props.def.extra.entryDef.extra && "fields" in this.props.def.extra.entryDef.extra) {
            return (
              <>
                {this.props.def.extra.entryDef.extra.fields.map((field, index) => {
                  return renderDatabaseEditingDialogField(
                    field,
                    index,
                    this.props.tabIndex,
                    value,
                    this.applyDictionaryDataChange.bind(this, valueIndex)
                  );
                })}
              </>
            );
          }
          return null;
        }
        case DatabaseEditingDialogField.Number: {
          return renderDatabaseEditingDialogField(
            this.props.def.extra.entryDef,
            0,
            this.props.tabIndex,
            { [""]: value },
            this.applyNumberDataChange.bind(this, valueIndex)
          );
        }
        default: {
          console.error(`Attempted to renderEntryContents() for unsupported type: ${this.props.def.type}`);
          return null;
        }
      }
    }
    return null;
  }

  private applyAbilityFilterDataChange(index: number, fieldName: string, value: AbilityFilterv2): void {
    const newArray: any[] = [...this.props.value];
    newArray[index] = value;
    this.props.onValueChange(newArray);
  }

  private applyAbilityInstanceDataChange(index: number, fieldName: string, value: AbilityInstancev2): void {
    const newArray: any[] = [...this.props.value];
    newArray[index] = value;
    this.props.onValueChange(newArray);
  }

  private applyNumberDataChange(index: number, fieldName: string, value: number): void {
    const newArray: any[] = [...this.props.value];
    newArray[index] = value;
    this.props.onValueChange(newArray);
  }

  private applyDictionaryDataChange(index: number, fieldName: string, value: any): void {
    const newArray: any[] = [...this.props.value];
    const newEntry: any = { ...newArray[index] };
    newEntry[fieldName] = value;
    newArray[index] = newEntry;
    this.props.onValueChange(newArray);
  }

  private onAddClicked(): void {
    const value: any[] = this.props.value ?? [];

    if (this.props.def.extra && "entryDef" in this.props.def.extra) {
      switch (this.props.def.extra.entryDef.type) {
        case DatabaseEditingDialogField.AbilityFilter: {
          const newInstance: AbilityFilterv2 = {
            abilityDefId: 0,
            subtypes: [],
            rank: 1,
          };
          this.props.onValueChange([...value, newInstance]);
          break;
        }
        case DatabaseEditingDialogField.AbilityInstance: {
          const newInstance: AbilityInstancev2 = {
            abilityDefId: 0,
            rank: 1,
            minLevel: 1,
          };
          this.props.onValueChange([...value, newInstance]);
          break;
        }
        case DatabaseEditingDialogField.Dictionary: {
          if (this.props.def.extra.entryDef.extra && "fields" in this.props.def.extra.entryDef.extra) {
            const newEntry: any = {};
            this.props.def.extra.entryDef.extra.fields.forEach((fieldDef) => {
              setDefaultValuesForFieldDef(newEntry, fieldDef);
            });
            this.props.onValueChange([...value, newEntry]);
          }
          break;
        }
        case DatabaseEditingDialogField.Number: {
          this.props.onValueChange([...value, 0]);
          break;
        }
        default: {
          console.error(`Attempted to create ResizableArray for unsupported field type "${this.props.def.type}"`);
          break;
        }
      }
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldResizableArray = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldResizableArray
);
