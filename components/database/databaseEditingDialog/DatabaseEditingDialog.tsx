import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../../lib/dictionary";
import { RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialog.module.scss";
import { SearchableDef, SearchableDefList } from "../SearchableDefList";
import { ScrollArea } from "../../ScrollArea";
import { SavingVeil } from "../../SavingVeil";
import { DatabaseEditingDialogFieldID } from "./DatabaseEditingDialogFieldID";
import { DatabaseEditingDialogFieldString } from "./DatabaseEditingDialogFieldString";
import { DatabaseEditingDialogFieldLongString } from "./DatabaseEditingDialogFieldLongString";
import { DatabaseEditingDialogFieldNumber } from "./DatabaseEditingDialogFieldNumber";
import { DatabaseEditingDialogFieldNumbers } from "./DatabaseEditingDialogFieldNumbers";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { BasicDialog } from "../../dialogs/BasicDialog";
import { DatabaseEditingDialogFieldBoolean } from "./DatabaseEditingDialogFieldBoolean";
import { DatabaseEditingDialogFieldSpells } from "./DatabaseEditingDialogFieldSpells";
import { DatabaseEditingDialogFieldLongStringArray } from "./DatabaseEditingDialogFieldLongStringArray";
import { DatabaseEditingDialogFieldAbilityComponents } from "./DatabaseEditingDialogFieldAbilityComponents";
import {
  DatabaseEditingDialogField,
  DatabaseEditingDialogFieldDef,
  setDefaultValuesForFieldDef,
} from "./databaseUtils";
import { DatabaseEditingDialogFieldDictionary } from "./DatabaseEditingDialogFieldDictionary";
import { DatabaseEditingDialogFieldNumberArray } from "./DatabaseEditingDialogFieldNumberArray";
import { DatabaseEditingDialogFieldResizableArray } from "./DatabaseEditingDialogFieldResizableArray";
import { DatabaseEditingDialogFieldAbilityInstance } from "./DatabaseEditingDialogFieldAbilityInstance";
import { AbilityFilterv2, AbilityInstancev2 } from "../../../staticData/types/abilitiesAndProficiencies";
import { DatabaseEditingDialogFieldAbilityFilter } from "./DatabaseEditingDialogFieldAbilityFilter";
import { DatabaseEditingDialogFieldNamedValues } from "./DatabaseEditingDialogFieldNamedValues";

type AnySearchableDef = SearchableDef & {
  [key: string]: any;
};

interface State {
  data: AnySearchableDef;
  isSaving: boolean;
}

// We use an object so we can pass the tabIndex value by reference (sort of), since each field
// can have an arbitrary number of tabbable targets.
export interface PassableTabIndex {
  value: number;
}

export function renderDatabaseEditingDialogField(
  def: DatabaseEditingDialogFieldDef,
  index: number,
  tabIndex: PassableTabIndex,
  data: Dictionary<any>,
  applyDataChange: (fieldName: string, value: any) => void
): React.ReactNode {
  switch (def.type) {
    case DatabaseEditingDialogField.AbilityComponents: {
      return (
        <DatabaseEditingDialogFieldAbilityComponents
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: Dictionary<Dictionary<any>>) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.AbilityFilter: {
      return (
        <DatabaseEditingDialogFieldAbilityFilter
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: AbilityFilterv2) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.AbilityInstance: {
      return (
        <DatabaseEditingDialogFieldAbilityInstance
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: AbilityInstancev2) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.Boolean: {
      return (
        <DatabaseEditingDialogFieldBoolean
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: boolean) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.Dictionary: {
      return (
        <DatabaseEditingDialogFieldDictionary
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: Dictionary<any>) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.LongString: {
      return (
        <DatabaseEditingDialogFieldLongString
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: string) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.LongStringArray: {
      return (
        <DatabaseEditingDialogFieldLongStringArray
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: string[]) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.NamedValue: {
      return (
        <DatabaseEditingDialogFieldNamedValues
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: any) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.NamedValues: {
      return (
        <DatabaseEditingDialogFieldNamedValues
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          allowMultiSelect={true}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: any[]) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.Number: {
      return (
        <DatabaseEditingDialogFieldNumber
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: number) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.NumberArray: {
      return (
        <DatabaseEditingDialogFieldNumberArray
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: number[]) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.Numbers: {
      return (
        <DatabaseEditingDialogFieldNumbers
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          values={def.fieldNames.map((fieldName) => data[fieldName] ?? 0)}
          onValueChange={(fieldName: string, value: number) => applyDataChange(fieldName, value)}
        />
      );
    }
    case DatabaseEditingDialogField.ResizableArray: {
      return (
        <DatabaseEditingDialogFieldResizableArray
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? []]}
          onValueChange={(value: any[]) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.Spells: {
      return (
        <DatabaseEditingDialogFieldSpells
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: number[]) => applyDataChange(def.fieldNames[0], value)}
        />
      );
    }
    case DatabaseEditingDialogField.String: {
      return (
        <DatabaseEditingDialogFieldString
          key={def.fieldNames[0]}
          tabIndex={tabIndex}
          def={def}
          value={data[def.fieldNames[0] ?? ""]}
          onValueChange={(value: string) => {
            applyDataChange(def.fieldNames[0], value);
          }}
        />
      );
    }
  }
}

function buildDefaultState(fieldDefs: DatabaseEditingDialogFieldDef[]) {
  const defaultState: State = {
    data: {
      id: 0,
      name: "",
    },
    isSaving: false,
  };

  fieldDefs.forEach((def) => {
    setDefaultValuesForFieldDef(defaultState.data, def);
  });

  return defaultState;
}

interface ReactProps {
  title: string;
  allDefs: Dictionary<SearchableDef>;
  fieldDefs: (data: any) => DatabaseEditingDialogFieldDef[];
  onSaveClicked: (data: SearchableDef) => Promise<number>;
  /** Returns true if the delete is successful, false if it fails. */
  onDeleteConfirmed: (defId: number) => Promise<boolean>;
  renderTooltip?: (def: SearchableDef) => React.ReactNode;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = buildDefaultState(props.fieldDefs({}));
  }

  render(): React.ReactNode {
    const tabIndex: PassableTabIndex = { value: 1 };
    const deletableClass = this.state.data.id === -1 ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>{this.props.title}</div>
        <div className={styles.row}>
          <SearchableDefList
            className={styles.itemListRoot}
            selectedDefId={this.state.data.id}
            allDefs={this.props.allDefs}
            onDefSelected={this.onDefSelected.bind(this)}
            renderTooltip={this.props.renderTooltip}
          />
          <ScrollArea className={styles.dataPanelRoot}>
            <DatabaseEditingDialogFieldID value={this.state.data.id} />
            <DatabaseEditingDialogFieldString
              def={{ type: DatabaseEditingDialogField.String, labelTexts: ["Name"], fieldNames: ["name"] }}
              value={this.state.data.name}
              onValueChange={this.applyDataChange.bind(this, "name")}
              tabIndex={tabIndex}
            />
            {this.props.fieldDefs(this.state.data).map(this.renderField.bind(this, tabIndex))}
          </ScrollArea>
        </div>
        <div className={styles.buttonPanel}>
          <div className={styles.footerButton} onClick={this.onCreateNewClicked.bind(this)}>
            {"Create New"}
          </div>
          <div className={`${styles.footerButton} ${deletableClass}`} onClick={this.onCloneClicked.bind(this)}>
            {"Clone"}
          </div>
          <div className={`${styles.footerButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
          <div className={styles.footerButton} onClick={this.onSaveClicked.bind(this)}>
            {"Save"}
          </div>
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private renderField(tabIndex: PassableTabIndex, def: DatabaseEditingDialogFieldDef, index: number): React.ReactNode {
    return renderDatabaseEditingDialogField(def, index, tabIndex, this.state.data, this.applyDataChange.bind(this));
  }

  private applyDataChange(fieldName: string, value: any): void {
    const newData: AnySearchableDef = {
      ...this.state.data,
      [fieldName]: value,
    };
    this.setState({ data: newData });
  }

  private onDefSelected(selectedDefId: number): void {
    if (selectedDefId === -1) {
      this.setState(buildDefaultState(this.props.fieldDefs({})));
    } else {
      const newData: AnySearchableDef = {
        ...this.props.allDefs[selectedDefId],
      };
      // Some data is input as a string but stored as something else, so we have to check for fields
      // that have conversion functions before we set the state.
      this.props.fieldDefs(newData).forEach((fieldDef) => {
        if (fieldDef.convertLocalDataToEditableString) {
          newData[fieldDef.fieldNames[0]] = fieldDef.convertLocalDataToEditableString(newData[fieldDef.fieldNames[0]]);
        }
      });

      this.setState({ data: newData });
    }
  }

  private onCreateNewClicked(): void {
    if (this.state.isSaving) {
      return;
    }
    // Deselects any current item and clears all data fields.
    this.setState(buildDefaultState(this.props.fieldDefs({})));
  }

  private onCloneClicked(): void {
    if (this.state.isSaving) {
      return;
    }

    // Deselects the current item by clearing the id, but retains all other fields.
    this.applyDataChange("id", -1);
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Some data is input as a string but stored as something else, so we have to check for fields
    // that have conversion functions before we pass out the data.
    const data: AnySearchableDef = {
      ...this.state.data,
    };
    this.props.fieldDefs(data).forEach((fieldDef) => {
      if (fieldDef.convertFromString) {
        data[fieldDef.fieldNames[0]] = fieldDef.convertFromString(data[fieldDef.fieldNames[0]]);
      }
    });

    // This returns the defId for the newly saved def (or the old id if the save fails, so nothing will change).
    const newDefId = await this.props.onSaveClicked(data);
    this.applyDataChange("id", newDefId);

    this.setState({ isSaving: false });
  }

  private async onDeleteClicked(): Promise<void> {
    // Should be impossible, but just in case.
    const def = this.props.allDefs[this.state.data.id];
    if (!def) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteDatabaseDef",
        content: () => (
          <BasicDialog
            title={"Please Confirm"}
            prompt={`Are you sure you wish to delete "${def.name}", id ${this.state.data.id}?  This cannot be undone.`}
            buttons={[
              {
                text: "Delete",
                onClick: async () => {
                  this.setState({ isSaving: true });
                  this.props.dispatch?.(hideModal());

                  const wasDeleted = await this.props.onDeleteConfirmed(this.state.data.id);

                  if (wasDeleted) {
                    // Delete successful, so deselect.
                    this.setState(buildDefaultState(this.props.fieldDefs({})));
                  } else {
                    this.setState({ isSaving: false });
                  }
                },
              },
              { text: "Cancel" },
            ]}
          />
        ),
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DatabaseEditingDialog = connect(mapStateToProps)(ADatabaseEditingDialog);
