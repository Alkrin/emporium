import { PaladinAuraOfProtection } from "../classFeatures/PaladinAuraOfProtection";
import { PaladinHolyFervor } from "../classFeatures/PaladinHolyFervor";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGoblinSlaying } from "../proficiencies/ProficiencyGoblinSlaying";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyManualOfArms } from "../proficiencies/ProficiencyManualOfArms";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingEvil } from "../proficiencies/ProficiencySensingEvil";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassPaladin: CharacterClass = {
  name: "Paladin",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Charisma],
  statRequirements: {},
  xpToLevel: [0, 1850, 3700, 7400, 14800, 29600, 60000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  weaponTypePermissions: [
    WeaponType.BattleAxe,
    WeaponType.Flail,
    WeaponType.Lance,
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.PoleArm,
    WeaponType.Sword,
    WeaponType.TwoHandedSword,
    WeaponType.Warhammer,
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
    { def: PaladinAuraOfProtection, rank: 1, minLevel: 1 },
    { def: PaladinHolyFervor, rank: 1, minLevel: 5 },
    { def: ProficiencySensingEvil, rank: 1, minLevel: 1 },
    { def: ProficiencyDivineHealth, rank: 1, minLevel: 1 },
    { def: ProficiencyLayOnHands, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCombatReflexes },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Force Back", "Incapacitate", "Overrun", "Sunder"],
    },
    { def: ProficiencyCommand },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyEndurance },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGoblinSlaying },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge, subtypes: ["History"] },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLeadership },
    { def: ProficiencyManualOfArms },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyMysticAura },
    { def: ProficiencyProfession, subtypes: ["Judge"] },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySecondSight },
    { def: ProficiencyTheology },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
