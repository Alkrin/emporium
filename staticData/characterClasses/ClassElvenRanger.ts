import { SharedAnimalReflexes } from "../classFeatures/SharedAnimalReflexes";
import { SharedDifficultToSpot } from "../classFeatures/SharedDifficultToSpot";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { SharedRangedAccuracyBonus } from "../classFeatures/SharedRangedAccuracyBonus";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyAmbushing } from "../proficiencies/ProficiencyAmbushing";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyClimbing } from "../proficiencies/ProficiencyClimbing";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyEavesdropping } from "../proficiencies/ProficiencyEavesdropping";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyLandSurveying } from "../proficiencies/ProficiencyLandSurveying";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMountaineering } from "../proficiencies/ProficiencyMountaineering";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyNavigation } from "../proficiencies/ProficiencyNavigation";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySniping } from "../proficiencies/ProficiencySniping";
import { ProficiencySurvival } from "../proficiencies/ProficiencySurvival";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTrapping } from "../proficiencies/ProficiencyTrapping";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";
import { ProficiencyTracking } from "../proficiencies/ProficiencyTracking";
import { SharedFriendOfBirdsAndBeasts } from "../classFeatures/SharedFriendOfBirdsAndBeasts";
import { ElfAttunementToNature } from "../classFeatures/ElfAttunementToNature";
import { ElfConnectionToNature } from "../classFeatures/ElfConnectionToNature";
import { ElfKeenEyes } from "../classFeatures/ElfKeenEyes";
import { ProficiencyAnimalHusbandry } from "../proficiencies/ProficiencyAnimalHusbandry";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";

export const ClassElvenRanger: CharacterClass = {
  name: "Elven Ranger",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Dexterity],
  statRequirements: { [CharacterStat.Intelligence]: 9 },
  xpToLevel: [0, 2275, 4550, 9100, 18200, 36400, 75000, 150000, 300000, 450000, 600000, 750000, 900000],
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
    // No great axe.
    WeaponType.HandAxe,
    WeaponType.Javelin,
    WeaponType.Lance,
    WeaponType.Longbow,
    WeaponType.Mace,
    // No morning star.
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
  maxBaseArmor: 4, // Chain
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.Paralysis]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6],
    [SavingThrowType.Death]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6],
    [SavingThrowType.Blast]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8],
    [SavingThrowType.Implements]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8],
    [SavingThrowType.Spells]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedRangedAccuracyBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedAnimalReflexes, rank: 1, minLevel: 1 },
    { def: SharedDifficultToSpot, rank: 1, minLevel: 1 },
    { def: SharedFriendOfBirdsAndBeasts, rank: 1, minLevel: 1 },
    { def: ProficiencyPreciseShooting, rank: 1, minLevel: 1 },
    { def: ProficiencyTracking, rank: 1, minLevel: 1 },
    { def: ElfAttunementToNature, rank: 1, minLevel: 1 },
    { def: ElfConnectionToNature, rank: 1, minLevel: 1 },
    { def: ElfKeenEyes, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Elven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnoll", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Hobgoblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Orc", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyAmbushing },
    { def: ProficiencyAnimalHusbandry },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyClimbing },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Incapacitate", "Knock Down"] },
    { def: ProficiencyEavesdropping },
    { def: ProficiencyEndurance },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyLandSurveying },
    { def: ProficiencyMapping },
    { def: ProficiencyMountaineering },
    { def: ProficiencyNaturalism },
    { def: ProficiencyNavigation },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySkirmishing },
    { def: ProficiencySniping },
    { def: ProficiencySurvival },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTracking },
    { def: ProficiencyTrapping },
    { def: ProficiencyWakefulness },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
