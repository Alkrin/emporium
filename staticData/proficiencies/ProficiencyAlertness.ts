import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyAlertness: AbilityOrProficiency = {
  id: "Alertness",
  name: "Alertness",
  description: [
    "The character gains a +4 bonus on any proficiency throws to hear noises and detect " +
      "secret doors. With a proficiency throw of 18+ he can notice secret doors with just " +
      "casual observation. He gains a +1 bonus to avoid surprise.",
  ],
  minLevel: 1,
};
