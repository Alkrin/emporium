import { NobiranWonderworkerBloodOfAncientKings } from "../classFeatures/NobiranWonderworkerBloodOfAncientKings";
import { SharedAgeless } from "../classFeatures/SharedAgeless";
import { SharedCreateMagicalConstructs } from "../classFeatures/SharedCreateMagicalConstructs";
import { SharedCreateMagicalCrossbreeds } from "../classFeatures/SharedCreateMagicalCrossbreeds";
import { SharedCreateUndead } from "../classFeatures/SharedCreateUndead";
import { SharedMajorMagicCreation } from "../classFeatures/SharedMajorMagicCreation";
import { SharedMinorMagicCreation } from "../classFeatures/SharedMinorMagicCreation";
import { SharedRitualMagic } from "../classFeatures/SharedRitualMagic";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyApostasy } from "../proficiencies/ProficiencyApostasy";
import { ProficiencyBattleMagic } from "../proficiencies/ProficiencyBattleMagic";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyCollegiateWizardry } from "../proficiencies/ProficiencyCollegiateWizardry";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyContemplation } from "../proficiencies/ProficiencyContemplation";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyElementalism } from "../proficiencies/ProficiencyElementalism";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySensingEvil } from "../proficiencies/ProficiencySensingEvil";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencyTheology } from "../proficiencies/ProficiencyTheology";
import { ProficiencyTransmogrification } from "../proficiencies/ProficiencyTransmogrification";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassNobiranWonderworker: CharacterClass = {
  name: "Nobiran Wonderworker",
  hitDieSize: 4,
  hpStep: 1,
  primeRequisites: [CharacterStat.Intelligence, CharacterStat.Wisdom],
  statRequirements: {
    [CharacterStat.Strength]: 11,
    [CharacterStat.Intelligence]: 11,
    [CharacterStat.Wisdom]: 11,
    [CharacterStat.Dexterity]: 11,
    [CharacterStat.Constitution]: 11,
    [CharacterStat.Charisma]: 11,
  },
  xpToLevel: [0, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 310000, 460000, 610000, 760000, 910000, 1060000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded],
  weaponTypePermissions: [WeaponType.Club, WeaponType.Dagger, WeaponType.Dart, WeaponType.Staff],
  maxBaseArmor: 0, // None
  cleaveMultiplier: 0,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8],
    [SavingThrowType.PoisonAndDeath]: [11, 11, 11, 10, 10, 10, 9, 9, 9, 8, 8, 8],
    [SavingThrowType.BlastAndBreath]: [13, 13, 13, 12, 12, 12, 11, 11, 11, 10, 10, 10],
    [SavingThrowType.StaffsAndWands]: [9, 9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6],
    [SavingThrowType.Spells]: [10, 10, 10, 9, 9, 9, 8, 8, 8, 7, 7, 7],
  },
  toHitBonus: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  classFeatures: [
    { def: ProficiencyAdventuring },
    { def: NobiranWonderworkerBloodOfAncientKings },
    { def: SharedAgeless },
    { def: SharedMinorMagicCreation },
    { def: SharedMajorMagicCreation },
    { def: SharedRitualMagic },
    { def: SharedCreateMagicalConstructs },
    { def: SharedCreateMagicalCrossbreeds },
    { def: SharedCreateUndead },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLanguage, subtypes: ["Common"] },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 6, 11],
  classProficiencies: [
    { def: ProficiencyApostasy },
    { def: ProficiencyBattleMagic },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyCollegiateWizardry },
    { def: ProficiencyCommand },
    { def: ProficiencyContemplation },
    { def: ProficiencyCraft },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyElementalism },
    { def: ProficiencyFamiliar },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLanguage },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLeadership },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyMysticAura },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession },
    { def: ProficiencyQuietMagic },
    { def: ProficiencySecondSight },
    { def: ProficiencySensingEvil },
    { def: ProficiencySensingPower },
    { def: ProficiencyTheology },
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
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 11,
      ritualLevels: [7, 8, 9],
    },
    {
      spellSource: SpellType.Divine,
      spellTypes: [SpellType.Divine],
      requiresSpellbook: false,
      spellSlots: [
        [0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [2, 1, 0, 0, 0],
        [2, 2, 0, 0, 0],
        [2, 2, 1, 1, 0],
        [2, 2, 2, 1, 1],
        [3, 3, 2, 2, 1],
        [3, 3, 3, 2, 2],
        [4, 4, 3, 3, 2],
        [4, 4, 4, 3, 3],
        [5, 5, 4, 4, 3],
      ],
      minRitualLevel: 11,
      ritualLevels: [6, 7],
    },
  ],
  levelBasedSkills: [],
};
