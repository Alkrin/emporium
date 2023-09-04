import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyMagicalEngineering: AbilityOrProficiency = {
  id: "Magical Engineering",
  name: "Magical Engineering",
  description: [
    "The character has specialized knowledge of magical items. He gains a +1 to magical research throws. " +
      "He can recognize most common magical items after careful investigation with a proficiency throw of 11+, " +
      "but is unable to recognize uncommon or unique magical items, to divine command words, to distinguish " +
      "trapped or cursed items from safe ones, or to assess the specific bonus or number of charges remaining " +
      "in an item.",
    "The character has specialized knowledge of magical items. He gains a +2 to magical research throws. " +
      "He can recognize most common magical items after careful investigation with a proficiency throw of 7+, " +
      "but is unable to recognize uncommon or unique magical items, to divine command words, to distinguish " +
      "trapped or cursed items from safe ones, or to assess the specific bonus or number of charges remaining " +
      "in an item.",
    "The character has specialized knowledge of magical items. He gains a +3 to magical research throws. " +
      "He can recognize most common magical items after careful investigation with a proficiency throw of 3+, " +
      "but is unable to recognize uncommon or unique magical items, to divine command words, to distinguish " +
      "trapped or cursed items from safe ones, or to assess the specific bonus or number of charges remaining " +
      "in an item.",
  ],
  minLevel: 1,
};
