import { Dictionary } from "../../../lib/dictionary";

export enum DatabaseEditingDialogField {
  AbilityComponents,
  AbilityFilter,
  AbilityInstance,
  Boolean,
  Dictionary,
  LongString,
  LongStringArray,
  NamedValue,
  NamedValues,
  Number,
  NumberArray,
  Numbers,
  ResizableArray,
  Spells,
  String,
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
  return (arr || []).join(",");
}

export interface ExtraFieldDataNumber {
  decimalDigits: number;
}

export interface ExtraFieldDataNumberArray {
  decimalDigits: number;
  arraySize: number;
  headerText?: string;
}

export interface ExtraFieldDataResizableArray {
  /** Defines the data type of the array's contents. */
  entryDef: DatabaseEditingDialogFieldDef;
}

export interface ExtraFieldDataNamedValues {
  prompt: string;
  availableValues: [string, any][];
}

export interface ExtraFieldDataDictionary {
  fields: DatabaseEditingDialogFieldDef[];
}

export interface DatabaseEditingDialogFieldDef {
  type: DatabaseEditingDialogField;
  labelTexts: string[];
  fieldNames: string[];
  defaults?: any[];
  fieldSizes?: string[];
  extra?:
    | ExtraFieldDataDictionary
    | ExtraFieldDataNumber
    | ExtraFieldDataNumberArray
    | ExtraFieldDataResizableArray
    | ExtraFieldDataNamedValues;
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
    case DatabaseEditingDialogField.AbilityFilter: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? {
        abilityDefId: "",
        subtypes: [],
        rank: 1,
      };
      break;
    }
    case DatabaseEditingDialogField.AbilityInstance: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? {
        abilityDefId: "",
        subtype: undefined,
        rank: 1,
        minLevel: 1,
      };
      break;
    }
    case DatabaseEditingDialogField.Boolean: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? false;
      break;
    }
    case DatabaseEditingDialogField.Dictionary: {
      const defaults = {};
      if (def.extra && "fields" in def.extra) {
        def.extra.fields.forEach((subfield) => {
          // Yup, Dictionary is recursive, so we can nest data as deeply as we want.
          setDefaultValuesForFieldDef(defaults, subfield);
        });
      }
      target[def.fieldNames[0]] = defaults;
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
    case DatabaseEditingDialogField.NamedValue: {
      target[def.fieldNames[0]] = def.defaults?.[0];
      break;
    }
    case DatabaseEditingDialogField.NamedValues: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? [];
      break;
    }
    case DatabaseEditingDialogField.Number: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? 0;
      break;
    }
    case DatabaseEditingDialogField.NumberArray: {
      const defaults: number[] = [];
      if (def.extra && "arraySize" in def.extra) {
        for (let i = 0; i < def.extra.arraySize; ++i) {
          defaults[i] = def.defaults?.[i] ?? 0;
        }
      }
      target[def.fieldNames[0]] = defaults;
      break;
    }
    case DatabaseEditingDialogField.ResizableArray: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? [];
    }
    case DatabaseEditingDialogField.Spells: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? [];
      break;
    }
    case DatabaseEditingDialogField.String: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? "";
      break;
    }
    case DatabaseEditingDialogField.Numbers: {
      target[def.fieldNames[0]] = def.defaults?.[0] ?? 0;
      target[def.fieldNames[1]] = def.defaults?.[1] ?? 0;
      break;
    }
  }
}
