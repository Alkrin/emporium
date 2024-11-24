import { MysticCommandOfVoice } from "../classFeatures/MysticCommandOfVoice";
import { MysticGracefulFightingStyle } from "../classFeatures/MysticGracefulFightingStyle";
import { MysticMeditativeFocus } from "../classFeatures/MysticMeditativeFocus";
import { MysticMindful } from "../classFeatures/MysticMindful";
import { MysticPerceiveIntentions } from "../classFeatures/MysticPerceiveIntentions";
import { MysticPerfectionOfBody } from "../classFeatures/MysticPerfectionOfBody";
import { MysticProbabilityTrance } from "../classFeatures/MysticProbabilityTrance";
import { MysticPurityOfBodyAndSoul } from "../classFeatures/MysticPurityOfBodyAndSoul";
import { MysticSpeedOfThought } from "../classFeatures/MysticSpeedOfThought";
import { MysticStrengthOfSpirit } from "../classFeatures/MysticStrengthOfSpirit";
import { MysticWholenessOfBody } from "../classFeatures/MysticWholenessOfBody";
import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyClimbing } from "../proficiencies/ProficiencyClimbing";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyContortionism } from "../proficiencies/ProficiencyContortionism";
import { ProficiencyEavesdropping } from "../proficiencies/ProficiencyEavesdropping";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLipReading } from "../proficiencies/ProficiencyLipReading";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyUnarmedFighting } from "../proficiencies/ProficiencyUnarmedFighting";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassMystic: CharacterClass = {
  name: "Mystic",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Will, CharacterStat.Dexterity, CharacterStat.Constitution, CharacterStat.Charisma],
  statRequirements: {},
  xpToLevel: [0, 2450, 4900, 9800, 19600, 39200, 80000, 160000, 280000, 400000, 520000, 640000, 760000, 880000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.DualWield, WeaponStyle.TwoHanded],
  weaponTypePermissions: [
    WeaponType.Dagger,
    WeaponType.Dart,
    WeaponType.Flail,
    WeaponType.Longbow,
    WeaponType.PoleArm,
    WeaponType.ShortSword,
    WeaponType.Spear,
    WeaponType.Staff,
    WeaponType.Sword,
    WeaponType.Whip,
  ],
  maxBaseArmor: 0, // Nothing
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.Paralysis]: [15, 14, 14, 13, 12, 12, 11, 10, 10, 7, 6, 6, 5, 4],
    [SavingThrowType.Death]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 6, 5, 5, 4, 3],
    [SavingThrowType.Blast]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 8, 7, 7, 6, 5],
    [SavingThrowType.Implements]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 8, 7, 7, 6, 5],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12, 12, 9, 8, 8, 7, 6],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: MysticCommandOfVoice, rank: 1, minLevel: 6 },
    { def: MysticGracefulFightingStyle, rank: 1, minLevel: 1 },
    { def: MysticMeditativeFocus, rank: 1, minLevel: 1 },
    { def: MysticMindful, rank: 1, minLevel: 1 },
    { def: MysticPerceiveIntentions, rank: 1, minLevel: 8 },
    { def: MysticPerfectionOfBody, rank: 1, minLevel: 14 },
    { def: MysticProbabilityTrance, rank: 1, minLevel: 4 },
    { def: MysticPurityOfBodyAndSoul, rank: 1, minLevel: 5 },
    { def: MysticSpeedOfThought, rank: 1, minLevel: 3 },
    { def: MysticStrengthOfSpirit, rank: 1, minLevel: 2 },
    { def: MysticWholenessOfBody, rank: 1, minLevel: 7 },
    { def: SharedMeleeDamageBonus, rank: 1, minLevel: 1 },
    { def: SharedRangedDamageBonus, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyArcaneDabbling },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyClimbing },
    {
      def: ProficiencyCombatTrickery,
      subtypes: ["Force Back", "Incapacitate", "Knock Down", "Overrun", "Wrestle"],
    },
    { def: ProficiencyCommand },
    { def: ProficiencyContortionism },
    { def: ProficiencyEavesdropping },
    { def: ProficiencyEndurance },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLipReading },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPerformance },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRunning },
    { def: ProficiencySecondSight },
    { def: ProficiencySkirmishing },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyUnarmedFighting },
    { def: ProficiencyWakefulness },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
