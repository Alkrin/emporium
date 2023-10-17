import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const InjuryBlind: AbilityOrProficiency = {
  id: "Injury: Blind",
  name: "Injury: Blind",
  description: [
    "The character is blind.  They receive -4 on all hit rolls, -2 on rolls to avoid " +
      "surprise, and cannot use any spells or abilities that require line of sight.",
  ],
  minLevel: 1,
};
