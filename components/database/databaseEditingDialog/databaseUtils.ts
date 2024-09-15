import { Dictionary } from "../../../lib/dictionary";

export enum DatabaseEditingDialogField {
  AbilityComponents,
  Boolean,
  LongString,
  LongStringArray,
  Number,
  SelectableStrings,
  Spells,
  String,
  TwoNumbers,
}

export function Database_StringToStringArray(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length > 0) {
    return trimmed.split(",");
  } else {
    return [];
  }
}

export function Database_StringArrayToString(arr: string[]): string {
  return arr.join(",");
}

export interface ExtraFieldDataNumber {
  decimalDigits: number;
}

export interface ExtraFieldDataSelectableStrings {
  validStrings: string[];
}

export interface DatabaseEditingDialogFieldDef {
  type: DatabaseEditingDialogField;
  labelTexts: string[];
  fieldNames: string[];
  defaults?: any[];
  fieldSizes?: string[];
  extra?: ExtraFieldDataNumber | ExtraFieldDataSelectableStrings;
  /** If the data is input as a string but stored in another format, this function will be used to convert the string data. */
  convertLocalDataToEditableString?: (data: any) => string;
  /** If the data is input as a string but stored in another format, this function will be used to convert the data to a string. */
  convertFromString?: (text: string) => any;
}

export function setDefaultValuesForFieldDef(target: Dictionary<any>, def: DatabaseEditingDialogFieldDef): any {
  switch (def.type) {
    case DatabaseEditingDialogField.AbilityComponents: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? {};
      break;
    }
    case DatabaseEditingDialogField.Boolean: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? false;
      break;
    }
    case DatabaseEditingDialogField.LongString: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? "";
      break;
    }
    case DatabaseEditingDialogField.LongStringArray: {
      const theArray: string[] = [];
      for (let i = 0; i < def.labelTexts.length; ++i) {
        theArray[i] = def.defaults?.[i] ?? "";
      }
      target[def.fieldNames[0]] = theArray;
      break;
    }
    case DatabaseEditingDialogField.Number: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? 0;
      break;
    }
    case DatabaseEditingDialogField.SelectableStrings: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? [];
      break;
    }
    case DatabaseEditingDialogField.Spells: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? [];
      break;
    }
    case DatabaseEditingDialogField.String: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? "";
      break;
    }
    case DatabaseEditingDialogField.TwoNumbers: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? 0;
      target[def.fieldNames[1]] = def.defaults?.[1] ?? 0;
      break;
    }
  }
}
