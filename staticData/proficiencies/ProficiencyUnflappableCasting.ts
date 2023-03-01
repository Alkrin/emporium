import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyUnflappableCasting: AbilityOrProficiency = {
  name: "Unflappable Casting",
  description: [
    "When the character loses a spell by being interrupted or taking damage during the round, " +
      "he does not lose his action for the round. While he still loses the spell, he may now move " +
      "and attack normally. Characters without this proficiency lose the opportunity to act at all " +
      "if they are interrupted while casting a spell. See Casting Spells in Chapter 5 and Chapter 6.",
  ],
  minLevel: 1,
};
