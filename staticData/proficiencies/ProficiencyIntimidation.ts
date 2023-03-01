import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyIntimidation: AbilityOrProficiency = {
  name: "Intimidation",
  description: [
    "The character knows how to bully others to get what he wants. He receives a +2 bonus " +
      "on all reaction rolls when implicitly or explicitly threatening violence or dire consequences. " +
      "The targets must be 5 HD or less, or the character and his allies must outnumber or grossly " +
      "outrank the targets.",
  ],
  minLevel: 1,
};
