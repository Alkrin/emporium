import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AllLanguagesArray, Language } from "../../lib/languages";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentLanguageCapability: AbilityComponent = {
  id: "LanguageCapability",
  name: "Language, Capability",
  description: "Grants the character the ability to speak (and potentially read/write) a single language.",
  fields: [
    {
      type: DatabaseEditingDialogField.NamedValue,
      labelTexts: ["Language"],
      fieldNames: ["language"],
      defaults: [""],
      extra: {
        prompt: "Select a single language to be granted by this ability component.",
        availableValues: AllLanguagesArray.map((l) => [l, l]),
      },
    },
  ],
};

export interface AbilityComponentLanguageCapabilityData {
  /** The specific language granted. */
  language: Language;
}
