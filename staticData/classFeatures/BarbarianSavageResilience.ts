import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const BarbarianSavageResilience: AbilityOrProficiency = {
  id: "Savage Resilience.Barbarian",
  name: "Savage Resilience",
  description: [
    "When a barbarian is required to consult the " +
      "Mortal Wounds table, the player may roll twice and " +
      "choose the preferred result to apply. Barbarians also " +
      "subtract their class level from the number of days of " +
      "bed rest required to recover.",
  ],
  minLevel: 1,
};
