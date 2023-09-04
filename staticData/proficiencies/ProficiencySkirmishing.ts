import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencySkirmishing: AbilityOrProficiency = {
  id: "Skirmishing",
  name: "Skirmishing",
  description: [
    "The character may withdraw or retreat from melee combat without declaring the " +
      "intention to do so at the start of the melee round. Characters without this proficiency " +
      "must declare defensive movement before initiative dice are rolled. See Defensive " +
      "Movement in Chapter 6.",
  ],
  minLevel: 1,
};
