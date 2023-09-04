import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyArmorTraining: AbilityOrProficiency = {
  id: "Armor Training",
  name: "Armor Training",
  description: [
    "The character may fight wearing armor up to 2 points heavier than normally permitted by " +
      "his class without penalty. Armor Training proficiency does not grant the character the " +
      "ability to cast spells in armor, use thief skills in armor heavier than leather, or benefit " +
      "from proficiencies or class powers that forbid use of certain armor.",
  ],
  minLevel: 1,
};
