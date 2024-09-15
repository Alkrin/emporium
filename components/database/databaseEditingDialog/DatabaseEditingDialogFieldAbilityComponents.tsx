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

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: Dictionary<Dictionary<any>>;
  onValueChange(value: Dictionary<Dictionary<any>>): void;
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
            {Object.entries(this.props.value).map(this.renderComponent.bind(this))}
          </div>
        )}
      </div>
    );
  }

  private renderComponent(entry: [string, Dictionary<any>]): React.ReactNode {
    const [componentDefId, data] = entry;
    const def = AllAbilityComponents[componentDefId];
    if (!def) {
      return null;
    }

    return (
      <div className={styles.componentWrapper} key={componentDefId}>
        <div className={styles.row}>
          <div className={styles.label}>{def.name}</div>
          <DeleteButton className={styles.button} onClick={this.onDeleteClick.bind(this, componentDefId)} />
        </div>
        <div className={styles.column}>
          {def.fields.map((field: DatabaseEditingDialogFieldDef, index: number) => {
            return renderDatabaseEditingDialogField(
              field,
              index,
              this.props.tabIndex,
              data,
              this.applyDataChange.bind(this, componentDefId)
            );
          })}
        </div>
      </div>
    );
  }

  private applyDataChange(componentDefId: string, fieldName: string, value: any): void {
    const newValue: Dictionary<Dictionary<any>> = {
      ...this.props.value,
      [componentDefId]: {
        ...this.props.value[componentDefId],
        [fieldName]: value,
      },
    };

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
                const newValue: Dictionary<Dictionary<any>> = {
                  ...this.props.value,
                };
                const defaults: Dictionary<any> = {};
                def.fields.forEach((field) => {
                  setDefaultValuesForFieldDef(defaults, field);
                });
                newValue[abilityComponentId] = defaults;

                this.props.onValueChange(newValue);
              }}
            />
          );
        },
      })
    );
  }

  private onDeleteClick(componentDefId: string): void {
    const newValue: Dictionary<Dictionary<any>> = {
      ...this.props.value,
    };
    delete newValue[componentDefId];
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
