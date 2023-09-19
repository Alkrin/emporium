import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyBattleMagic: AbilityOrProficiency = {
  id: "Battle Magic",
  name: "Battle Magic",
  description: [
    "The character gains a +1 initiative bonus when casting spells. He is considered " +
      "2 class levels higher than his actual level of experience for purposes of dispelling " +
      "magic or penetrating a target's magic resistance.",
  ],
  minLevel: 1,
};
