import { ElfAttunementToNature } from "../classFeatures/ElfAttunementToNature";
import { ElfConnectionToNature } from "../classFeatures/ElfConnectionToNature";
import { ElfKeenEyes } from "../classFeatures/ElfKeenEyes";
import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateMagicalCrossbreeds } from "../classFeatures/SharedCreateMagicalCrossbreeds";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyArt } from "../proficiencies/ProficiencyArt";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyCollegiateWizardry } from "../proficiencies/ProficiencyCollegiateWizardry";
import { ProficiencyContortionism } from "../proficiencies/ProficiencyContortionism";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDisguise } from "../proficiencies/ProficiencyDisguise";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMagicalMusic } from "../proficiencies/ProficiencyMagicalMusic";
import { ProficiencyMasteryOfCharmsAndIllusions } from "../proficiencies/ProficiencyMasteryOfCharmsAndIllusions";
import { ProficiencyMimicry } from "../proficiencies/ProficiencyMimicry";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencySoothsaying } from "../proficiencies/ProficiencySoothsaying";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTransmogrification } from "../proficiencies/ProficiencyTransmogrification";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassElvenEnchanter: CharacterClass = {
  name: "Elven Enchanter",
  hitDieSize: 4,
  hpStep: 1,
  primeRequisites: [CharacterStat.Charisma, CharacterStat.Intelligence],
  statRequirements: { [CharacterStat.Intelligence]: 9 },
  xpToLevel: [0, 2700, 5400, 10800, 21600, 43200, 85000, 170000, 370000, 570000, 770000, 970000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded],
  weaponTypePermissions: [WeaponType.Dagger, WeaponType.Dart, WeaponType.Sling, WeaponType.Staff],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 0,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 9],
    [SavingThrowType.PoisonAndDeath]: [13, 13, 13, 12, 12, 12, 11, 11, 11, 10, 10, 10],
    [SavingThrowType.BlastAndBreath]: [15, 15, 15, 14, 14, 14, 13, 13, 13, 12, 12, 12],
    [SavingThrowType.StaffsAndWands]: [11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8],
    [SavingThrowType.Spells]: [11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8],
  },
  toHitBonus: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: ElfAttunementToNature, rank: 1, minLevel: 1 },
    { def: ElfConnectionToNature, rank: 1, minLevel: 1 },
    { def: ElfKeenEyes, rank: 1, minLevel: 1 },
    { def: ProficiencyMasteryOfCharmsAndIllusions, rank: 1, minLevel: 1 },
    { def: ProficiencyMysticAura, rank: 1, minLevel: 1 },
    { def: ProficiencyPrestidigitation, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 5 },
    { def: SharedMajorMagicCreation, rank: 1, minLevel: 9 },
    { def: SharedRitualMagic, rank: 1, minLevel: 11 },
    { def: SharedCreateMagicalConstructs, rank: 1, minLevel: 11 },
    { def: SharedCreateMagicalCrossbreeds, rank: 1, minLevel: 11 },
    { def: SharedCreateUndead, rank: 1, minLevel: 11 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Elven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnoll", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Hobgoblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Orc", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 6, 11],
  classProficiencies: [
    { def: ProficiencyAlchemy },
    { def: ProficiencyAlertness },
    { def: ProficiencyArt },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyCollegiateWizardry },
    { def: ProficiencyContortionism },
    { def: ProficiencyCraft },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyDisguise },
    { def: ProficiencyFamiliar },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLanguage },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMagicalMusic },
    { def: ProficiencyMimicry },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPerformance },
    { def: ProficiencyProfession },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRunning },
    { def: ProficiencySecondSight },
    { def: ProficiencySensingPower },
    { def: ProficiencySoothsaying },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTransmogrification },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWakefulness },
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
        [4, 3, 3, 3, 2, 1],
        [4, 4, 3, 3, 3, 2],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 11,
      ritualLevels: [7, 8, 9],
    },
  ],
  levelBasedSkills: [],
};
