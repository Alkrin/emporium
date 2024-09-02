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
import { DatabaseEditingDialogFieldTwoNumbers } from "./DatabaseEditingDialogFieldTwoNumbers";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { BasicDialog } from "../../dialogs/BasicDialog";
import { DatabaseEditingDialogFieldBoolean } from "./DatabaseEditingDialogFieldBoolean";
import { DatabaseEditingDialogFieldSpells } from "./DatabaseEditingDialogFieldSpells";

export enum DatabaseEditingDialogField {
  Boolean,
  LongString,
  Number,
  Spells,
  String,
  TwoNumbers,
}

export function Database_StringToStringArray(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length > 0) {
    return text.split(",");
  } else {
    return [];
  }
}

export function Database_StringArrayToString(arr: string[]): string {
  return arr.join(",");
}

export interface DatabaseEditingDialogFieldDef {
  type: DatabaseEditingDialogField;
  labelTexts: string[];
  fieldNames: string[];
  defaults?: any[];
  fieldSizes?: string[];
  decimalDigits?: number;
  /** If the data is input as a string but stored in another format, this function will be used to convert the string data. */
  convertToString?: (data: any) => string;
  /** If the data is input as a string but stored in another format, this function will be used to convert the data to a string. */
  convertFromString?: (text: string) => any;
}

type AnySearchableDef = SearchableDef & {
  [key: string]: any;
};

interface State {
  data: AnySearchableDef;
  isSaving: boolean;
}

function buildDefaultState(fieldDefs: DatabaseEditingDialogFieldDef[]) {
  const defaultState: State = {
    data: {
      id: -1,
      name: "",
    },
    isSaving: false,
  };

  fieldDefs.forEach((def) => {
    switch (def.type) {
      case DatabaseEditingDialogField.Boolean: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? false;
      }
      case DatabaseEditingDialogField.LongString: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? "";
        break;
      }
      case DatabaseEditingDialogField.Number: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? 0;
        break;
      }
      case DatabaseEditingDialogField.Spells: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? [];
        break;
      }
      case DatabaseEditingDialogField.String: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? "";
        break;
      }
      case DatabaseEditingDialogField.TwoNumbers: {
        defaultState.data[def.fieldNames[0]] = def?.defaults?.[0] ?? 0;
        defaultState.data[def.fieldNames[1]] = def?.defaults?.[1] ?? 0;
        break;
      }
    }
  });

  return defaultState;
}

interface ReactProps {
  title: string;
  allDefs: Dictionary<SearchableDef>;
  fieldDefs: DatabaseEditingDialogFieldDef[];
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
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = buildDefaultState(props.fieldDefs);
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
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
              tabIndex={this.nextTabIndex++}
            />
            {this.props.fieldDefs.map(this.renderField.bind(this))}
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

  private renderField(def: DatabaseEditingDialogFieldDef, index: number): React.ReactNode {
    switch (def.type) {
      case DatabaseEditingDialogField.Boolean: {
        return (
          <DatabaseEditingDialogFieldBoolean
            key={index}
            tabIndex={this.nextTabIndex++}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
          />
        );
      }
      case DatabaseEditingDialogField.LongString: {
        return (
          <DatabaseEditingDialogFieldLongString
            key={index}
            tabIndex={this.nextTabIndex++}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
          />
        );
      }
      case DatabaseEditingDialogField.Number: {
        return (
          <DatabaseEditingDialogFieldNumber
            key={index}
            tabIndex={this.nextTabIndex++}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
          />
        );
      }
      case DatabaseEditingDialogField.Spells: {
        return (
          <DatabaseEditingDialogFieldSpells
            key={index}
            tabIndex={this.nextTabIndex++}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
          />
        );
      }
      case DatabaseEditingDialogField.String: {
        return (
          <DatabaseEditingDialogFieldString
            key={index}
            tabIndex={this.nextTabIndex++}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
          />
        );
      }
      case DatabaseEditingDialogField.TwoNumbers: {
        return (
          <DatabaseEditingDialogFieldTwoNumbers
            key={index}
            tabIndex={(this.nextTabIndex += 2)}
            def={def}
            value={this.state.data[def.fieldNames[0]]}
            onValueChange={this.applyDataChange.bind(this, def.fieldNames[0])}
            secondValue={this.state.data[def.fieldNames[1]]}
            onSecondValueChange={this.applyDataChange.bind(this, def.fieldNames[1])}
          />
        );
      }
    }
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
      this.setState(buildDefaultState(this.props.fieldDefs));
    } else {
      const newData: AnySearchableDef = {
        ...this.props.allDefs[selectedDefId],
      };
      // Some data is input as a string but stored as something else, so we have to check for fields
      // that have conversion functions before we set the state.
      this.props.fieldDefs.forEach((fieldDef) => {
        if (fieldDef.convertToString) {
          newData[fieldDef.fieldNames[0]] = fieldDef.convertToString(newData[fieldDef.fieldNames[0]]);
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
    this.setState(buildDefaultState(this.props.fieldDefs));
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
    this.props.fieldDefs.forEach((fieldDef) => {
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
                    this.setState(buildDefaultState(this.props.fieldDefs));
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
