import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyFamiliar: AbilityOrProficiency = {
  id: "Familiar",
  name: "Familiar",
  description: [
    "The character gains a familiar, a magical animal companion. The familiar will be a " +
      "creature appropriate to the character's alignment and other powers (as determined by " +
      "the Judge). The familiar always has a number of Hit Dice and maximum hit points equal " +
      "to 1/2 its master's own; Intelligence equal to its master's Intelligence; and a number " +
      "of general and class proficiencies equal to its masters, selected from its master's " +
      "class list. The familiar can always understand any languages spoken by its master, and " +
      "the character will be able to understand the familiar's speech, though no one else will " +
      "without resorting to Speak With Animals. The familiar is utterly loyal to its master and " +
      "will fight for him, perform services, and generally obey his commands. While the familiar " +
      "is within 30', the character receives +1 on saving throws, but if the familiar is ever " +
      "killed, the character must save versus Death or instantly take damage equal to the familiar's " +
      "maximum total hit points. A character does not gain a new familiar if it is slain until " +
      "he has gained a level of experience.",
  ],
  minLevel: 1,
  subTypes: ["Bat", "Bird", "Cat", "Dog", "Rat", "Snake", "Squirrel", "Toad"],
};
