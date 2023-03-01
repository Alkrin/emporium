import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyArcaneDabbling: AbilityOrProficiency = {
  name: "Arcane Dabbling",
  description: [
    "The character may attempt to use wands, staffs, and other magic items only " +
      "useable by mages. At level 1, the character must make a proficiency throw of " +
      "18+ or the attempt backfires. The proficiency throw required reduces by 2 per " +
      "level, to a minimum of 3+. Note that bards automatically begin play with this " +
      "ability as part of their class.",
  ],
  minLevel: 1,
};
