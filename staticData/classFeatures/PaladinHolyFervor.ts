import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const PaladinHolyFervor: AbilityOrProficiency = {
  id: "Holy Fervor.Paladin",
  name: "Holy Fervor",
  description: [
    "When a paladin reaches 5th level (Guardian), his holy fervor " +
      "inspires others to follow him. Any hirelings of the same religion " +
      "as the paladin gain a +1 bonus to their morale score whenever " +
      "he is present. This bonus stacks with any modifiers from the " +
      "paladin’s Charisma or proficiencies.",
  ],
  minLevel: 5,
};
