import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyLanguage: AbilityOrProficiency = {
  id: "Language",
  name: "Language",
  description: [
    "This proficiency enables the character to learn to speak, read, and write an additional language. " +
      "The character's level of literacy with the new language is determined by his Intelligence. Characters " +
      "with an Intelligence of 8 or less are generally illiterate. However, this proficiency can be taken " +
      "by a character with a low Intelligence (8 or less) in order to become literate in a language the " +
      "character already speaks.",
  ],
  subTypes: [
    "Common",
    "Draconic",
    "Dwarven",
    "Elven",
    "Gnoll",
    "Gnome",
    "Goat",
    "Goblin",
    "Hobgoblin",
    "Kobold",
    "Orc",
    "Turtle",
  ],
};
