export interface AbilityOrProficiency {
  id: string;
  name: string;
  description: string[]; // One entry per rank, in order.
  /** If present, lists approved subtypes.  Each subtype acquired costs one proficiency slot. */
  subTypes?: string[];
}

/** If no subType is specified, then ALL subTypes are included. */
export interface AbilityFilter {
  def: AbilityOrProficiency;
  rank?: number;
  subtypes?: string[];
}
export interface AbilityFilterv2 {
  abilityDefId: number;
  rank: number;
  subtypes: string[];
}

export interface AbilityInstance {
  def: AbilityOrProficiency;
  rank: number;
  subtype?: string;
  minLevel: number;
}

export interface AbilityInstancev2 {
  abilityDefId: number;
  rank: number;
  subtype?: string;
  minLevel: number;
}
export const emptyAbilityInstancev2: AbilityInstancev2 = {
  abilityDefId: 0,
  rank: 1,
  subtype: "",
  minLevel: 1,
};

export enum ProficiencySource {
  Class1 = "Class1",
  Class2 = "Class2",
  Class3 = "Class3",
  Class4 = "Class4",
  Class5 = "Class5",
  General1 = "General1",
  General2 = "General2",
  General3 = "General3",
  General4 = "General4",
  IntBonus1 = "IntBonus1",
  IntBonus2 = "IntBonus2",
  IntBonus3 = "IntBonus3",
  Extra = "Extra", // Deprecated
  Extra1 = "Extra1",
  Extra2 = "Extra2",
  Extra3 = "Extra3",
  Extra4 = "Extra4",
  Selectable1 = "Selectable1",
  Selectable2 = "Selectable2",
  Selectable3 = "Selectable3",
  Selectable4 = "Selectable4",
  Injury = "Injury",
}

export const GeneralProficienciesAt = [1, 5, 9, 13];
