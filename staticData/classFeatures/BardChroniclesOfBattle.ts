import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const BardChroniclesOfBattle: AbilityOrProficiency = {
  id: "Chronicles Of Battle.Bard",
  name: "Chronicles Of Battle",
  description: [
    "When a bard reaches 5th level (Chronicler), his Chronicles Of " +
      "Battle inspire his hirelings to strive for glory. Any henchmen and " +
      "mercenaries hired by the bard gain a +1 bonus to their morale " +
      "score if the bard is there to witness and record their deeds. This " +
      "bonus stacks with any modifiers from the bard’s Charisma or " +
      "proficiencies.",
  ],
  minLevel: 5,
};
