import { DwarfStoneSense } from "../classFeatures/DwarfStoneSense";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyBerserkergang } from "../proficiencies/ProficiencyBerserkergang";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCaving } from "../proficiencies/ProficiencyCaving";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyDwarvenBrewing } from "../proficiencies/ProficiencyDwarvenBrewing";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyEngineering } from "../proficiencies/ProficiencyEngineering";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGambling } from "../proficiencies/ProficiencyGambling";
import { ProficiencyGoblinSlaying } from "../proficiencies/ProficiencyGoblinSlaying";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLandSurveying } from "../proficiencies/ProficiencyLandSurveying";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyManualOfArms } from "../proficiencies/ProficiencyManualOfArms";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyMountaineering } from "../proficiencies/ProficiencyMountaineering";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySiegeEngineering } from "../proficiencies/ProficiencySiegeEngineering";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassDwarvenVaultguard: CharacterClass = {
  name: "Dwarven Vaultguard",
  hitDieSize: 8,
  hpStep: 3,
  primeRequisites: [CharacterStat.Strength],
  statRequirements: { [CharacterStat.Constitution]: 9 },
  xpToLevel: [0, 2200, 4400, 8000, 17500, 35000, 70000, 140000, 270000, 400000, 530000, 660000, 790000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  weaponTypePermissions: [
    WeaponType.Arbalest,
    WeaponType.BattleAxe,
    WeaponType.Bola,
    WeaponType.Club,
    WeaponType.CompositeBow,
    WeaponType.Crossbow,
    WeaponType.Dagger,
    WeaponType.Dart,
    WeaponType.Flail,
    WeaponType.GreatAxe,
    WeaponType.HandAxe,
    WeaponType.Javelin,
    WeaponType.Lance,
    // No longbows.
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.Net,
    // No pole arms.
    WeaponType.Sap,
    WeaponType.ShortSword,
    WeaponType.Shortbow,
    WeaponType.Sling,
    WeaponType.Spear,
    WeaponType.Staff,
    WeaponType.Sword,
    // No two handed swords.
    WeaponType.Warhammer,
    WeaponType.Whip,
  ],
  maxBaseArmor: 6, // Plate
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.Paralysis]: [11, 10, 10, 9, 8, 8, 7, 6, 6, 5, 4, 4, 3],
    [SavingThrowType.Death]: [10, 9, 9, 8, 7, 7, 6, 5, 5, 4, 3, 3, 2],
    [SavingThrowType.Blast]: [13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6, 6, 5],
    [SavingThrowType.Implements]: [12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5, 5, 4],
    [SavingThrowType.Spells]: [13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6, 6, 5],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMeleeDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedDamageBonus, rank: 1, minLevel: 1 },
    { def: DwarfStoneSense, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Dwarven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Goblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnome", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Kobold", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyBerserkergang },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCaving },
    { def: ProficiencyCombatReflexes },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Force Back", "Knock Down", "Overrun", "Sunder", "Wrestle"],
    },
    { def: ProficiencyCommand },
    { def: ProficiencyCraft },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyDwarvenBrewing },
    { def: ProficiencyEndurance },
    { def: ProficiencyEngineering },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGambling },
    { def: ProficiencyGoblinSlaying },
    { def: ProficiencyIntimidation },
    { def: ProficiencyLandSurveying },
    { def: ProficiencyLeadership },
    { def: ProficiencyManualOfArms },
    { def: ProficiencyMapping },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyMountaineering },
    { def: ProficiencySecondSight },
    { def: ProficiencySiegeEngineering },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
