import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const MysticProbabilityTrance: AbilityOrProficiency = {
  id: "Probability Trance.Mystic",
  name: "Probability Trance",
  description: [
    "At 4th level (Disciple), the mystic learns how to enter a " +
      "probability trance that can guide his actions towards the most " +
      "favorable paths. Entering the probability trance requires 1 turn " +
      "(10 minutes) of undisturbed meditation. The probability trance " +
      "will provide the mystic with useful information regarding a " +
      "question concerning a specific goal, event, or activity that is to " +
      "occur within one week. The future is ever-changing, so if the " +
      "mystic does not act on the information, it will quickly become " +
      "useless. The base chance of a successful probability trance is " +
      "60%, +1% per level above 4th. Weighing probabilities requires a " +
      "substantial period of subconscious contemplation; a mystic may " +
      "enter a probability trance no more than once per day, with a " +
      "night’s rest required in between. ",
  ],
  minLevel: 4,
};
