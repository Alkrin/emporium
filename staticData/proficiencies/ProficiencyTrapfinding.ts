import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyTrapfinding: AbilityOrProficiency = {
  name: "Trapfinding",
  description: [
    "The character is an expert trap finder, receiving a +2 bonus on proficiency throws to find " +
      "and remove traps. He may find a trap in one round (rather than one turn) by making a successful " +
      "proficiency throw with a -4 penalty.",
  ],
  minLevel: 1,
};
