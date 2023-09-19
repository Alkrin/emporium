import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const DwarvenMachinistPersonalAutomaton: AbilityOrProficiency = {
  id: "Personal Automaton.DwarvenMachinist",
  name: "Personal Automaton",
  description: [
    "The machinist starts with a Personal Automaton and its blueprint, with maximum value of 7000gp. " +
      "A machinist may only have one Personal Automaton at a time.  Designing a Personal Automaton is always " +
      "successful.  The cost to design or build a Personal Automaton is reduced by 7000gp, with a corresponding " +
      "reduction in both Library and Machine Shop requirements.  A Personal Automaton can be broken down for " +
      "parts equal to half its original value, but those parts can only be used to build another Personal Automaton.",
  ],
  minLevel: 1,
};
