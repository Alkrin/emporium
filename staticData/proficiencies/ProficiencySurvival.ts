import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySurvival: AbilityOrProficiency = {
  id: "Survival",
  name: "Survival",
  description: [
    "The character is an expert at hunting small game, gathering fruits and vegetables, and " +
      "finding water and shelter. The character forages enough food to feed himself automatically, " +
      "even when on the move, so long as he is in a fairly fertile area. If he is trying to supply " +
      "more than one person, he must make a proficiency throw (as described in Wilderness Adventures), " +
      "but gains a +4 bonus on the roll.",
  ],
  minLevel: 1,
};
