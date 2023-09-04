import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyProfession: AbilityOrProficiency = {
  id: "Profession",
  name: "Profession",
  description: [
    "The character is highly skilled at a civil profession and is considered an apprentice " +
      "in his profession.  The character must choose the profession at the time he chooses the " +
      "proficiency. He can spend more proficiency selections to have several types of profession " +
      "proficiencies." +
      "\n" +
      "He can earn 25gp per month for his services." +
      "\n" +
      "Can make expert commentary on subjects pertaining to his profession with a proficiency throw of 11+.",
    "The character is highly skilled at a civil profession and is considered a journeyman " +
      "in his profession.  The character must choose the profession at the time he chooses the " +
      "proficiency. He can spend more proficiency selections to have several types of profession " +
      "proficiencies." +
      "\n" +
      "He can earn 50gp per month for his services, and supervise up to 3 apprentices, increasing their productivity by 50%." +
      "\n" +
      "Can make expert commentary on subjects pertaining to his profession with a proficiency throw of 7+.",
    "The character is highly skilled at a civil profession and is considered a master " +
      "in his profession.  The character must choose the profession at the time he chooses the " +
      "proficiency. He can spend more proficiency selections to have several types of profession " +
      "proficiencies." +
      "\n" +
      "He can earn 100gp per month, and supervise up to 2 practitioners and 4 apprentices, increasing their productivity by 50%." +
      "\n" +
      "Can make expert commentary on subjects pertaining to his profession with a proficiency throw of 3+.",
  ],
  minLevel: 1,
  subTypes: [
    "Actuary",
    "Banker",
    "Chamberlain",
    "Judge",
    "Lawyer",
    "Librarian",
    "Merchant",
    "Restauranteur",
    "Scribe",
    "Seneschal",
    "Torturer",
  ],
};
