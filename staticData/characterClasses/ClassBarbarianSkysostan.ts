import { BarbarianAnimalMagnetism } from "../classFeatures/BarbarianAnimalMagnetism";
import { SharedSavageResilience } from "../classFeatures/SharedSavageResilience";
import { SharedAnimalReflexes } from "../classFeatures/SharedAnimalReflexes";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { SharedNaturallyStealthy } from "../classFeatures/SharedNaturallyStealthy";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyBerserkergang } from "../proficiencies/ProficiencyBerserkergang";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGambling } from "../proficiencies/ProficiencyGambling";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyManualOfArms } from "../proficiencies/ProficiencyManualOfArms";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySiegeEngineering } from "../proficiencies/ProficiencySiegeEngineering";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySurvival } from "../proficiencies/ProficiencySurvival";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassBarbarianSkysostan: CharacterClass = {
  name: "Barbarian, Skysostan",
  hitDieSize: 8,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Constitution],
  statRequirements: {},
  xpToLevel: [0, 2600, 5200, 104000, 20800, 41600, 85000, 170000, 290000, 410000, 530000, 650000, 770000, 890000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield, WeaponStyle.DualWield],
  weaponTypePermissions: [
    WeaponType.CompositeBow,
    WeaponType.Dagger,
    WeaponType.HandAxe,
    WeaponType.Javelin,
    WeaponType.Lance,
    WeaponType.Net,
    WeaponType.Sling,
    WeaponType.ShortSword,
    WeaponType.Spear,
    WeaponType.Whip,
  ],
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
    { def: ProficiencyPreciseShooting, rank: 1, minLevel: 1 },
    { def: SharedAnimalReflexes, rank: 1, minLevel: 1 },
    { def: SharedNaturallyStealthy, rank: 1, minLevel: 1 },
    { def: SharedSavageResilience, rank: 1, minLevel: 1 },
    { def: BarbarianAnimalMagnetism, rank: 1, minLevel: 5 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [
    { title: "Damage Bonus", selections: [{ def: SharedMeleeDamageBonus }, { def: SharedRangedDamageBonus }] },
  ],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyAlertness },
    { def: ProficiencyBerserkergang },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCombatReflexes },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Disarm", "Force Back", "Knock Down", "Overrun", "Sunder"],
    },
    { def: ProficiencyCommand },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyEndurance },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGambling },
    { def: ProficiencyIntimidation },
    { def: ProficiencyLeadership },
    { def: ProficiencyManualOfArms },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySiegeEngineering },
    { def: ProficiencySkirmishing },
    { def: ProficiencySurvival },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
