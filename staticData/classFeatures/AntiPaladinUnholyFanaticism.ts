import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const AntiPaladinUnholyFanaticism: AbilityOrProficiency = {
  id: "Unholy Fanaticism.AntiPaladin",
  name: "Unholy Fanaticism",
  description: [
    "When an anti-paladin reaches 5th level (Blackguard), his unholy " +
      "fanaticism inspires others to follow him. Any hirelings of " +
      "the same religion as the anti-paladin gain a +1 bonus to their " +
      "morale score whenever he is present. This bonus stacks with any " +
      "modifiers from the anti-paladin’s Charisma or proficiencies.",
  ],
  minLevel: 5,
};
