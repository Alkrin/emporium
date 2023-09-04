import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const BardInspireCourage: AbilityOrProficiency = {
  id: "Inspire Courage.Bard",
  name: "Inspire Courage",
  description: [
    "By reciting heroic lays and epic poems, bards can inspire courage. Inspiring courage " +
      "requires a few moments of oration before a battle (one round), and grants the bard’s " +
      "allies within a 50' radius a +1 bonus to attack throws, damage rolls, morale rolls (for " +
      "monsters or NPCs allied with the bard), and saving throws against magical fear. The " +
      "bonus lasts for 10 minutes (1 turn). A bard can inspire courage in any given character " +
      "once per day per class level. (Even the most inspiring epic gets old if you hear it " +
      "twice in the same day.) A bard cannot inspire courage on characters who are already " +
      "engaged in combat.",
  ],
  minLevel: 1,
};
