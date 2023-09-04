import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyMagicalMusic: AbilityOrProficiency = {
  id: "Magical Music",
  name: "Magical Music",
  description: [
    "The character can perform music that can serenade members of the opposite gender (as a " +
      "Charm Person spell) or tame savage beasts (as a Sleep spell). The character must succeed " +
      "on an appropriate Performance proficiency throw to use Magical Music. If successful, the " +
      "charm or sleep effect begins immediately and lasts until the character stops performing. " +
      "If the character performs for a full turn (10 minutes), the effect has the duration of the " +
      "spell. Magical music has no effect if used against creatures that are already in combat." +
      "\n" +
      "If the character is not already a spellsinger, then he gains a limited ability to spellsing. " +
      "The character gets two spell points and has one 1st level spell in his repertoire, which he " +
      "casts as a 1st level spellsinger. A character already capable of spellsinging who selects " +
      "this proficiency gains an additional two spell points and can add one additional spell (of " +
      "any level he can cast) to his repertoire.",
  ],
  minLevel: 1,
};
