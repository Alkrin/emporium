import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateMagicalCrossbreeds } from "../classFeatures/SharedCreateMagicalCrossbreeds";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlackLoreOfZahar } from "../proficiencies/ProficiencyBlackLoreOfZahar";
import { ProficiencyCollegiateWizardry } from "../proficiencies/ProficiencyCollegiateWizardry";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyElementalism } from "../proficiencies/ProficiencyElementalism";
import { ProficiencyElvenBloodline } from "../proficiencies/ProficiencyElvenBloodline";
import { ProficiencyEngineering } from "../proficiencies/ProficiencyEngineering";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencySoothsaying } from "../proficiencies/ProficiencySoothsaying";
import { ProficiencyTransmogrification } from "../proficiencies/ProficiencyTransmogrification";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassMage: CharacterClass = {
  name: "Mage",
  hitDieSize: 4,
  hpStep: 1,
  primeRequisites: [CharacterStat.Intelligence],
  statRequirements: {},
  xpToLevel: [0, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 310000, 460000, 610000, 760000, 910000, 1060000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded],
  weaponTypePermissions: [WeaponType.Club, WeaponType.Dagger, WeaponType.Dart, WeaponType.Staff],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 0,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [13, 13, 13, 12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9],
    [SavingThrowType.PoisonAndDeath]: [13, 13, 13, 12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9],
    [SavingThrowType.BlastAndBreath]: [15, 15, 15, 14, 14, 14, 13, 13, 13, 12, 12, 12, 11, 11],
    [SavingThrowType.StaffsAndWands]: [11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8, 7, 7],
    [SavingThrowType.Spells]: [12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8],
  },
  toHitBonus: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: SharedMinorMagicCreation, rank: 1, minLevel: 5 },
    { def: SharedMajorMagicCreation, rank: 1, minLevel: 9 },
    { def: SharedRitualMagic, rank: 1, minLevel: 11 },
    { def: SharedCreateMagicalConstructs, rank: 1, minLevel: 11 },
    { def: SharedCreateMagicalCrossbreeds, rank: 1, minLevel: 11 },
    { def: SharedCreateUndead, rank: 1, minLevel: 11 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 6, 11],
  classProficiencies: [
    { def: ProficiencyAlchemy },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlackLoreOfZahar },
    { def: ProficiencyCollegiateWizardry },
    { def: ProficiencyCraft },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyElementalism },
    { def: ProficiencyElvenBloodline },
    { def: ProficiencyEngineering },
    { def: ProficiencyFamiliar },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLanguage },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMapping },
    { def: ProficiencyMysticAura },
    { def: ProficiencyNaturalism },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyPerformance },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession },
    { def: ProficiencySecondSight },
    { def: ProficiencySensingPower },
    { def: ProficiencySoothsaying },
    { def: ProficiencyTransmogrification },
    { def: ProficiencyUnflappableCasting },
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
        [4, 4, 4, 3, 3, 2],
        [4, 4, 4, 4, 3, 3],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 11,
      ritualLevels: [7, 8, 9],
    },
  ],
  levelBasedSkills: [],
};
