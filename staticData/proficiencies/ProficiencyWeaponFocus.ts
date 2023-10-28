import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyWeaponFocus: AbilityOrProficiency = {
  id: "Weapon Focus",
  name: "Weapon Focus",
  description: [
    "When using a favored type of weapon, the character is capable of devastating strikes. " +
      "On an attack throw scoring an unmodified 20 when using his favored weapon, the character " +
      "inflicts double normal damage. A character may take this proficiency multiple times, " +
      "selecting an additional Weapon Focus each time. Weapon Focus does not allow a character " +
      "to use weapons not available to his class.",
  ],
  subTypes: [
    "Axes",
    "Bows/Crossbows",
    "Flails/Hammers/Maces",
    "Swords/Daggers",
    "Spears/Pole Arms",
    "Slings and Thrown Weapons",
  ],
};
