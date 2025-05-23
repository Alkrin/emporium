import { DwarfStoneSense } from "../classFeatures/DwarfStoneSense";
import { DwarfAttentionToDetail } from "../classFeatures/DwarfAttentionToDetail";
import { DwarvenCraftpriestReligiousTraining } from "../classFeatures/DwarvenCraftpriestReligiousTraining";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyArt } from "../proficiencies/ProficiencyArt";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyCaving } from "../proficiencies/ProficiencyCaving";
import { ProficiencyContemplation } from "../proficiencies/ProficiencyContemplation";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyDwarvenBrewing } from "../proficiencies/ProficiencyDwarvenBrewing";
import { ProficiencyEngineering } from "../proficiencies/ProficiencyEngineering";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGoblinSlaying } from "../proficiencies/ProficiencyGoblinSlaying";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyProphecy } from "../proficiencies/ProficiencyProphecy";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRighteousTurning } from "../proficiencies/ProficiencyRighteousTurning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingEvil } from "../proficiencies/ProficiencySensingEvil";
import { ProficiencySiegeEngineering } from "../proficiencies/ProficiencySiegeEngineering";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";
import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";

export const ClassDwarvenCraftpriest: CharacterClass = {
  name: "Dwarven Craftpriest",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Will],
  statRequirements: { [CharacterStat.Constitution]: 9 },
  xpToLevel: [0, 2400, 4800, 9600, 19200, 38400, 75000, 150000, 280000, 410000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [
    WeaponType.BattleAxe,
    WeaponType.Flail,
    WeaponType.GreatAxe,
    WeaponType.HandAxe,
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.Warhammer,
  ],
  maxBaseArmor: 6, // Plate
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.Paralysis]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5],
    [SavingThrowType.Death]: [6, 6, 5, 5, 4, 4, 3, 3, 2, 2],
    [SavingThrowType.Blast]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
    [SavingThrowType.Implements]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5],
    [SavingThrowType.Spells]: [12, 12, 11, 11, 10, 10, 9, 9, 8, 8],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: DwarfAttentionToDetail, rank: 1, minLevel: 1 },
    { def: DwarfStoneSense, rank: 1, minLevel: 1 },
    { def: DwarvenCraftpriestReligiousTraining, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 5 },
    { def: SharedMajorMagicCreation, rank: 1, minLevel: 9 },
    { def: SharedCreateMagicalConstructs, rank: 1, minLevel: 9 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Dwarven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Goblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnome", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Kobold", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [{ title: "Craft", selections: { def: ProficiencyCraft, rank: 3 } }],
  classProficienciesAt: [1, 4, 8],
  classProficiencies: [
    { def: ProficiencyAlchemy },
    { def: ProficiencyArt },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyCaving },
    { def: ProficiencyContemplation },
    { def: ProficiencyCraft },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyDwarvenBrewing },
    { def: ProficiencyEngineering },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGoblinSlaying },
    { def: ProficiencyHealing },
    { def: ProficiencySecondSight },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMapping },
    { def: ProficiencyPerformance, subtypes: ["Chant"] },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession, subtypes: ["Judge"] },
    { def: ProficiencyProphecy },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRighteousTurning },
    { def: ProficiencySensingEvil },
    { def: ProficiencySiegeEngineering },
    { def: ProficiencyTheology },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellSource: SpellType.Divine,
      spellTypes: [SpellType.Divine],
      requiresSpellbook: true,
      spellSlots: [
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [2, 1, 0, 0, 0],
        [2, 2, 0, 0, 0],
        [2, 2, 1, 0, 0],
        [2, 2, 2, 0, 0],
        [3, 2, 2, 1, 0],
        [3, 3, 2, 2, 0],
        [3, 3, 3, 2, 1],
        [3, 3, 3, 3, 2],
      ],
      minRitualLevel: 11, // Max level is 10, so craftpriests can't do rituals.
      ritualLevels: [],
    },
  ],
  levelBasedSkills: [
    {
      name: "Turn Undead: Skeleton",
      rolls: ["10+", "7+", "4+", "T", "T", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Zombie",
      rolls: ["-", "10+", "7+", "4+", "T", "T", "D", "D", "D", "D", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Ghoul",
      rolls: ["-", "-", "10+", "7+", "4+", "T", "T", "D", "D", "D", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Wight",
      rolls: ["-", "-", "-", "10+", "7+", "4+", "T", "T", "D", "D", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Wraith",
      rolls: ["-", "-", "-", "-", "10+", "7+", "4+", "T", "T", "D", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Mummy",
      rolls: ["-", "-", "-", "-", "-", "10+", "7+", "4+", "T", "T", "D", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Spectre",
      rolls: ["-", "-", "-", "-", "-", "-", "10+", "7+", "4+", "T", "T", "D", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Vampire",
      rolls: ["-", "-", "-", "-", "-", "-", "-", "10+", "7+", "4+", "T", "T", "D", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
    {
      name: "Turn Undead: Infernal",
      rolls: ["-", "-", "-", "-", "-", "-", "-", "-", "10+", "7+", "4+", "T", "T", "D"],
      tooltip: "For numeric value or `T`, 2d6 HD of enemies will be turned. On `D`, the targets are destroyed.",
    },
  ],
};
