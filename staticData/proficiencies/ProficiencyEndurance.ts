import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyEndurance: AbilityOrProficiency = {
  name: "Endurance",
  description: [
    "The character is nearly tireless. He does not need to rest every 6 turns. He can " +
      "force march for one day without penalty, plus one additional day for each point of " +
      "Constitution bonus.",
  ],
  minLevel: 1,
};
