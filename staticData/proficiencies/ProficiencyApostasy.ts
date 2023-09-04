import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyApostasy: AbilityOrProficiency = {
  id: "Apostasy",
  name: "Apostasy",
  description: [
    "The character has learned knowledge forbidden to his order. He may select 4 divine spells " +
      "not normally available to worshippers of his god and add them to his repertoire.  If a ceremonialist, " +
      "the character may select 4 eldritch ceremonies and add them to his repertoire of ceremonies " +
      "known. If an eldritch spellcaster, the character may select 3 eldritch spells and add them " +
      "to his repertoire of spells known. If the ceremonies or spells selected with this proficiency " +
      "are above the level that the character is permitted to know, he will add them to his repertoire " +
      "when he reaches the appropriate level.",
  ],
  minLevel: 1,
};
