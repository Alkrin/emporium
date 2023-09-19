import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyKnowledge: AbilityOrProficiency = {
  id: "Knowledge",
  name: "Knowledge",
  description: [
    "The character has made a specialized study of a particular field. The character can " +
      "usually make his living by acting as an expert on the subject. With a proficiency throw " +
      "of 11+, the character can recall expert commentary or information relating to his area " +
      "of knowledge. The character must choose his area of knowledge at the time he chooses " +
      "the proficiency. He can spend more proficiency selections to have several different " +
      "areas of knowledge.",
    "The character has made a specialized study of a particular field. The character can " +
      "usually make his living by acting as an expert on the subject. With a proficiency throw " +
      "of 7+, the character can recall expert commentary or information relating to his area " +
      "of knowledge. The character must choose his area of knowledge at the time he chooses " +
      "the proficiency. He can spend more proficiency selections to have several different " +
      "areas of knowledge.  He is an expert in the subject and can train students and write " +
      "books on the topic.",
    "The character has made a specialized study of a particular field. The character can " +
      "usually make his living by acting as an expert on the subject. With a proficiency throw " +
      "of 3+, the character can recall expert commentary or information relating to his area " +
      "of knowledge. The character must choose his area of knowledge at the time he chooses " +
      "the proficiency. He can spend more proficiency selections to have several different " +
      "areas of knowledge.  He is an expert in the subject and can train students and write " +
      "books on the topic.  He could work as a sage of the subject (as described in Specialists " +
      "in Chapter 3).",
  ],
  minLevel: 1,
  subTypes: [
    "Architecture",
    "Astrology",
    "Geography",
    "History",
    "Mathematics",
    "Metaphysics",
    "Natural History",
    "Natural Philosophy",
    "Political Economy",
    "Political History",
  ],
};
