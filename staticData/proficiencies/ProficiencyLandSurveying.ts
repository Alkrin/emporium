import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyLandSurveying: AbilityOrProficiency = {
  id: "Land Surveying",
  name: "Land Surveying",
  description: [
    "The character is an expert at surveying the land around him. With a proficiency throw " +
      "of 11+, the character can predict dangerous sinkholes, deadfalls, collapses, or rock slides " +
      "when the character enters the area. In dungeons, an explorer with Land Surveying gains " +
      "a +4 bonus to his throws to escape detection due to his ability to find the best cover.",
  ],
  minLevel: 1,
};
