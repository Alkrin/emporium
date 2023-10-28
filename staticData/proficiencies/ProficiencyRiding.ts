import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyRiding: AbilityOrProficiency = {
  id: "Riding",
  name: "Riding",
  description: [
    "The character knows not only the care and feeding of a riding animal, but also how " +
      "to handle it under difficult circumstances, such as using a weapon from its back. " +
      "For each type of animal, this proficiency must be selected separately. This proficiency " +
      "is not required to simply ride a domesticated animal under non-combat conditions.",
  ],
  subTypes: ["Dragon", "Giant Eagle", "Griffon", "Horse", "Pegasus"],
};
