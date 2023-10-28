import { VenturerAvoidGettingLost } from "../classFeatures/VenturerAvoidGettingLost";
import { VenturerMercantileNetwork } from "../classFeatures/VenturerMercantileNetwork";
import { VenturerReadLanguages } from "../classFeatures/VenturerReadLanguages";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyAmbushing } from "../proficiencies/ProficiencyAmbushing";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyBargaining } from "../proficiencies/ProficiencyBargaining";
import { ProficiencyBribery } from "../proficiencies/ProficiencyBribery";
import { ProficiencyClimbing } from "../proficiencies/ProficiencyClimbing";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyGambling } from "../proficiencies/ProficiencyGambling";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLipReading } from "../proficiencies/ProficiencyLipReading";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMountaineering } from "../proficiencies/ProficiencyMountaineering";
import { ProficiencyNavigation } from "../proficiencies/ProficiencyNavigation";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySeafaring } from "../proficiencies/ProficiencySeafaring";
import { ProficiencySignaling } from "../proficiencies/ProficiencySignaling";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";

export const ClassVenturer: CharacterClass = {
  name: "Venturer",
  hitDieSize: 4,
  hpStep: 2,
  primeRequisites: [CharacterStat.Charisma],
  statRequirements: {},
  xpToLevel: [0, 1525, 3050, 6100, 12200, 24400, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  weaponStyles: [WeaponStyle.OneHandOnly],
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
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: ProficiencyBargaining, rank: 1, minLevel: 1 },
    { def: ProficiencyBribery, rank: 1, minLevel: 1 },
    { def: ProficiencyDiplomacy, rank: 1, minLevel: 1 },
    { def: VenturerAvoidGettingLost, rank: 1, minLevel: 1 },
    { def: VenturerMercantileNetwork, rank: 1, minLevel: 1 },
    { def: VenturerReadLanguages, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyAlertness },
    { def: ProficiencyAmbushing },
    { def: ProficiencyArcaneDabbling },
    { def: ProficiencyBargaining },
    { def: ProficiencyClimbing },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Incapacitate"] },
    { def: ProficiencyCommand },
    { def: ProficiencyGambling },
    { def: ProficiencyIntimidation },
    { def: ProficiencyLanguage },
    { def: ProficiencyLeadership },
    { def: ProficiencyLipReading },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMapping },
    { def: ProficiencyMountaineering },
    { def: ProficiencyNavigation },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyProfession },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySeafaring },
    { def: ProficiencySignaling },
    { def: ProficiencySkirmishing },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyWeaponFinesse },
  ],
  spellcasting: [
    {
      spellSource: SpellType.Arcane,
      spellTypes: [SpellType.Arcane],
      requiresSpellbook: true,
      spellSlots: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [2, 0, 0, 0],
        [2, 1, 0, 0],
        [2, 2, 0, 0],
        [2, 2, 1, 0],
        [2, 2, 2, 0],
        [3, 2, 2, 1],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 15, // Max level is 14.  No capacity to cast rituals.
      ritualLevels: [],
    },
  ],
  levelBasedSkills: [
    {
      name: "Hear Noise",
      rolls: ["14+", "13+", "12+", "11+", "10+", "9+", "8+", "7+", "6+", "5+", "4+", "3+", "2+", "1+"],
    },
  ],
};
