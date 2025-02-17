export interface AbilityOrProficiency {
  id: string;
  name: string;
  description: string[]; // One entry per rank, in order.
  /** If present, lists approved subtypes.  Each subtype acquired costs one proficiency slot. */
  subTypes?: string[];
  // TODO: toHitEffect?: (characterData) => number; // Function that alters toHit chance based on the character's data.  i.e. elven ranger precision bonus.
  // TODO: damageEffect?: (characterData) => number; // Function that alters damage based on the character's data.  i.e. fighter damage bonus.
  // TODO: armorEffect?: (characterData) => number // Function that alters armor based on the character's data.  i.e. dwarven fury AC bonus.
  // TODO: How to handle effects with charges, like Mystic's Battle Trance?
  // TODO: Should I separate into passive and triggered and charge-based effects instead?
  // TODO: Should I define "functional components" that describe which equations this ability/proficiency alters and how?

  // TODO: There are a lot of abilities and proficiencies that grant a button that lets you do something for a proficiency roll.  Some of those
  //       are usable in combat (Combat Maneuvers?).  Some are largely out of combat (Perform, Craft, etc.).
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
