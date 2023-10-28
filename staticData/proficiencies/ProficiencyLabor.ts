import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyLabor: AbilityOrProficiency = {
  id: "Labor",
  name: "Labor",
  description: [
    "The character is highly proficient at a particular type of physical labor. The character " +
      "can make his living off his labors, earning 3-12gp per month. With a proficiency throw of " +
      "11+, the character can interpret information in light of his skill. A character may learn " +
      "other labor proficiencies by taking this proficiency multiple times. Labor does not require " +
      "enough skill to be able to be improved by taking this proficiency multiple times.",
  ],
  subTypes: ["Bricklaying", "Farming", "Mining", "Stonecutting"],
};
