import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyLayOnHands: AbilityOrProficiency = {
  id: "Lay On Hands",
  name: "Lay On Hands",
  description: [
    "The character can heal himself or another by laying on hands once per day. The character " +
      "healed recovers hp as if he had rested for one day per two levels of the healer (rounded up).",
    "The character can heal himself or another by laying on hands twice per day. The character " +
      "healed recovers hp as if he had rested for one day per two levels of the healer (rounded up).",
    "The character can heal himself or another by laying on hands thrice per day. The character " +
      "healed recovers hp as if he had rested for one day per two levels of the healer (rounded up).",
    "The character can heal himself or another by laying on hands four times per day. The character " +
      "healed recovers hp as if he had rested for one day per two levels of the healer (rounded up).",
  ],
  minLevel: 1,
};
