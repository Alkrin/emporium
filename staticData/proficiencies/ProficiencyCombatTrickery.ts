import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyCombatTrickery: AbilityOrProficiency = {
  id: "Combat Trickery",
  name: "Combat Trickery",
  description: [
    "When the character attempts the chosen maneuver in combat, the to hit penalty is " +
      "reduced by 2 (e.g. from -4 to -2), and his opponent suffers a -2 penalty to his saving " +
      "throw to resist it. In addition, anytime the character lands a critical hit, he may " +
      "apply his special maneuver as an effect in lieu of the outcome he rolled if desired. " +
      "A character may take Combat Trickery multiple times, selecting an additional special " +
      "maneuver to learn each time.",
  ],
  subTypes: ["Disarm", "Force Back", "Incapacitate", "Knock Down", "Overrun", "Sunder", "Wrestle"],
};
