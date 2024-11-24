import { ElfAttunementToNature } from "../classFeatures/ElfAttunementToNature";
import { ElfConnectionToNature } from "../classFeatures/ElfConnectionToNature";
import { ElfKeenEyes } from "../classFeatures/ElfKeenEyes";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlackLoreOfZahar } from "../proficiencies/ProficiencyBlackLoreOfZahar";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyContortionism } from "../proficiencies/ProficiencyContortionism";
import { ProficiencyElementalism } from "../proficiencies/ProficiencyElementalism";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySkulking } from "../proficiencies/ProficiencySkulking";
import { ProficiencySniping } from "../proficiencies/ProficiencySniping";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTrapfinding } from "../proficiencies/ProficiencyTrapfinding";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";

export const ClassElvenNightblade: CharacterClass = {
  name: "Elven Nightblade",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Dexterity, CharacterStat.Intelligence],
  statRequirements: {},
  xpToLevel: [0, 2775, 5550, 11100, 22200, 45000, 90000, 180000, 330000, 480000, 630000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.DualWield],
  maxBaseArmor: 2, // Leather
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.Paralysis]: [12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7],
    [SavingThrowType.Death]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8],
    [SavingThrowType.Blast]: [16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11],
    [SavingThrowType.Implements]: [14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9],
    [SavingThrowType.Spells]: [14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: ProficiencyAcrobatics, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 10 },
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
  classProficienciesAt: [1, 4, 8],
  classProficiencies: [
    { def: ProficiencyAlchemy },
    { def: ProficiencyAlertness },
    { def: ProficiencyArcaneDabbling },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlackLoreOfZahar },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyCombatTrickery, subtypes: ["Incapacitate"] },
    { def: ProficiencyContortionism },
    { def: ProficiencyElementalism },
    { def: ProficiencyFamiliar },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyIntimidation },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMysticAura },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRunning },
    { def: ProficiencySensingPower },
    { def: ProficiencySkirmishing },
    { def: ProficiencySkulking },
    { def: ProficiencySniping },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTrapfinding },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWakefulness },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellSource: SpellType.Arcane,
      spellTypes: [SpellType.Arcane],
      requiresSpellbook: true,
      spellSlots: [
        [1, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0],
        [2, 1, 0, 0, 0, 0],
        [2, 2, 0, 0, 0, 0],
        [2, 2, 1, 0, 0, 0],
        [2, 2, 2, 0, 0, 0],
        [3, 2, 2, 1, 0, 0],
        [3, 3, 2, 2, 0, 0],
        [3, 3, 3, 2, 1, 0],
        [3, 3, 3, 3, 2, 0],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 12, // Max level is 11, so no rituals.
      ritualLevels: [],
    },
  ],
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
  ],
};
