import { ElfAttunementToNature } from "../classFeatures/ElfAttunementToNature";
import { ElfConnectionToNature } from "../classFeatures/ElfConnectionToNature";
import { ElfKeenEyes } from "../classFeatures/ElfKeenEyes";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlackLoreOfZahar } from "../proficiencies/ProficiencyBlackLoreOfZahar";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyElementalism } from "../proficiencies/ProficiencyElementalism";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMagicalMusic } from "../proficiencies/ProficiencyMagicalMusic";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySoothsaying } from "../proficiencies/ProficiencySoothsaying";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";

export const ClassElvenSpellsword: CharacterClass = {
  name: "Elven Spellsword",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength, CharacterStat.Intelligence],
  statRequirements: {},
  xpToLevel: [0, 4000, 8000, 16000, 32000, 64000, 130000, 260000, 430000, 600000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.DualWield, WeaponStyle.OneHandAndShield],
  maxBaseArmor: 6, // Plate
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8],
    [SavingThrowType.PoisonAndDeath]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8],
    [SavingThrowType.BlastAndBreath]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10],
    [SavingThrowType.StaffsAndWands]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10],
    [SavingThrowType.Spells]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 5 },
    { def: SharedMajorMagicCreation, rank: 1, minLevel: 9 },
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
  classProficienciesAt: [1, 3, 6, 9],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyAlertness },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlackLoreOfZahar },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Knock Down"] },
    { def: ProficiencyCommand },
    { def: ProficiencyElementalism },
    { def: ProficiencyFamiliar },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyLeadership },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMagicalMusic },
    { def: ProficiencyMysticAura },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyRunning },
    { def: ProficiencySensingPower },
    { def: ProficiencySkirmishing },
    { def: ProficiencySoothsaying },
    { def: ProficiencySwashbuckling },
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
      minRitualLevel: 11, // Max level is 10, so no rituals.
      ritualLevels: [],
    },
  ],
  levelBasedSkills: [],
};
