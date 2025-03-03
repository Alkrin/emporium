import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { CharacterStat } from "../types/characterClasses";
import { AbilityComponent } from "./abilityComponent";

const statOptions: [string, string][] = [["---", "---"]];
statOptions.push(
  ...Object.values(CharacterStat)
    .sort()
    .map((wc) => {
      const entry: [string, string] = [wc, wc];
      return entry;
    })
);

export const AbilityComponentCharacterStatOverride: AbilityComponent = {
  id: "CharacterStatOverride",
  name: "Character Stat Override",
  description:
    "Replaces a single character stat with a fixed value.  If multiple overrides are present, the highest value is chosen.",
  fields: [
    {
      type: DatabaseEditingDialogField.NamedValue,
      labelTexts: ["Character Stat"],
      fieldNames: ["stat"],
      extra: {
        prompt: "Which character stat will be overridden?",
        availableValues: statOptions,
      },
    },
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Stat Value"],
      fieldNames: ["value"],
    },
  ],
};

export interface AbilityComponentCharacterStatOverrideData {
  stat: CharacterStat | "---";
  value: number;
}
