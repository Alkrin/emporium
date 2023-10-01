import { SharedMeleeDamageBonus } from "../classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../classFeatures/SharedRangedDamageBonus";
import { WildHarvesterBoundToNature } from "../classFeatures/WildHarvesterBoundToNature";
import { WildHarvesterConnectionToNature } from "../classFeatures/WildHarvesterConnectionToNature";
import { WildHarvesterNaturalTactics } from "../classFeatures/WildHarvesterNaturalTactics";
import { WildHarvesterNaturallyStealthy } from "../classFeatures/WildHarvesterNaturallyStealthy";
import { WildHarvesterSeenItAll } from "../classFeatures/WildHarvesterSeenItAll";
import { WildHarvesterWorldConnection } from "../classFeatures/WildHarvesterWorldConnection";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyAlertness } from "../proficiencies/ProficiencyAlertness";
import { ProficiencyAnimalHusbandry } from "../proficiencies/ProficiencyAnimalHusbandry";
import { ProficiencyAnimalTraining } from "../proficiencies/ProficiencyAnimalTraining";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBlindFighting } from "../proficiencies/ProficiencyBlindFighting";
import { ProficiencyCaving } from "../proficiencies/ProficiencyCaving";
import { ProficiencyCombatReflexes } from "../proficiencies/ProficiencyCombatReflexes";
import { ProficiencyDivineBlessing } from "../proficiencies/ProficiencyDivineBlessing";
import { ProficiencyDivineHealth } from "../proficiencies/ProficiencyDivineHealth";
import { ProficiencyEndurance } from "../proficiencies/ProficiencyEndurance";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyIntimidation } from "../proficiencies/ProficiencyIntimidation";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMimicry } from "../proficiencies/ProficiencyMimicry";
import { ProficiencyMountaineering } from "../proficiencies/ProficiencyMountaineering";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySurvival } from "../proficiencies/ProficiencySurvival";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyTracking } from "../proficiencies/ProficiencyTracking";
import { ProficiencyTrapping } from "../proficiencies/ProficiencyTrapping";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassWildHarvester: CharacterClass = {
  name: "Wild Harvester",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Strength],
  statRequirements: {},
  xpToLevel: [0, 3175, 6350, 12700, 25400, 50800, 100000, 220000, 340000, 460000, 580000, 700000, 820000, 940000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.TwoHanded, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [
    WeaponType.BattleAxe,
    WeaponType.GreatAxe,
    WeaponType.HandAxe,
    WeaponType.Javelin,
    WeaponType.PoleArm,
    WeaponType.Spear,
  ],
  maxBaseArmor: 1, // Fur / hide.
  cleaveMultiplier: 1,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8, 8, 7, 6],
    [SavingThrowType.PoisonAndDeath]: [14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7, 7, 6, 5],
    [SavingThrowType.BlastAndBreath]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.StaffsAndWands]: [16, 15, 15, 14, 13, 13, 12, 11, 11, 10, 9, 9, 8, 7],
    [SavingThrowType.Spells]: [17, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 10, 9, 8],
  },
  toHitBonus: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9],
  classFeatures: [
    { def: ProficiencyAdventuring },
    { def: ProficiencyAlchemy },
    { def: ProficiencyAnimalHusbandry },
    { def: ProficiencyMagicalEngineering },
    { def: WildHarvesterBoundToNature },
    { def: WildHarvesterConnectionToNature },
    { def: WildHarvesterNaturallyStealthy },
    { def: WildHarvesterNaturalTactics },
    { def: WildHarvesterSeenItAll },
    { def: WildHarvesterWorldConnection },
    { def: SharedMeleeDamageBonus },
    { def: SharedRangedDamageBonus },
    { def: ProficiencyLanguage, subtypes: ["Common"] },
  ],
  selectableClassFeatures: [],
  classProficienciesAt: [1, 3, 6, 9, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyAlchemy },
    { def: ProficiencyAlertness },
    { def: ProficiencyAnimalHusbandry },
    { def: ProficiencyAnimalTraining },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBlindFighting },
    { def: ProficiencyCaving },
    { def: ProficiencyCombatReflexes },
    { def: ProficiencyDivineBlessing },
    { def: ProficiencyDivineHealth },
    { def: ProficiencyEndurance },
    { def: ProficiencyHealing },
    { def: ProficiencyIntimidation },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMimicry },
    { def: ProficiencyMountaineering },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyRiding },
    { def: ProficiencyRunning },
    { def: ProficiencySkirmishing },
    { def: ProficiencySurvival },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyTracking },
    { def: ProficiencyTrapping },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellSource: SpellType.Arcane,
      spellTypes: [SpellType.Arcane],
      requiresSpellbook: true,
      spellSlots: [
        [0, 0],
        [0, 0],
        [1, 0],
        [1, 0],
        [1, 0],
        [2, 0],
        [2, 0],
        [2, 0],
        [2, 1],
        [2, 1],
        [2, 1],
        [2, 2],
        [2, 2],
        [2, 2],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 15, // Max level is 14.  No ritual capacity.
      ritualLevels: [],
    },
  ],
  levelBasedSkills: [],
};
