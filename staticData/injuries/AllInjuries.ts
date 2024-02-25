import { Dictionary } from "../../lib/dictionary";
import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";
import { InjuryBlind } from "./InjuryBlind";
import { InjuryNoLips } from "./InjuryNoLips";

export const AllInjuries: Dictionary<AbilityOrProficiency> = {
  [InjuryBlind.id]: InjuryBlind,
  [InjuryNoLips.id]: InjuryNoLips,
};

export const AllInjuriesArray = Object.values(AllInjuries).sort((injuryA, injuryB) => {
  return injuryA.name.localeCompare(injuryB.name);
});

export const InjuryNamesById: Dictionary<string> = AllInjuriesArray.reduce(
  (options, injury) => {
    options[injury.id] = injury.name;
    return options;
  },
  {
    ["OneDay"]: "Minimal: One Day Bed Rest",
    ["OneWeek"]: "Minor: One Week Bed Rest",
    ["TwoWeeks"]: "Moderate: Two Weeks Bed Rest",
    ["FourWeeks"]: "Major: Four Weeks Bed Rest",
  } as Dictionary<string>
);

export const SortedInjuryIds = [
  "OneDay",
  "OneWeek",
  "TwoWeeks",
  "FourWeeks",
  ...Object.keys(AllInjuries).sort((idA, idB) => {
    const injuryA = AllInjuries[idA];
    const injuryB = AllInjuries[idB];
    return injuryA.name.localeCompare(injuryB.name);
  }),
];
