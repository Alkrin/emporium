import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ExplorerExplorationBonuses: AbilityOrProficiency = {
  id: "Exploration Bonuses.Explorer",
  name: "Exploration Bonuses",
  description: [
    "Parties guided by explorers gain significant advantages on " +
      "wilderness adventures. Any time the explorer’s party is in " +
      "country familiar to the explorer, they get a +4 bonus on " +
      "proficiency throws to avoid getting lost. In any terrain except " +
      "clear and grassland terrain, the explorer’s party receives a +5 " +
      "bonus to proficiency throws to evade wilderness encounters. " +
      "A party guided by an explorer can evade wilderness encounters " +
      "even when surprised on a proficiency throw of 19+.",
  ],
  minLevel: 1,
};
