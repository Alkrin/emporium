import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyAlchemy: AbilityOrProficiency = {
  name: "Alchemy",
  description: [
    "Can identify common alchemical substances, potions, and poisons with a proficiency " +
      "throw of 11+. A character already capable of brewing potions because of his class level " +
      "may add his Alchemy ranks to his Magic Research throws when brewing potions.",
    "Can identify common alchemical substances, potions, and poisons with a proficiency " +
      "throw of 7+. A character already capable of brewing potions because of his class level " +
      "may add his Alchemy ranks to his Magic Research throws when brewing potions.",
    "Can identify common alchemical substances, potions, and poisons with a proficiency " +
      "throw of 3+. He can work as an apothecary or alchemical assistant plus is an alchemist " +
      "himself, and may brew potions as if he were a 5th level mage, but at twice the base " +
      "time and cost. A character already capable of brewing potions because of his class " +
      "level may add his Alchemy ranks to his Magic Research throws when brewing potions, and " +
      "can brew potions at half the usual base time and cost.",
  ],
  minLevel: 1,
};
