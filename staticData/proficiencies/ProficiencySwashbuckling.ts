import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySwashbuckling: AbilityOrProficiency = {
  id: "Swashbuckling",
  name: "Swashbuckling",
  description: [
    "The character gains a +1 bonus to Armor Class if wearing leather armor or less and able to " +
      "move freely. At level 7, this bonus increases to +2, and at level 13 the bonus increases to +3.",
  ],
  minLevel: 1,
};
