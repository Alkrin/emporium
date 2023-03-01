import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyRiding: AbilityOrProficiency = {
  name: "Riding",
  description: [
    "The character knows not only the care and feeding of a riding animal, but also how " +
      "to handle it under difficult circumstances, such as using a weapon from its back. " +
      "For each type of animal, this proficiency must be selected separately. This proficiency " +
      "is not required to simply ride a domesticated animal under non-combat conditions.",
  ],
  minLevel: 1,
  subTypes: ["Dragon", "Giant Eagle", "Horse", "Pegasus"],
};
