import { ExplorerExperienceAndHardiness } from "../classFeatures/ExplorerExperienceAndHardiness";
import { ExplorerExplorationBonuses } from "../classFeatures/ExplorerExplorationBonuses";
import { SharedAnimalReflexes } from "../classFeatures/SharedAnimalReflexes";
import { SharedDifficultToSpot } from "../classFeatures/SharedDifficultToSpot";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { SharedRangedAccuracyBonus } from "../classFeatures/SharedRangedAccuracyBonus";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyAmbushing } from "../proficiencies/ProficiencyAmbushing";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyClimbing } from "../proficiencies/ProficiencyClimbing";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
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
import { ProficiencySeafaring } from "../proficiencies/ProficiencySeafaring";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySniping } from "../proficiencies/ProficiencySniping";
import { ProficiencySurvival } from "../proficiencies/ProficiencySurvival";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTrapping } from "../proficiencies/ProficiencyTrapping";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";

export const ClassExplorer: CharacterClass = {
  name: "Explorer",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Dexterity],
  statRequirements: {},
  xpToLevel: [0, 2000, 4000, 8000, 16000, 32000, 65000, 130000, 250000, 370000, 490000, 610000, 730000, 850000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  maxBaseArmor: 4, // Chain
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.Paralysis]: [15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6],
    [SavingThrowType.Death]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5],
    [SavingThrowType.Blast]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.Implements]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMeleeDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedAccuracyBonus, rank: 1, minLevel: 1 },
    { def: SharedAnimalReflexes, rank: 1, minLevel: 1 },
    { def: SharedDifficultToSpot, rank: 1, minLevel: 1 },
    { def: ExplorerExplorationBonuses, rank: 1, minLevel: 1 },
    { def: ExplorerExperienceAndHardiness, rank: 1, minLevel: 5 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyAmbushing },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyClimbing },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Knock Down"] },
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
    { def: ProficiencySeafaring },
    { def: ProficiencySkirmishing },
    { def: ProficiencySniping },
    { def: ProficiencySurvival },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTrapping },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
