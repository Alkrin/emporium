import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyAnimalTraining: AbilityOrProficiency = {
  name: "Animal Training",
  description: [
    "The character knows how to breed, groom, and train a particular type of animal. " +
      "The animal can be taught simple tricks or orders. A character who wants to train " +
      "two or more different animal types must choose this proficiency more than once. " +
      "A character with proficiency in training an animal may choose a fantastic creature " +
      "of a similar type with this proficiency. For example, a bear trainer could learn " +
      "to train owlbears, or a horse trainer could learn to train pegasi. Regardless of " +
      "the type, animals must begin their training while still young." +
      "\n" +
      "Initial training, which simply makes the animal safe for handling, takes one month. " +
      "Each additional task or trick taught thereafter takes an additional 1d4 weeks. An " +
      "animal can be taught a maximum of 2d4 different tasks or tricks. The animal trainer " +
      "will only learn the animal’s limit when he reaches it.",
  ],
  minLevel: 1,
  subTypes: ["Bear", "Horse", "Owlbear", "Pegasus"],
};
