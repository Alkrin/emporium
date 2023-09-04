import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySeafaring: AbilityOrProficiency = {
  id: "Seafaring",
  name: "Seafaring",
  description: [
    "The character can crew large sailing ships or galleys.",
    "The character can crew large sailing ships or galleys and can serve as a captain " +
      "on a seagoing vessel, as described in Specialists.",
    "The character can crew large sailing ships or galleys and can serve as a captain " +
      "on a seagoing vessel, as described in Specialists." +
      "\n" +
      "He is a master mariner. When tacking, a master mariner's ship has its movement rate " +
      "reduced by only one category rather than by two (as described in the Wilderness Adventures " +
      "section), and his ship's chance to evade is increased by +5.",
  ],
  minLevel: 1,
};
