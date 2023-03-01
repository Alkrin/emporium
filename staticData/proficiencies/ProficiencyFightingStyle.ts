import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyFightingStyle: AbilityOrProficiency = {
  name: "FightingStyle",
  description: [
    "The character chooses to become proficient in a particular fighting style, " +
      "such as two weapon fighting or weapon and shield. Because of his familiarity " +
      "with the fighting style, a proficient character may draw his weapon(s) and/or " +
      "ready his shield without having to give up an opportunity to move or attack. " +
      "In addition, each fighting style provides a special bonus when the character " +
      "is fighting in that style. The fighting styles and their bonuses are listed below." +
      "\n" +
      "Pole weapon +1 to initiative rolls" +
      "Missile weapon +1 to attack throws" +
      "Single weapon +1 to attack throws" +
      "Two weapons +1 to attack throws" +
      "Two-handed weapon +1 to damage rolls" +
      "Weapon and shield +1 to armor class" +
      "\n" +
      "Bonuses are in addition to the standard bonuses for fighting in the given manner. " +
      "For instance, a character with weapon and shield fighting style proficiency gains " +
      "a total improvement to his AC of 2 points. A character may take this proficiency " +
      "multiple times, selecting an additional fighting style each time. If a character " +
      "has two fighting styles that might be applicable in a given fight, he may only " +
      "apply the bonus for one style in any given round. For example, if a character " +
      "armed with a spear and a shield has both the pole weapon and weapon and shield " +
      "fighting style proficiencies, he must choose between +1 initiative rolls or +1 " +
      "to AC, but not both.",
  ],
  minLevel: 1,
  subTypes: [
    "Pole Weapon",
    "Missile Weapon",
    "Single Weapon",
    "Two Weapons",
    "Two-handed Weapon",
    "Weapon and Shield",
  ],
};
