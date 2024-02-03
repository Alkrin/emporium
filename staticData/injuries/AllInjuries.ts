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
