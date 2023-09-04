import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const SharedMeleeDamageBonus: AbilityOrProficiency = {
  id: "Melee Damage Bonus.Shared",
  name: "Melee Damage Bonus",
  description: [
    "Increases damage from all melee attacks by +1 at 1st level, +2 at 3rd, +3 at 6th, +4 at 9th, and +5 at 12th.",
  ],
  minLevel: 1,
};
