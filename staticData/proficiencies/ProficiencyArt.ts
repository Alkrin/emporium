import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyArt: AbilityOrProficiency = {
  id: "Art",
  name: "Art",
  description: [
    "The character has studied a fine art and is considered an apprentice in his trade. " +
      "The character must choose the art at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of art proficiencies." +
      "\n" +
      "He can manufacture 10gp per month of goods." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will " +
      "be apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery " +
      "roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency " +
      "throw of 11+",
    "The character has studied a fine art and is considered a journeyman in his trade. " +
      "The character must choose the art at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of art proficiencies." +
      "\n" +
      "He can manufacture 20gp per month of goods, and supervise up to 3 apprentices, increasing " +
      "their productivity by 50%." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will " +
      "be apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery " +
      "roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency " +
      "throw of 9+",
    "The character has studied a fine art and is considered a master artist. " +
      "The character must choose the art at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of art proficiencies." +
      "\n" +
      "He can manufacture 40gp per month, and supervise up to 2 journeymen and 4 apprentices, " +
      "increasing their productivity by 50%. He could work as a specialist in this art." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will " +
      "be apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery " +
      "roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency " +
      "throw of 7+",
    "The character has studied a fine art and is considered an apprentice in his trade. " +
      "The character must choose the art at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of art proficiencies." +
      "\n" +
      "He can manufacture 80gp per month, and supervise up to 2 masters, 4 journeymen, and " +
      "8 apprentices, increasing their productivity by 50% (for a total construction rate " +
      "of 440gp per month). Working alone or with his subordinates, a grand master can create " +
      "masterwork items appropriate to his art." +
      "\n" +
      "A miscellaneous piece of masterwork art or craftsmanship may be of such beauty and " +
      "quality as to be worth anywhere from 2 to 100 times normal value." +
      "\n" +
      "A grand master artist who is able to create magic items due to his class level can " +
      "imbue magical effects into items he personally crafts at half the usual base time and " +
      "cost. If he has a sample or formula for the item as well, he can imbue magical effects " +
      "at one-quarter the usual base time and cost. When doing so, he may add his ranks in " +
      "his Art proficiency to the magical research throw to create the item." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will " +
      "be apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery " +
      "roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency " +
      "throw of 5+",
  ],
  minLevel: 1,
  subTypes: ["Mosaic", "Painting", "Pottery", "Sculpture"],
};
