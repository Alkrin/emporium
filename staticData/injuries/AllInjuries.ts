import { Dictionary } from "../../lib/dictionary";
import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";
import { InjuryBlind } from "./InjuryBlind";

export const AllInjuries: Dictionary<AbilityOrProficiency> = {
  [InjuryBlind.id]: InjuryBlind,
};
