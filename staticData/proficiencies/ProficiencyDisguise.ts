import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyDisguise: AbilityOrProficiency = {
  name: "Disguise",
  description: [
    "The character can make someone look like someone else through make-up and clothing. " +
      "A successful Disguise requires a proficiency throw of 11+. Someone who is intimately " +
      "familiar with the subject of the disguise may throw 14+ to see through it, adding their " +
      "Wisdom modifier to their die roll.",
  ],
  minLevel: 1,
};
