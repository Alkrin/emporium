import { AntiPaladinAuraOfProtection } from "../classFeatures/AntiPaladinAuraOfProtection";
import { AntiPaladinDetectGood } from "../classFeatures/AntiPaladinDetectGood";
import { AntiPaladinUnholyFanaticism } from "../classFeatures/AntiPaladinUnholyFanaticism";
import { FighterBattlefieldProwess } from "../classFeatures/FighterBattlefieldProwess";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { ZaharanAfterTheFlesh } from "../classFeatures/ZaharanAfterTheFlesh";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyAmbushing } from "../proficiencies/ProficiencyAmbushing";
import { ProficiencyBerserkergang } from "../proficiencies/ProficiencyBerserkergang";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyKinSlaying } from "../proficiencies/ProficiencyKinSlaying";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyManualOfArms } from "../proficiencies/ProficiencyManualOfArms";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassAntiPaladin: CharacterClass = {
  name: "Anti-Paladin",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Charisma],
  statRequirements: {},
  xpToLevel: [0, 1850, 3700, 7400, 14800, 29600, 60000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  weaponTypePermissions: [
    WeaponType.BattleAxe,
    WeaponType.Dagger,
    WeaponType.Flail,
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.PoleArm,
    WeaponType.ShortSword,
    WeaponType.Spear,
    WeaponType.Sword,
    WeaponType.TwoHandedSword,
    WeaponType.Whip,
  ],
  maxBaseArmor: 6, // Plate
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6],
    [SavingThrowType.PoisonAndDeath]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5],
    [SavingThrowType.BlastAndBreath]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.StaffsAndWands]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMeleeDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedDamageBonus, rank: 1, minLevel: 1 },
    { def: AntiPaladinAuraOfProtection, rank: 1, minLevel: 1 },
    { def: AntiPaladinDetectGood, rank: 1, minLevel: 1 },
    { def: AntiPaladinUnholyFanaticism, rank: 1, minLevel: 5 },
    { def: ZaharanAfterTheFlesh, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyAmbushing },
    { def: ProficiencyBerserkergang },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCombatReflexes },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Force Back", "Incapacitate", "Overrun", "Sunder"],
    },
    { def: ProficiencyCommand },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyEndurance },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyIntimidation },
    { def: ProficiencyKinSlaying },
    { def: ProficiencyKnowledge, subtypes: ["History"] },
    { def: ProficiencyLeadership },
    { def: ProficiencyManualOfArms },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyMysticAura },
    { def: ProficiencyProfession, subtypes: ["Torturer"] },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySecondSight },
    { def: ProficiencyTheology },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [
    {
      name: "Command Undead: Skeleton",
      rolls: ["10+", "10+", "7+", "7+", "4+", "4+", "T", "T", "T", "T", "D", "D", "D", "D"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Zombie",
      rolls: ["-", "-", "10+", "10+", "7+", "7+", "4+", "4+", "T", "T", "T", "T", "D", "D"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Ghoul",
      rolls: ["-", "-", "-", "-", "10+", "10+", "7+", "7+", "4+", "4+", "T", "T", "T", "T"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Wight",
      rolls: ["-", "-", "-", "-", "-", "-", "10+", "10+", "7+", "7+", "4+", "4+", "T", "T"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Wraith",
      rolls: ["-", "-", "-", "-", "-", "-", "-", "-", "10+", "10+", "7+", "7+", "4+", "4+"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Mummy",
      rolls: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "10+", "10+", "7+", "7+"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
    {
      name: "Command Undead: Spectre",
      rolls: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "10+", "10+"],
      tooltip:
        "For numeric value or `T`, 2d6 HD of enemies will be charmed for 1 turn per character " +
        "level. On `D`, the targets are charmed for 1 day per character level.  After the charm " +
        "ends, the undead flee as if turned.",
    },
  ],
};
