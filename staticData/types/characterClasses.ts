import { AbilityFilter, AbilityInstance } from "./abilitiesAndProficiencies";
import { WeaponType, WeaponCategory } from "./items";

export enum CharacterStat {
  Strength = "Strength",
  Intelligence = "Intelligence",
  Wisdom = "Wisdom",
  Dexterity = "Dexterity",
  Constitution = "Constitution",
  Charisma = "Charisma",
}

export enum WeaponStyle {
  OneHandOnly = "One Hand Only",
  OneHandAndShield = "One Hand And Shield",
  DualWield = "Dual Wield",
  TwoHanded = "Two Handed",
}

export enum SavingThrowType {
  PetrificationAndParalysis = "Petrification and Paralysis",
  PoisonAndDeath = "Poison and Death",
  BlastAndBreath = "Blast and Breath",
  StaffsAndWands = "Staffs and Wands",
  Spells = "Spells",
}

export type CleaveMultiplier = 0 | 0.5 | 1;

export enum SpellType {
  Arcane = "Arcane",
  Bladedancer = "Bladedancer",
  Divine = "Divine",
  EldritchBlack = "Eldritch(Black)",
  EldritchGrey = "Eldritch(Grey)",
  EldritchWhite = "Eldritch(White)",
  Priestess = "Priestess",
  Shaman = "Shaman",
  Witch = "Witch",
  WitchAntiquarian = "Witch(Antiquarian)",
  WitchChthonic = "Witch(Chthonic)",
  WitchSylvan = "Witch(Sylvan)",
  WitchVoudon = "Witch(Voudon)",
}

export interface SpellCapability {
  /** The primary source is either divine (granted by a god) or arcane (learned through study). */
  spellSource: SpellType.Arcane | SpellType.Divine;
  /** All spell types that can be cast from these spell slots. */
  spellTypes: SpellType[];
  /** First index is character level-1, second index is spell level-1. */
  spellSlots: number[][];
  /** If true, the character must have a repertoire and a spellbook in order to cast spells.
   * If false, the character always has access to all spells from the listed spellTypes.
   */
  requiresSpellbook: boolean;
  /** If defined, the bonus to this stat increases repertoire size for every spell level. */
  repertoireStat?: CharacterStat;
  /** The character level at which rituals become available. */
  minRitualLevel: number;
  /** The spell levels that count as rituals. */
  ritualLevels: number[];
}

export interface LevelBasedSkill {
  name: string;
  rolls: (number | string)[];
  tooltip?: string;
}

export interface SelectableClassFeature {
  title: string;
  selections: AbilityFilter | AbilityFilter[];
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
  weaponStyles: WeaponStyle[];
  /** If present, lists permissable weapon categories for this class.  Otherwise, all are assumed permissable. */
  weaponCategoryPermissions?: WeaponCategory[];
  /** If present, lists permissable weapon types for this class.  Otherwise, all are assumed permissable. */
  weaponTypePermissions?: WeaponType[];
  // The maximum base AC of armor that this character can equip.  E.g. Fur = 1, Leather = 2, Plate = 6
  maxBaseArmor: number;
  cleaveMultiplier: CleaveMultiplier;
  /** Array contains saving throw values by level in order, starting from level 1. */
  savingThrows: { [type in SavingThrowType]: number[] };
  /** Array contains to hit bonuses by level in order, starting from level 1. */
  toHitBonus: number[];
  classFeatures: AbilityInstance[];
  /** Lists features/proficiencies that must be selected during character creation (i.e. Bards pick a Perform type, Craftpriests pick a Craft, etc.). */
  selectableClassFeatures: SelectableClassFeature[];
  /** The levels at which this class gains a Class Proficiency. */
  classProficienciesAt: number[];
  classProficiencies: AbilityFilter[];
  spellcasting: SpellCapability[];
  levelBasedSkills: LevelBasedSkill[];
}
