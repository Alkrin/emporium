import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyAnimalHusbandry } from "../proficiencies/ProficiencyAnimalHusbandry";
import { ProficiencyApostasy } from "../proficiencies/ProficiencyApostasy";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyContemplation } from "../proficiencies/ProficiencyContemplation";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMagicalMusic } from "../proficiencies/ProficiencyMagicalMusic";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyProphecy } from "../proficiencies/ProficiencyProphecy";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRighteousTurning } from "../proficiencies/ProficiencyRighteousTurning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingEvil } from "../proficiencies/ProficiencySensingEvil";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassPriestess: CharacterClass = {
  name: "Priestess",
  hitDieSize: 4,
  hpStep: 1,
  primeRequisites: [CharacterStat.Wisdom, CharacterStat.Charisma],
  statRequirements: {},
  xpToLevel: [0, 2000, 4000, 8000, 16000, 32000, 65000, 130000, 250000, 370000, 490000, 610000, 730000, 850000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [WeaponType.Club, WeaponType.Dagger, WeaponType.Dart, WeaponType.Staff],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 0,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.PoisonAndDeath]: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4],
    [SavingThrowType.BlastAndBreath]: [16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10],
    [SavingThrowType.StaffsAndWands]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.Spells]: [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
  },
  toHitBonus: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4],
  classFeatures: [
    { def: ProficiencyAdventuring },
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
    { def: ProficiencyAlchemy },
    { def: ProficiencyAnimalHusbandry },
    { def: ProficiencyApostasy },
    { def: ProficiencyArcaneDabbling },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyContemplation },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMagicalMusic },
    { def: ProficiencyMysticAura },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPerformance },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession },
    { def: ProficiencyProphecy },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRighteousTurning },
    { def: ProficiencySecondSight },
    { def: ProficiencySensingEvil },
    { def: ProficiencySensingPower },
    { def: ProficiencyTheology },
    { def: ProficiencyUnflappableCasting },
  ],
  spellcasting: [
    {
      spellTypes: [SpellType.Divine],
      requiresSpellbook: false,
      spellSlots: [
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [3, 2, 0, 0, 0],
        [3, 3, 0, 0, 0],
        [3, 3, 2, 2, 0],
        [3, 3, 3, 2, 2],
        [5, 5, 3, 3, 2],
        [5, 5, 5, 3, 3],
        [6, 6, 5, 5, 3],
        [6, 6, 6, 5, 5],
        [8, 8, 6, 6, 5],
        [8, 8, 8, 6, 5],
        [9, 8, 8, 8, 6],
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
