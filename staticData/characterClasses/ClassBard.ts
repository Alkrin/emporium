import { BardArcaneScrollUse } from "../classFeatures/BardArcaneScrollUse";
import { BardChroniclesOfBattle } from "../classFeatures/BardChroniclesOfBattle";
import { BardReadLanguages } from "../classFeatures/BardReadLanguages";
import { SharedInspireCourage } from "../classFeatures/SharedInspireCourage";
import { ProficiencyAcrobatics } from "../proficiencies/ProficiencyAcrobatics";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyArcaneDabbling } from "../proficiencies/ProficiencyArcaneDabbling";
import { ProficiencyArt } from "../proficiencies/ProficiencyArt";
import { ProficiencyBargaining } from "../proficiencies/ProficiencyBargaining";
import { ProficiencyBeastFriendship } from "../proficiencies/ProficiencyBeastFriendship";
import { ProficiencyCombatTrickery } from "../proficiencies/ProficiencyCombatTrickery";
import { ProficiencyCommand } from "../proficiencies/ProficiencyCommand";
import { ProficiencyDiplomacy } from "../proficiencies/ProficiencyDiplomacy";
import { ProficiencyEavesdropping } from "../proficiencies/ProficiencyEavesdropping";
import { ProficiencyElvenBloodline } from "../proficiencies/ProficiencyElvenBloodline";
import { ProficiencyFightingStyle } from "../proficiencies/ProficiencyFightingStyle";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLeadership } from "../proficiencies/ProficiencyLeadership";
import { ProficiencyLipReading } from "../proficiencies/ProficiencyLipReading";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMagicalMusic } from "../proficiencies/ProficiencyMagicalMusic";
import { ProficiencyMimicry } from "../proficiencies/ProficiencyMimicry";
import { ProficiencyMysticAura } from "../proficiencies/ProficiencyMysticAura";
import { ProficiencyPerformance } from "../proficiencies/ProficiencyPerformance";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyPrestidigitation } from "../proficiencies/ProficiencyPrestidigitation";
import { ProficiencyRunning } from "../proficiencies/ProficiencyRunning";
import { ProficiencySeduction } from "../proficiencies/ProficiencySeduction";
import { ProficiencySkirmishing } from "../proficiencies/ProficiencySkirmishing";
import { ProficiencySwashbuckling } from "../proficiencies/ProficiencySwashbuckling";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";

export const ClassBard: CharacterClass = {
  name: "Bard",
  hitDieSize: 6,
  hpStep: 2,
  primeRequisites: [CharacterStat.Charisma, CharacterStat.Dexterity],
  statRequirements: {},
  xpToLevel: [0, 1400, 2800, 5600, 11200, 22400, 45000, 90000, 190000, 290000, 390000, 490000, 590000, 690000],
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
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: ProficiencyLoremastery, rank: 1, minLevel: 1 },
    { def: ProficiencyArcaneDabbling, rank: 1, minLevel: 1 },
    { def: SharedInspireCourage, rank: 1, minLevel: 1 },
    { def: BardReadLanguages, rank: 1, minLevel: 4 },
    { def: BardChroniclesOfBattle, rank: 1, minLevel: 5 },
    { def: BardArcaneScrollUse, rank: 1, minLevel: 10 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [{ title: "Performance", selections: { def: ProficiencyPerformance, rank: 1 } }],
  classProficienciesAt: [1, 4, 8, 12],
  classProficiencies: [
    { def: ProficiencyAcrobatics },
    { def: ProficiencyArt },
    { def: ProficiencyBargaining },
    { def: ProficiencyBeastFriendship },
    { def: ProficiencyCombatTrickery, subtypes: ["Disarm"] },
    { def: ProficiencyCommand },
    { def: ProficiencyDiplomacy },
    { def: ProficiencyEavesdropping },
    { def: ProficiencyElvenBloodline },
    { def: ProficiencyFightingStyle },
    { def: ProficiencyHealing },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLanguage },
    { def: ProficiencyLeadership },
    { def: ProficiencyLipReading },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMagicalMusic },
    { def: ProficiencyMimicry },
    { def: ProficiencyMysticAura },
    { def: ProficiencyPerformance },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyPrestidigitation },
    { def: ProficiencyRunning },
    { def: ProficiencySeduction },
    { def: ProficiencySkirmishing },
    { def: ProficiencySwashbuckling },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [],
};
