import { ElfAttunementToNature } from "../classFeatures/ElfAttunementToNature";
import { ElfConnectionToNature } from "../classFeatures/ElfConnectionToNature";
import { ElfKeenEyes } from "../classFeatures/ElfKeenEyes";
import { ElvenCourtierEnchantingPerformance } from "../classFeatures/ElvenCourtierEnchantingPerformance";
import { SharedHalfMinorMagicCreation } from "../classFeatures/SharedHalfMinorMagicCreation";
import { SharedInspireCourage } from "../classFeatures/SharedInspireCourage";
import { SharedMeleeAccuracyBonus } from "../classFeatures/SharedMeleeAccuracyBonus";
import { SharedRangedAccuracyBonus } from "../classFeatures/SharedRangedAccuracyBonus";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyBribery } from "../proficiencies/ProficiencyBribery";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyEavesdropping } from "../proficiencies/ProficiencyEavesdropping";
import { ProficiencyFamiliar } from "../proficiencies/ProficiencyFamiliar";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLayOnHands } from "../proficiencies/ProficiencyLayOnHands";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyNaturalism } from "../proficiencies/ProficiencyNaturalism";
import { ProficiencyPassingWithoutTrace } from "../proficiencies/ProficiencyPassingWithoutTrace";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyProfession } from "../proficiencies/ProficiencyProfession";
import { ProficiencyQuietMagic } from "../proficiencies/ProficiencyQuietMagic";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencySensingPower } from "../proficiencies/ProficiencySensingPower";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyUnflappableCasting } from "../proficiencies/ProficiencyUnflappableCasting";
import { ProficiencyWakefulness } from "../proficiencies/ProficiencyWakefulness";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType, SpellType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassElvenCourtier: CharacterClass = {
  name: "Elven Courtier",
  hitDieSize: 6,
  hpStep: 1,
  primeRequisites: [CharacterStat.Charisma, CharacterStat.Intelligence],
  statRequirements: { [CharacterStat.Intelligence]: 9 },
  xpToLevel: [0, 2600, 5200, 10400, 20800, 41600, 85000, 170000, 370000, 520000, 670000, 820000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.DualWield, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [
    WeaponType.CompositeBow,
    WeaponType.Dagger,
    WeaponType.Lance,
    WeaponType.ShortSword,
    WeaponType.Spear,
    WeaponType.Sword,
  ],
  maxBaseArmor: 4, // Chain
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.PetrificationAndParalysis]: [12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
    [SavingThrowType.PoisonAndDeath]: [13, 13, 12, 12, 11, 11, 10, 10, 9, 9, 8, 8],
    [SavingThrowType.BlastAndBreath]: [16, 16, 15, 15, 14, 14, 13, 13, 12, 12, 11, 11],
    [SavingThrowType.StaffsAndWands]: [14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
    [SavingThrowType.Spells]: [14, 14, 13, 13, 12, 12, 11, 11, 10, 10, 9, 9],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  classFeatures: [
    { def: ProficiencyAdventuring },
    { def: ElfAttunementToNature },
    { def: ElfConnectionToNature },
    { def: ElfKeenEyes },
    { def: ElvenCourtierEnchantingPerformance },
    { def: ProficiencyDiplomacy },
    { def: SharedHalfMinorMagicCreation },
    { def: SharedInspireCourage },
    { def: ProficiencyLanguage, subtypes: ["Common"] },
    { def: ProficiencyLanguage, subtypes: ["Elven"] },
    { def: ProficiencyLanguage, subtypes: ["Gnoll"] },
    { def: ProficiencyLanguage, subtypes: ["Hobgoblin"] },
    { def: ProficiencyLanguage, subtypes: ["Orc"] },
  ],
  selectableClassFeatures: [
    { title: "Accuracy Bonus", selections: [{ def: SharedMeleeAccuracyBonus }, { def: SharedRangedAccuracyBonus }] },
    { title: "Performance", selections: { def: ProficiencyPerformance, rank: 1 } },
  ],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyBribery },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm", "Sunder"] },
    { def: ProficiencyCommand },
    { def: ProficiencyEavesdropping },
    { def: ProficiencyFamiliar },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge, subtypes: ["Political History"] },
    { def: ProficiencyLayOnHands },
    { def: ProficiencyLeadership },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyMysticAura },
    { def: ProficiencyNaturalism },
    { def: ProficiencyPassingWithoutTrace },
    { def: ProficiencyPerformance },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyProfession, subtypes: ["Seneschal"] },
    { def: ProficiencyQuietMagic },
    { def: ProficiencyRiding },
    { def: ProficiencySensingPower },
    { def: ProficiencySkirmishing },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyUnflappableCasting },
    { def: ProficiencyWakefulness },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [
    {
      spellTypes: [SpellType.Arcane],
      requiresSpellbook: true,
      spellSlots: [
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],
        [2, 0, 0],
        [2, 1, 0],
        [2, 1, 0],
        [2, 2, 0],
        [2, 2, 0],
        [2, 2, 1],
        [2, 2, 1],
        [2, 2, 2],
        [2, 2, 2],
      ],
      repertoireStat: CharacterStat.Intelligence,
      minRitualLevel: 13, // Max level is 12, so no rituals.
      ritualLevels: [],
    },
  ],
  levelBasedSkills: [],
};
