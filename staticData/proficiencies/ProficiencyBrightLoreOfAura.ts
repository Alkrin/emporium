import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyBrightLoreOfAura: AbilityOrProficiency = {
  id: "Bright Lore of Aura",
  name: "Bright Lore of Aura",
  description: [
    "The character has studied the white magic of the Empyreans. The character can turn " +
      "undead as a cleric of one half his class level (rounded up). If the character casts " +
      "spells that require a saving throw versus Paralysis, his targets suffer a -2 penalty " +
      "on the save. When the character casts protection spells, the spell effects are calculated " +
      "as if he were two caster levels higher than his actual caster level. If the character " +
      "has this proficiency and the Bright Lore class power, the character can turn undead " +
      "as a cleric of two-thirds his class level (rounded up), and his protection spells are " +
      "calculated as if he were three (rather than two) caster levels higher than his actual " +
      "caster level.",
  ],
  minLevel: 1,
};
