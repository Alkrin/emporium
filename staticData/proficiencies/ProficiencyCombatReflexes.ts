import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyCombatReflexes: AbilityOrProficiency = {
  name: "Combat Reflexes",
  description: [
    "True warriors never hesitate in combat. The character gains a +1 bonus on surprise " +
      "rolls and initiative rolls. This bonus does not apply when casting spells.",
  ],
  minLevel: 1,
};
