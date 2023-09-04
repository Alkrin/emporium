import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const BladeDancerMobility: AbilityOrProficiency = {
  id: "Mobility.BladeDancer",
  name: "Mobility",
  description: [
    "When able to move freely, blade dancers gain +1 to initiative. " +
      "They also gain +1/2/3 AC at levels 1/7/13 (stacks with Swashbuckling).",
  ],
  minLevel: 1,
};
