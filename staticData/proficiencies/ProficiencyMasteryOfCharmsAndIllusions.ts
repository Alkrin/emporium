import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyMasteryOfCharmsAndIllusions: AbilityOrProficiency = {
  id: "Mastery of Charms and Illusions",
  name: "Mastery of Charms and Illusions",
  description: [
    "When the character casts enchantment spells (such as charm person) or illusion spells " +
      "(such as phantasmal force), the spell effects are calculated as if he were two class " +
      "levels higher than his actual level of experience. Targets of his enchantment spells " +
      "suffer a -2 penalty to their saving throw, as do those who attempt to disbelieve his " +
      "illusions. If the character has this proficiency and the mastery of domination and " +
      "deception class power, the character can cast enchantments and illusions as if he were " +
      "three (rather than two) caster levels higher than his actual caster level, and targets " +
      "suffer a -3 penalty to their saving throws.",
  ],
  minLevel: 1,
};
