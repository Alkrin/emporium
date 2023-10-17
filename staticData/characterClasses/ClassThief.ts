import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyBribery } from "../proficiencies/ProficiencyBribery";
import { ProficiencyCatBurglary } from "../proficiencies/ProficiencyCatBurglary";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyContortionism } from "../proficiencies/ProficiencyContortionism";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyGambling } from "../proficiencies/ProficiencyGambling";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLipReading } from "../proficiencies/ProficiencyLipReading";
import { ProficiencyLockPicking } from "../proficiencies/ProficiencyLockPicking";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySeafaring } from "../proficiencies/ProficiencySeafaring";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySkulking } from "../proficiencies/ProficiencySkulking";
import { ProficiencySniping } from "../proficiencies/ProficiencySniping";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTrapfinding } from "../proficiencies/ProficiencyTrapfinding";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";

export const ClassThief: CharacterClass = {
  name: "Thief",
  hitDieSize: 4,
  hpStep: 2,
  primeRequisites: [CharacterStat.Dexterity],
  statRequirements: {},
  xpToLevel: [0, 1250, 2500, 5000, 10000, 20000, 40000, 80000, 180000, 280000, 380000, 480000, 580000, 680000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.DualWield],
  maxBaseArmor: 2, // Leather
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.PoisonAndDeath]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.BlastAndBreath]: [16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10],
    [SavingThrowType.StaffsAndWands]: [14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8],
    [SavingThrowType.Spells]: [15, 15, 14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
  classFeatures: [{ def: ProficiencyAdventuring }, { def: ProficiencyLanguage, subtypes: ["Common"] }],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyAlertness },
    { def: ProficiencyArcaneDabbling },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyBribery },
    { def: ProficiencyCatBurglary },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Incapacitate"] },
    { def: ProficiencyContortionism },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyGambling },
    { def: ProficiencyIntimidation },
    { def: ProficiencyLipReading },
    { def: ProficiencyLockPicking },
    { def: ProficiencyMapping },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySeafaring },
    { def: ProficiencySkirmishing },
    { def: ProficiencySkulking },
    { def: ProficiencySniping },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTrapfinding },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [
    {
      name: "Backstab",
      rolls: ["x2", "x2", "x2", "x2", "x3", "x3", "x3", "x3", "x4", "x4", "x4", "x4", "x5", "x5"],
      tooltip:
        "In order to backstab, the character must first catch an opponent unawares, either by surprise or by " +
        "Moving Silently and/or Hiding In Shadows to sneak up on his opponent. When backstabbing, the character " +
        "will receive a +4 to hit bonus and, if successful, deal additional damage.",
    },
    {
      name: "Open Locks",
      rolls: ["18+", "17+", "16+", "15+", "14+", "12+", "10+", "8+", "6+", "4+", "3+", "2+", "1+", "1+"],
    },
    {
      name: "Find Traps",
      rolls: ["18+", "17+", "16+", "15+", "14+", "13+", "11+", "9+", "7+", "5+", "3+", "2+", "2+", "1+"],
    },
    {
      name: "Remove Traps",
      rolls: ["18+", "17+", "16+", "15+", "14+", "13+", "11+", "9+", "7+", "5+", "3+", "2+", "2+", "1+"],
    },
    {
      name: "Pick Pockets",
      rolls: ["17+", "16+", "15+", "14+", "13+", "12+", "10+", "8+", "6+", "4+", "2+", "-1+", "-3+", "-5+"],
      tooltip: "The character receives a -1 penalty for each level the target is higher than the pick pocket.",
    },
    {
      name: "Move Silently",
      rolls: ["17+", "16+", "15+", "14+", "13+", "12+", "10", "8+", "6+", "4+", "2+", "2+", "1+", "1+"],
    },
    {
      name: "Climb Walls",
      rolls: ["6+", "5+", "5+", "4+", "4+", "4+", "3+", "3+", "3+", "3+", "2+", "2+", "1+", "1+"],
    },
    {
      name: "Hide In Shadows",
      rolls: ["19+", "18+", "17+", "16+", "15+", "14+", "12+", "10+", "8+", "6+", "4+", "3+", "2+", "1+"],
    },
    {
      name: "Hear Noise",
      rolls: ["14+", "13+", "12+", "11+", "10+", "9+", "8+", "7+", "6+", "5+", "4+", "3+", "2+", "1+"],
    },
  ],
};
