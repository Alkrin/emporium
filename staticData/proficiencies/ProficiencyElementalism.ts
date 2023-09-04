import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyElementalism: AbilityOrProficiency = {
  id: "Elementalism",
  name: "Elementalism",
  description: [
    "Spells using this element do +1 damage per die and impose a -2 saving throw " +
      "penalty on the target. Elementals summoned from this element gain +1 hp per " +
      "Hit Die. The character’s magic missiles can be considered to be of this element, " +
      "if he desires.",
  ],
  minLevel: 1,
  subTypes: ["Air", "Earth", "Fire", "Lightning", "Water"],
};
