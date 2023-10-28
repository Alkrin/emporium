import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const SharedInspireCourage: AbilityOrProficiency = {
  id: "Inspire Courage.Shared",
  name: "Inspire Courage",
  description: [
    "By reciting heroic lays and epic poems, the character can inspire courage. Inspiring courage " +
      "requires a few moments of oration before a battle (one round), and grants the character's " +
      "allies within a 50' radius a +1 bonus to attack throws, damage rolls, morale rolls (for " +
      "monsters or NPCs allied with the character), and saving throws against magical fear. The " +
      "bonus lasts for 10 minutes (1 turn). The character can inspire courage in any given target " +
      "once per day per class level. (Even the most inspiring epic gets old if you hear it " +
      "twice in the same day.) This ability cannot inspire courage on characters who are already " +
      "engaged in combat.",
  ],
};
