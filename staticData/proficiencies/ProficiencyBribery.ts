import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyBribery: AbilityOrProficiency = {
  id: "Bribery",
  name: "Bribery",
  description: [
    "The character is exceptionally skilled at bribing officials with gifts of money or " +
      "merchandise. Offering a bribe permits an additional reaction roll during encounters, " +
      "with the throw modified by the size of the bribe. As a general rule, a bribe equal " +
      "to one day's pay for the target provides a +1 bonus, a week's pay provides a +2 bonus, " +
      "and a month's pay provides a +3 bonus. Only one bribe can be attempted per target in " +
      "any given situation.",
  ],
  minLevel: 1,
};
