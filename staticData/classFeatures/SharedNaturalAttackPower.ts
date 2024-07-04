import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const SharedNaturalAttackPower: AbilityOrProficiency = {
  id: "Natural Attack Power.Shared",
  name: "Natural Attack Power",
  description: [
    "Increases the damage progression of the specified natural attack by one step.",
    "Increases the damage progression of the specified natural attack by two steps.",
    "Increases the damage progression of the specified natural attack by three steps.",
    "Increases the damage progression of the specified natural attack by four steps.",
    "Increases the damage progression of the specified natural attack by five steps.",
  ],
  // Subtypes can include any arbitrary string that matches the name of a natural attack.
};
