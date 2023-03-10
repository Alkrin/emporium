import { FighterBattlefieldProwess } from "../classAbilities/FighterBattlefieldProwess";
import { SharedMeleeDamageBonus } from "../classAbilities/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classAbilities/SharedMissileDamageBonus";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
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
import {
  ArmorStyle,
  BaseWeaponStyle,
  CharacterClass,
  CharacterStat,
  SavingThrowType,
} from "../types/characterClasses";

export const ClassFighter: CharacterClass = {
  name: "Fighter",
  hitDieSize: 8,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength],
  statRequirements: {},
  xpToLevel: [
    0, 2000, 4000, 8000, 16000, 32000, 65000, 130000, 250000, 370000, 490000,
    610000, 730000, 850000,
  ],
  weaponStyles: [
    BaseWeaponStyle.OneHandOnly,
    BaseWeaponStyle.OneHandAndShield,
    BaseWeaponStyle.DualWield,
    BaseWeaponStyle.TwoHanded,
  ],
  armorStyle: ArmorStyle.Heavy,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [
      15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6,
    ],
    [SavingThrowType.PoisonAndDeath]: [
      14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5,
    ],
    [SavingThrowType.BlastAndBreath]: [
      16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7,
    ],
    [SavingThrowType.StaffsAndWands]: [
      16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7,
    ],
    [SavingThrowType.Spells]: [
      17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8,
    ],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9],
  classFeatures: [
    { def: SharedMeleeDamageBonus },
    { def: SharedRangedDamageBonus },
    { def: FighterBattlefieldProwess },
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
      subTypes: ["Disarm", "Force Back", "Knock Down", "Overrun", "Sunder"],
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
};
