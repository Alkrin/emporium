import { BattlegoatGatecrasherDungeonScarred } from "../classFeatures/BattlegoatGatecrasherDungeonScarred";
import { BattlegoatGatecrasherInvincibleDigestion } from "../classFeatures/BattlegoatGatecrasherInvincibleDigestion";
import { BattlegoatGatecrasherMightyKidneys } from "../classFeatures/BattlegoatGatecrasherMightyKidneys";
import { BattlegoatGatecrasherRedEyed } from "../classFeatures/BattlegoatGatecrasherRedEyed";
import { BattlegoatGatecrasherRuneCarvedHorns } from "../classFeatures/BattlegoatGatecrasherRuneCarvedHorns";
import { BattlegoatGatecrasherSteelWool } from "../classFeatures/BattlegoatGatecrasherSteelWool";
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

export const ClassBattlegoatGatecrasher: CharacterClass = {
  name: "Battlegoat Gatecrasher",
  hitDieSize: 10,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength],
  statRequirements: {},
  xpToLevel: [0, 3050, 6100, 12200, 24400, 50000, 100000, 220000, 340000, 460000, 580000, 700000, 820000, 940000],
  weaponStyles: [WeaponStyle.OneHandOnly],
  weaponTypePermissions: [WeaponType.GoatBiteRam],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6],
    [SavingThrowType.PoisonAndDeath]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5],
    [SavingThrowType.BlastAndBreath]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.StaffsAndWands]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: BattlegoatGatecrasherDungeonScarred, rank: 1, minLevel: 9 },
    { def: BattlegoatGatecrasherInvincibleDigestion, rank: 1, minLevel: 3 },
    { def: BattlegoatGatecrasherMightyKidneys, rank: 1, minLevel: 1 },
    { def: BattlegoatGatecrasherRedEyed, rank: 1, minLevel: 11 },
    { def: BattlegoatGatecrasherRuneCarvedHorns, rank: 1, minLevel: 1 },
    { def: BattlegoatGatecrasherSteelWool, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Goat", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
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
    {
      def: ProficiencyFightingStyle,
      subtypes: ["Single Weapon"],
    },
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
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
