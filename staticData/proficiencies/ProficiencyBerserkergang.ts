import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyBerserkergang: AbilityOrProficiency = {
  name: "Berserkergang",
  description: [
    "The character may enter a berserker rage. While enraged, he gains a +2 bonus to " +
      "attack throws and becomes immune to fear. However, the character has a -2 penalty " +
      "to AC and cannot retreat from combat. Once it has begun, a berserker rage cannot " +
      "be ended until combat ends.",
  ],
  minLevel: 1,
};
