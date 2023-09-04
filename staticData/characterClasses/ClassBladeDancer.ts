import { BladeDancerMobility } from "../classFeatures/BladeDancerDefensiveMobility";
import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyApostasy } from "../proficiencies/ProficiencyApostasy";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyContemplation } from "../proficiencies/ProficiencyContemplation";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyMagicalMusic } from "../proficiencies/ProficiencyMagicalMusic";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProphecy } from "../proficiencies/ProficiencyProphecy";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRighteousTurning } from "../proficiencies/ProficiencyRighteousTurning";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySeduction } from "../proficiencies/ProficiencySeduction";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassBladeDancer: CharacterClass = {
  name: "Blade Dancer",
  hitDieSize: 6,
  hpStep: 1,
  primeRequisites: [CharacterStat.Wisdom, CharacterStat.Dexterity],
  statRequirements: {},
  xpToLevel: [0, 1500, 3000, 6000, 12000, 24000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.DualWield],
  weaponTypePermissions: [
    WeaponType.BattleAxe,
    WeaponType.GreatAxe,
    WeaponType.HandAxe,
    WeaponType.PoleArm,
    WeaponType.Spear,
    WeaponType.Dagger,
    WeaponType.ShortSword,
    WeaponType.Sword,
    WeaponType.TwoHandedSword,
  ],
  maxBaseArmor: 2, // Leather
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
    { def: ProficiencyAdventuring },
    { def: BladeDancerMobility },
    { def: SharedMinorMagicCreation },
    { def: SharedMajorMagicCreation },
    { def: SharedRitualMagic },
    { def: SharedCreateMagicalConstructs },
    { def: SharedCreateUndead },
    { def: ProficiencyLanguage, subtypes: ["Common"] },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyApostasy },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Trip"] },
    { def: ProficiencyContemplation },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyMagicalMusic },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyPerformance },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProphecy },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRighteousTurning },
    { def: ProficiencyRunning },
    { def: ProficiencySeduction },
    { def: ProficiencySkirmishing },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTheology },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellTypes: [SpellType.Bladedancer],
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
