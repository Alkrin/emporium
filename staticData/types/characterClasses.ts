import { AbilityFilter } from "./abilitiesAndProficiencies";
import { BaseWeaponType, WeaponCategory } from "./items";

export enum CharacterStat {
  Strength = "Strength",
  Intelligence = "Intelligence",
  Wisdom = "Wisdom",
  Dexterity = "Dexterity",
  Constitution = "Constitution",
  Charisma = "Charisma",
}

export enum BaseWeaponStyle {
  OneHandOnly = "One Hand Only",
  OneHandAndShield = "One Hand And Shield",
  DualWield = "Dual Wield",
  TwoHanded = "Two Handed",
}

export enum ArmorStyle {
  None = "None",
  Light = "Light", // Leather or less
  Medium = "Medium", // Chain or less
  Heavy = "Heavy", // Plate or less
}

export const PermittedArmorStyles: {
  [key: string]: { [key: string]: boolean };
} = {
  [ArmorStyle.None]: {
    [ArmorStyle.None]: true,
  },
  [ArmorStyle.Light]: {
    [ArmorStyle.None]: true,
    [ArmorStyle.Light]: true,
  },
  [ArmorStyle.Medium]: {
    [ArmorStyle.None]: true,
    [ArmorStyle.Light]: true,
    [ArmorStyle.Medium]: true,
  },
  [ArmorStyle.Heavy]: {
    [ArmorStyle.None]: true,
    [ArmorStyle.Light]: true,
    [ArmorStyle.Medium]: true,
    [ArmorStyle.Heavy]: true,
  },
};

export enum SavingThrowType {
  PetrificationAndParalysis = "Petrification and Paralysis",
  PoisonAndDeath = "Poison and Death",
  BlastAndBreath = "Blast and Breath",
  StaffsAndWands = "Staffs and Wands",
  Spells = "Spells",
}

export type CleaveMultiplier = 0 | 0.5 | 1;

// TODO: Should I define Types and Subtypes?  Would subtype just be class?  Or Class+Tradition?
export enum SpellType {
  Arcane = "Arcane",
  Bladedancer = "Bladedancer",
  Divine = "Divine",
  Eldritch = "Eldritch",
  Priestess = "Priestess",
  Shaman = "Shaman",
  Witch = "Witch",
  WitchAntiquarian = "Witch(Antiquarian)",
  WitchChthonic = "Witch(Chthonic)",
  WitchSylvan = "Witch(Sylvan)",
  WitchVoudon = "Witch(Voudon)",
}

export interface SpellCapability {
  /** All spell types that can be cast from these spell slots. */
  spellTypes: SpellType[];
  /** First index is character level-1, second index is spell level-1. */
  spellSlots: number[][];
  /** If true, the character must have a repertoire and a spellbook in order to cast spells.
   * If false, the character always has access to all spells from the listed spellTypes.
   */
  requiresSpellbook: boolean;
}

export interface CharacterClass {
  name: string;
  hitDieSize: 4 | 6 | 8 | 10 | 12;
  /** How many hp are gained at L10 and each subsequent level INSTEAD of rolling an extra hit die. */
  hpStep: number;
  primeRequisites: CharacterStat[];
  statRequirements: { [stat in CharacterStat]?: number };
  /** XP required to reach each level, starting from level 1. */
  xpToLevel: number[];
  weaponStyles: BaseWeaponStyle[];
  /** If present, lists permissable weapon categories for this class.  Otherwise, all are assumed permissable. */
  weaponCategoryPermissions?: WeaponCategory[];
  /** If present, lists permissable weapon types for this class.  Otherwise, all are assumed permissable. */
  weaponTypePermissions?: BaseWeaponType[];
  armorStyle: ArmorStyle;
  cleaveMultiplier: CleaveMultiplier;
  /** Array contains saving throw values by level in order, starting from level 1. */
  savingThrows: { [type in SavingThrowType]: number[] };
  /** Array contains to hit bonuses by level in order, starting from level 1. */
  toHitBonus: number[];
  classFeatures: AbilityFilter[];
  /** The levels at which this class gains a Class Proficiency. */
  classProficienciesAt: number[];
  classProficiencies: AbilityFilter[];
  spellcasting: SpellCapability[];
}
