import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldAbilityComponents.module.scss";
import { PassableTabIndex, renderDatabaseEditingDialogField } from "./DatabaseEditingDialog";
import { showModal } from "../../../redux/modalsSlice";
import { Dictionary } from "../../../lib/dictionary";
import { AddButton } from "../../AddButton";
import { AllAbilityComponents } from "../../../staticData/abilityComponents/abilityComponent";
import { DeleteButton } from "../../DeleteButton";
import { SelectAbilityComponentDialog } from "../../dialogs/SelectAbilityComponentDialog";
import { DatabaseEditingDialogFieldDef, setDefaultValuesForFieldDef } from "./databaseUtils";
import { AbilityComponentData } from "../../../serverAPI";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: AbilityComponentData[];
  onValueChange(value: AbilityComponentData[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldAbilityComponents extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{def.labelTexts[0]}</div>
          <AddButton
            className={styles.button}
            onClick={this.onAddClick.bind(this)}
            // The AddButton can be tabbed onto.
            tabIndex={this.props.tabIndex.value++}
          />
        </div>
        {Object.keys(this.props.value).length > 0 && (
          <div className={styles.components}>
            {Object.values(this.props.value).map(this.renderComponent.bind(this))}
          </div>
        )}
      </div>
    );
  }

  private renderComponent(entry: AbilityComponentData, index: number): React.ReactNode {
    const { componentId: componentDefId, data } = entry;
    const def = AllAbilityComponents[componentDefId];
    if (!def) {
      return null;
    }

    return (
      <React.Fragment key={index}>
        {index !== 0 && <div className={styles.componentSeparator} />}
        <div className={styles.componentWrapper}>
          <div className={styles.row}>
            <div className={styles.label}>{def.name}</div>
            <DeleteButton className={styles.button} onClick={this.onDeleteClick.bind(this, index)} />
          </div>
          <div className={styles.column}>
            {def.fields.map((field: DatabaseEditingDialogFieldDef, fieldIndex: number) => {
              return renderDatabaseEditingDialogField(
                field,
                fieldIndex,
                this.props.tabIndex,
                data,
                this.applyDataChange.bind(this, index)
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }

  private applyDataChange(index: number, fieldName: string, value: any): void {
    const newValue = [...this.props.value];
    newValue[index] = { ...newValue[index], data: { ...newValue[index].data, [fieldName]: value } };

    this.props.onValueChange(newValue);
  }

  private onAddClick(): void {
    this.props.dispatch?.(
      showModal({
        id: "AddAbilityComponent",
        content: () => {
          return (
            <SelectAbilityComponentDialog
              onSelectionConfirmed={async (abilityComponentId: string) => {
                const def = AllAbilityComponents[abilityComponentId];
                const newValue = [...this.props.value];
                const data: Dictionary<any> = {};
                def.fields.forEach((field) => {
                  setDefaultValuesForFieldDef(data, field);
                });
                newValue.push({ componentId: abilityComponentId, data });

                this.props.onValueChange(newValue);
              }}
            />
          );
        },
      })
    );
  }

  private onDeleteClick(index: number): void {
    const newValue = this.props.value.filter((v, vindex) => index !== vindex);
    this.props.onValueChange(newValue);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialogFieldAbilityComponents = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldAbilityComponents
);
