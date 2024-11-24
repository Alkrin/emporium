import { DwarfExpertCaver } from "../classFeatures/DwarfExpertCaver";
import { DwarfStoneSense } from "../classFeatures/DwarfStoneSense";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCatBurglary } from "../proficiencies/ProficiencyCatBurglary";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyContortionism } from "../proficiencies/ProficiencyContortionism";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyEngineering } from "../proficiencies/ProficiencyEngineering";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGoblinSlaying } from "../proficiencies/ProficiencyGoblinSlaying";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMountaineering } from "../proficiencies/ProficiencyMountaineering";
import { ProficiencyNavigation } from "../proficiencies/ProficiencyNavigation";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySiegeEngineering } from "../proficiencies/ProficiencySiegeEngineering";
import { ProficiencySignaling } from "../proficiencies/ProficiencySignaling";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySkulking } from "../proficiencies/ProficiencySkulking";
import { ProficiencySniping } from "../proficiencies/ProficiencySniping";
import { ProficiencySurvival } from "../proficiencies/ProficiencySurvival";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTracking } from "../proficiencies/ProficiencyTracking";
import { ProficiencyTrapfinding } from "../proficiencies/ProficiencyTrapfinding";
import { ProficiencyTrapping } from "../proficiencies/ProficiencyTrapping";
import { ProficiencyVerminSlaying } from "../proficiencies/ProficiencyVerminSlaying";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassDwarvenDelver: CharacterClass = {
  name: "Dwarven Delver",
  hitDieSize: 6,
  hpStep: 3,
  primeRequisites: [CharacterStat.Dexterity],
  statRequirements: { [CharacterStat.Constitution]: 9 },
  xpToLevel: [0, 2000, 4000, 8000, 16000, 32000, 65000, 130000, 260000, 390000, 520000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  weaponTypePermissions: [
    WeaponType.Arbalest,
    WeaponType.BattleAxe,
    WeaponType.Bola,
    WeaponType.Club,
    WeaponType.CompositeBow,
    WeaponType.Crossbow,
    WeaponType.Dart,
    WeaponType.Flail,
    WeaponType.GreatAxe,
    WeaponType.HandAxe,
    WeaponType.Javelin,
    WeaponType.Longbow,
    WeaponType.Mace,
    WeaponType.MorningStar,
    WeaponType.Net,
    WeaponType.Shortbow,
    WeaponType.Sling,
    WeaponType.Warhammer,
  ],
  maxBaseArmor: 2, // Leather
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.Paralysis]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3],
    [SavingThrowType.Death]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3],
    [SavingThrowType.Blast]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7],
    [SavingThrowType.Implements]: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4],
    [SavingThrowType.Spells]: [11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: DwarfExpertCaver, rank: 1, minLevel: 1 },
    { def: DwarfStoneSense, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Dwarven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Goblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnome", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Kobold", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 4, 8],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyAlertness },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCatBurglary },
    { def: ProficiencyCombatReflexes },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Disarm", "Knock Down"],
    },
    { def: ProficiencyContortionism },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyEngineering },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGoblinSlaying },
    { def: ProficiencyMapping },
    { def: ProficiencyMountaineering },
    { def: ProficiencyNavigation },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRunning },
    { def: ProficiencySecondSight },
    { def: ProficiencySiegeEngineering },
    { def: ProficiencySignaling },
    { def: ProficiencySkirmishing },
    { def: ProficiencySkulking },
    { def: ProficiencySniping },
    { def: ProficiencySurvival },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTracking },
    { def: ProficiencyTrapfinding },
    { def: ProficiencyTrapping },
    { def: ProficiencyVerminSlaying },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [
    {
      name: "Backstab",
      rolls: ["x2", "x2", "x2", "x2", "x3", "x3", "x3", "x3", "x4", "x4", "x4"],
      tooltip:
        "In order to backstab, the character must first catch an opponent unawares, either by surprise or by " +
        "Moving Silently and/or Hiding In Shadows to sneak up on his opponent. When backstabbing, the character " +
        "will receive a +4 to hit bonus and, if successful, deal additional damage.",
    },
    {
      name: "Find Traps",
      rolls: ["14+", "14+", "14+", "13+", "12+", "11+", "9+", "7+", "5+", "3+", "1+"],
    },
    {
      name: "Move Silently",
      rolls: ["15+", "14+", "13+", "12+", "11+", "10+", "8+", "6+", "4+", "2+", "1+"],
    },
    {
      name: "Climb Walls",
      rolls: ["4+", "3+", "3+", "2+", "2+", "2+", "1+", "1+", "1+", "1+", "1+"],
    },
    {
      name: "Hide In Shadows",
      rolls: ["17+", "16+", "15+", "14+", "13+", "12+", "10+", "8+", "6+", "4+", "2+"],
    },
    {
      name: "Hear Noise",
      rolls: ["12+", "11+", "10+", "9+", "8+", "7+", "5+", "4+", "3+", "2+", "1+"],
    },
  ],
};
