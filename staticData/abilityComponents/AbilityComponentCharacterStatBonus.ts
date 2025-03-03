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

export const AbilityComponentCharacterStatBonus: AbilityComponent = {
  id: "CharacterStatBonus",
  name: "Character Stat Bonus",
  description: "Applies a fixed bonus or penalty to a single character stat.",
  fields: [
    {
      type: DatabaseEditingDialogField.NamedValue,
      labelTexts: ["Character Stat"],
      fieldNames: ["stat"],
      extra: {
        prompt: "Which character stat will be altered?",
        availableValues: statOptions,
      },
    },
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentCharacterStatBonusData {
  stat: CharacterStat | "---";
  bonus: number;
}
