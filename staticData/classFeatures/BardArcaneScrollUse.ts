import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const BardArcaneScrollUse: AbilityOrProficiency = {
  id: "Arcane Scroll Use.Bard",
  name: "Arcane Scroll Use",
  description: [
    "At 10th level, the bard can read and cast magic from arcane " +
      "scrolls with a proficiency throw of 3+ on 1d20. However, a " +
      "failed throw means the spell does not function as expected, and " +
      "can create a horrible effect at the Judge's discretion.",
  ],
  minLevel: 10,
};
