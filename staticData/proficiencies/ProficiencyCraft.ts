import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyCraft: AbilityOrProficiency = {
  id: "Craft",
  name: "Craft",
  description: [
    "The character has studied a guild craft and is considered an apprentice in his trade. " +
      "The character must choose the craft at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of craft proficiencies." +
      "\n" +
      "He can manufacture 10gp per month of goods." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will be " +
      "apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency roll of 11+.",
    "The character has studied a guild craft and is considered a journeyman in his trade. " +
      "The character must choose the craft at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of craft proficiencies." +
      "\n" +
      "He can manufacture 20gp per month of goods, and supervise up to 3 apprentices, increasing " +
      "their productivity by 50%." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will be " +
      "apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency roll of 7+.",
    "The character has studied a guild craft and is considered a master craftsman. " +
      "The character must choose the craft at the time he chooses the proficiency. He can spend " +
      "more proficiency selections to have several types of craft proficiencies." +
      "\n" +
      "He can manufacture 40gp per month, and supervise up to 2 journeymen and 4 apprentices, " +
      "increasing their productivity by 50%. He could work as a specialist in this craft." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will be " +
      "apparent to characters who make the appropriate Art, Craft, Knowledge, or Loremastery roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency roll of 3+.",
    "The character has studied a guild craft and considered a grand master craftsman. " +
      "The character must choose the craft at the time he chooses the proficiency. He can " +
      "spend more proficiency selections to have several types of craft proficiencies." +
      "\n" +
      "He can manufacture 80gp per month, and supervise up to 2 masters, 4 journeymen, and " +
      "8 apprentices, increasing their productivity by 50% (for a total construction rate " +
      "of 440gp per month). Working alone or with his subordinates, a grand master can create " +
      "masterwork items appropriate to his art or craft:" +
      "\n" +
      "A masterwork weapon costing 80gp extra may provide +1 to hit or +1 to damage. A masterwork " +
      "weapon costing 650gp extra provides both +1 to hit and damage. In neither case does the " +
      "weapon provide the ability to hit magical monsters, unless forged of a material otherwise " +
      "capable of doing so (e.g. silver). Additional ornaments or engraving can add to the weapon's " +
      "value without necessarily increasing the weapon's characteristics." +
      "\n" +
      "A masterwork set of armor costing 80gp extra weighs one less stone (armor or shields weighing " +
      "one stone counts as one item instead) while providing normal AC. A masterwork set of armor " +
      "costing 650gp extra provides +1 AC while weighing the same as normal. Additional ornaments " +
      "or engraving can add to the value without necessarily improving the armor's characteristics." +
      "\n" +
      "A masterwork structure costing 2 times normal gains +1 to AC or +10% to structural hit points. " +
      "A masterwork structure costing 4 times normal gains both +1 to AC and +10% to structural hit points." +
      "\n" +
      "A masterwork ship costing 2 times normal gains +1 to AC, +10% to structural hit points, or +10% " +
      "to movement rate. A masterwork ship costing 4 times normal gains any two such benefits. A masterwork " +
      "ship costing 8 times normal gains all three such benefits." +
      "\n" +
      "The process of making a weapon, shield or set of armor into a +1 or greater item automatically " +
      "transforms it into a masterwork, so the bonuses do not stack. However, enchanting masterworks " +
      "is easier than enchanting mundane items. Apply the value of the masterwork item towards the " +
      "cost of precious materials used to enchant the item." +
      "\n" +
      "A grand master craftsman who is able to create magic items due to his class level can imbue " +
      "magical effects into items he personally crafts at half the usual base time and cost. If he " +
      "has a sample or formula for the item as well, he can imbue magical effects at one-quarter " +
      "the usual base time and cost. When doing so, he may add his ranks in his Art/Craft proficiency " +
      "to the magical research throw to create the item." +
      "\n" +
      "When items made by grand masters or above are discovered, their mark or style will be apparent " +
      "to characters who make the appropriate Art, Craft, Knowledge, or Loremastery roll." +
      "\n" +
      "Can identify masterwork items, rare materials, and famous artisans with a proficiency roll of 1+.",
  ],
  minLevel: 1,
  subTypes: [
    "Armorer",
    "Bowyer",
    "Clockmaker",
    "Glassblower",
    "Jeweler",
    "Leatherworker",
    "Shipwright",
    "Smith",
    "Weaponsmith",
  ],
};
