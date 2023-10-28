import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyApostasy } from "../proficiencies/ProficiencyApostasy";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyContemplation } from "../proficiencies/ProficiencyContemplation";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyProphecy } from "../proficiencies/ProficiencyProphecy";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRighteousTurning } from "../proficiencies/ProficiencyRighteousTurning";
import { ProficiencySensingEvil } from "../proficiencies/ProficiencySensingEvil";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassCleric: CharacterClass = {
  name: "Cleric",
  hitDieSize: 6,
  hpStep: 1,
  primeRequisites: [CharacterStat.Wisdom],
  statRequirements: {},
  xpToLevel: [0, 1500, 3000, 6000, 12000, 24000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [
    WeaponType.Club,
    WeaponType.Flail,
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.Sling,
    WeaponType.Staff,
    WeaponType.Warhammer,
  ],
  maxBaseArmor: 6, // Plate
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.PoisonAndDeath]: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4],
    [SavingThrowType.BlastAndBreath]: [16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10],
    [SavingThrowType.StaffsAndWands]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.Spells]: [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 5 },
    { def: SharedMajorMagicCreation, rank: 1, minLevel: 9 },
    { def: SharedRitualMagic, rank: 1, minLevel: 11 },
    { def: SharedCreateMagicalConstructs, rank: 1, minLevel: 11 },
    { def: SharedCreateUndead, rank: 1, minLevel: 11 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyApostasy },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyCombatTrickery, subtypes: ["Force Back", "Overrun", "Sunder"] },
    { def: ProficiencyCommand },
    { def: ProficiencyContemplation },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge, subtypes: ["History"] },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLeadership },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession, subtypes: ["Judge"] },
    { def: ProficiencyProphecy },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRighteousTurning },
    { def: ProficiencySensingEvil },
    { def: ProficiencySensingPower },
    { def: ProficiencyTheology },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellSource: SpellType.Divine,
      spellTypes: [SpellType.Divine],
      requiresSpellbook: false,
      spellSlots: [
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [2, 1, 0, 0, 0],
        [2, 2, 0, 0, 0],
        [2, 2, 1, 1, 0],
        [2, 2, 2, 1, 1],
        [3, 3, 2, 2, 1],
        [3, 3, 3, 2, 2],
        [4, 4, 3, 3, 2],
        [4, 4, 4, 3, 3],
        [5, 5, 4, 4, 3],
        [5, 5, 5, 4, 3],
        [6, 5, 5, 5, 4],
      ],
      minRitualLevel: 11,
      ritualLevels: [6, 7],
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
