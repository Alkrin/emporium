import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySoothsaying: AbilityOrProficiency = {
  id: "Soothsaying",
  name: "Soothsaying",
  description: [
    "The character has been trained to read the omens in everyday things - the throw of dice, " +
      "the flight of birds, or the leaves of tea. Once every 8 hours, he can cast Augury (as the " +
      "spell). The casting time is 10 seconds (1 round).",
  ],
  minLevel: 1,
};
