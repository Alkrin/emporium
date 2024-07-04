import { FighterBattlefieldProwess } from "../classFeatures/FighterBattlefieldProwess";
import { SharedAgeless } from "../classFeatures/SharedAgeless";
import { SharedBrutality } from "../classFeatures/SharedBrutality";
import { SharedInhumanity } from "../classFeatures/SharedInhumanity";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedNaturalAttackPower } from "../classFeatures/SharedNaturalAttackPower";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { SharedSavageResilience } from "../classFeatures/SharedSavageResilience";
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

export const ClassTrueTurtleGreatSnapper: CharacterClass = {
  name: "True Turtle Great Snapper",
  hitDieSize: 6,
  hpStep: 3,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Constitution],
  statRequirements: { [CharacterStat.Strength]: 13, [CharacterStat.Constitution]: 11 },
  xpToLevel: [0, 4800, 9600, 19200, 38400, 76800, 150000, 300000],
  weaponStyles: [WeaponStyle.OneHandOnly],
  naturalWeapons: [
    {
      name: "Bite",
      count: 1,
      damageProgression: [
        { dice: 1, die: 4, bonus: 0 },
        { dice: 1, die: 6, bonus: 0 },
        { dice: 1, die: 6, bonus: 1 },
        { dice: 1, die: 8, bonus: 1 },
        { dice: 1, die: 8, bonus: 2 },
        { dice: 1, die: 10, bonus: 2 },
      ],
      hitBonus: 0,
    },
  ],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [15, 14, 14, 13, 12, 12, 11, 10],
    [SavingThrowType.PoisonAndDeath]: [14, 13, 13, 12, 11, 11, 10, 9],
    [SavingThrowType.BlastAndBreath]: [16, 15, 15, 14, 13, 13, 12, 11],
    [SavingThrowType.StaffsAndWands]: [16, 15, 15, 14, 13, 13, 12, 11],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12],
  },
  toHitBonus: [0, 1, 2, 3, 4, 5, 6, 7],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMeleeDamageBonus, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Turtle", rank: 1, minLevel: 1 },
    { def: SharedInhumanity, rank: 1, minLevel: 1 },
    { def: SharedAgeless, rank: 1, minLevel: 1 },
    { def: SharedSavageResilience, rank: 1, minLevel: 1 },
    { def: SharedNaturalAttackPower, subtype: "Bite", rank: 1, minLevel: 2 },
    { def: SharedNaturalAttackPower, subtype: "Bite", rank: 1, minLevel: 3 },
    { def: SharedNaturalAttackPower, subtype: "Bite", rank: 1, minLevel: 4 },
    { def: SharedNaturalAttackPower, subtype: "Bite", rank: 1, minLevel: 6 },
    { def: SharedBrutality, rank: 1, minLevel: 7 },
    { def: SharedNaturalAttackPower, subtype: "Bite", rank: 1, minLevel: 8 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6],
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
