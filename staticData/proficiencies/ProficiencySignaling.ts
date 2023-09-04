import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySignaling: AbilityOrProficiency = {
  id: "Signaling",
  name: "Signaling",
  description: [
    "The character knows how to transmit messages to other signaling specialists of the " +
      "same military force, culture, trade guild, or other organization. This is similar to " +
      "learning an additional language. The character must specify the style and culture of " +
      "signals that he has learned when he takes this proficiency.",
  ],
  minLevel: 1,
  subTypes: ["Cavalry Trumpets", "Naval Flags", "Smoke Signals"],
};
