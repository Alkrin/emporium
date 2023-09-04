import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const FighterBattlefieldProwess: AbilityOrProficiency = {
  id: "Battlefield Prowess.Fighter",
  name: "Battlefield Prowess",
  description: [
    "When a fighter reaches 5th level (Exemplar), his battlefield " +
      "prowess inspires others to follow him. Any henchmen and " +
      "mercenaries hired by the fighter gain a +1 bonus to their morale " +
      "score whenever he personally leads them. This bonus stacks " +
      "with any modifiers from the fighter’s Charisma or proficiencies.",
  ],
  minLevel: 5,
};
