import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyPerformance: AbilityOrProficiency = {
  name: "Performance",
  description: [
    "The character can perform in a skilled manner. The character chooses the type of performance " +
      "that his character knows, and the character can take the proficiency several times in order " +
      "to know multiple types of performance." +
      "\n" +
      "The character is considered an apprentice in his style." +
      "\n" +
      "He can earn 10gp per month from his performances." +
      "\n" +
      "Can identify famous performers, masterpieces, and rare instruments with a proficiency throw of 11+",
    "The character can perform in a skilled manner. The character chooses the type of performance " +
      "that his character knows, and the character can take the proficiency several times in order " +
      "to know multiple types of performance." +
      "\n" +
      "The character is considered a journeyman in his style." +
      "\n" +
      "He can earn 20gp per month from his performances, and lead a troupe of up to 3 apprentices, " +
      "increasing their productivity by 50%." +
      "\n" +
      "Can identify famous performers, masterpieces, and rare instruments with a proficiency throw of 7+",
    "The character can perform in a skilled manner. The character chooses the type of performance " +
      "that his character knows, and the character can take the proficiency several times in order " +
      "to know multiple types of performance." +
      "\n" +
      "The character is considered a master in his style." +
      "\n" +
      "He can earn 40gp per month from his performances, and lead a troupe of up to 2 journeymen and " +
      "4 apprentices, increasing their productivity by 50%." +
      "\n" +
      "Can identify famous performers, masterpieces, and rare instruments with a proficiency throw of 3+",
  ],
  minLevel: 1,
  subTypes: [
    "Act",
    "Chant",
    "Dance",
    "Juggle",
    "Play Instrument",
    "Recite Poetry",
    "Sing",
    "Tell Stories",
  ],
};
