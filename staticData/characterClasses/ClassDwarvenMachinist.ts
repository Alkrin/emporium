import { DwarfAttentionToDetail } from "../classFeatures/DwarfAttentionToDetail";
import { DwarfStoneSense } from "../classFeatures/DwarfStoneSense";
import { DwarvenMachinistPersonalAutomaton } from "../classFeatures/DwarvenMachinistPersonalAutomaton";
import { ProficiencyAdventuring } from "../proficiencies/ProficiencyAdventuring";
import { ProficiencyAlchemy } from "../proficiencies/ProficiencyAlchemy";
import { ProficiencyArmorTraining } from "../proficiencies/ProficiencyArmorTraining";
import { ProficiencyBargaining } from "../proficiencies/ProficiencyBargaining";
import { ProficiencyCaving } from "../proficiencies/ProficiencyCaving";
import { ProficiencyCraft } from "../proficiencies/ProficiencyCraft";
import { ProficiencyDungeonBashing } from "../proficiencies/ProficiencyDungeonBashing";
import { ProficiencyDwarvenBrewing } from "../proficiencies/ProficiencyDwarvenBrewing";
import { ProficiencyExperimenting } from "../proficiencies/ProficiencyExperimenting";
import { ProficiencyHealing } from "../proficiencies/ProficiencyHealing";
import { ProficiencyInventing } from "../proficiencies/ProficiencyInventing";
import { ProficiencyJuryRigging } from "../proficiencies/ProficiencyJuryRigging";
import { ProficiencyKnowledge } from "../proficiencies/ProficiencyKnowledge";
import { ProficiencyLanguage } from "../proficiencies/ProficiencyLanguage";
import { ProficiencyLockPicking } from "../proficiencies/ProficiencyLockPicking";
import { ProficiencyLoremastery } from "../proficiencies/ProficiencyLoremastery";
import { ProficiencyMagicalEngineering } from "../proficiencies/ProficiencyMagicalEngineering";
import { ProficiencyMapping } from "../proficiencies/ProficiencyMapping";
import { ProficiencyMartialTraining } from "../proficiencies/ProficiencyMartialTraining";
import { ProficiencyMechanicalEngineering } from "../proficiencies/ProficiencyMechanicalEngineering";
import { ProficiencyMilitaryStrategy } from "../proficiencies/ProficiencyMilitaryStrategy";
import { ProficiencyNavigation } from "../proficiencies/ProficiencyNavigation";
import { ProficiencyPreciseShooting } from "../proficiencies/ProficiencyPreciseShooting";
import { ProficiencyProspecting } from "../proficiencies/ProficiencyProspecting";
import { ProficiencyRiding } from "../proficiencies/ProficiencyRiding";
import { ProficiencyScavenging } from "../proficiencies/ProficiencyScavenging";
import { ProficiencySecondSight } from "../proficiencies/ProficiencySecondSight";
import { ProficiencySignaling } from "../proficiencies/ProficiencySignaling";
import { ProficiencyTinkering } from "../proficiencies/ProficiencyTinkering";
import { ProficiencyTrapfinding } from "../proficiencies/ProficiencyTrapfinding";
import { ProficiencyTrapping } from "../proficiencies/ProficiencyTrapping";
import { ProficiencyWeaponFinesse } from "../proficiencies/ProficiencyWeaponFinesse";
import { ProficiencyWeaponFocus } from "../proficiencies/ProficiencyWeaponFocus";
import { WeaponStyle, CharacterClass, CharacterStat, SavingThrowType } from "../types/characterClasses";
import { WeaponType } from "../types/items";

export const ClassDwarvenMachinist: CharacterClass = {
  name: "Dwarven Machinist",
  hitDieSize: 6,
  hpStep: 3,
  primeRequisites: [CharacterStat.Dexterity, CharacterStat.Intelligence],
  statRequirements: { [CharacterStat.Constitution]: 9 },
  xpToLevel: [0, 2400, 4800, 9600, 19200, 38400, 77000, 154000, 280000, 410000],
  weaponStyles: [WeaponStyle.OneHandOnly, WeaponStyle.OneHandAndShield],
  weaponTypePermissions: [
    WeaponType.Arbalest,
    WeaponType.BattleAxe,
    WeaponType.Crossbow,
    WeaponType.Flail,
    WeaponType.HandAxe,
    WeaponType.Warhammer,
  ],
  maxBaseArmor: 2, // Leather
  cleaveMultiplier: 0.5,
  savingThrows: {
    [SavingThrowType.Paralysis]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5],
    [SavingThrowType.Death]: [9, 9, 8, 8, 7, 7, 6, 6, 5, 5],
    [SavingThrowType.Blast]: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6],
    [SavingThrowType.Implements]: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6],
    [SavingThrowType.Spells]: [11, 11, 10, 10, 9, 9, 8, 8, 7, 7],
  },
  toHitBonus: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
  classFeatures: [
    { def: ProficiencyAdventuring, rank: 1, minLevel: 1 },
    { def: DwarfAttentionToDetail, rank: 1, minLevel: 1 },
    { def: DwarfStoneSense, rank: 1, minLevel: 1 },
    { def: DwarvenMachinistPersonalAutomaton, rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Common", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Dwarven", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Goblin", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Gnome", rank: 1, minLevel: 1 },
    { def: ProficiencyLanguage, subtype: "Kobold", rank: 1, minLevel: 1 },
  ],
  selectableClassFeatures: [{ title: "Craft", selections: { def: ProficiencyCraft, rank: 3 } }],
  classProficienciesAt: [1, 4, 8],
  classProficiencies: [
    { def: ProficiencyAlchemy },
    { def: ProficiencyArmorTraining },
    { def: ProficiencyBargaining },
    { def: ProficiencyCaving },
    { def: ProficiencyCraft },
    { def: ProficiencyDungeonBashing },
    { def: ProficiencyDwarvenBrewing },
    { def: ProficiencyExperimenting },
    { def: ProficiencyHealing },
    { def: ProficiencyInventing },
    { def: ProficiencyJuryRigging },
    { def: ProficiencyKnowledge },
    { def: ProficiencyLockPicking },
    { def: ProficiencyLoremastery },
    { def: ProficiencyMagicalEngineering },
    { def: ProficiencyMapping },
    { def: ProficiencyMartialTraining },
    { def: ProficiencyMechanicalEngineering },
    { def: ProficiencyMilitaryStrategy },
    { def: ProficiencyNavigation },
    { def: ProficiencyPreciseShooting },
    { def: ProficiencyProspecting },
    { def: ProficiencyRiding },
    { def: ProficiencyScavenging },
    { def: ProficiencySecondSight },
    { def: ProficiencySignaling },
    { def: ProficiencyTinkering },
    { def: ProficiencyTrapfinding },
    { def: ProficiencyTrapping },
    { def: ProficiencyWeaponFinesse },
    { def: ProficiencyWeaponFocus },
  ],
  spellcasting: [],
  levelBasedSkills: [
    {
      name: "Find Traps",
      rolls: ["14+", "13+", "12+", "11+", "10+", "8+", "6+", "4+", "2+", "1+"],
    },
    {
      name: "Remove Traps",
      rolls: ["15+", "14+", "13+", "12+", "11+", "10+", "8+", "6+", "4+", "2+"],
    },
    {
      name: "Open Locks",
      rolls: ["15+", "14+", "13+", "12+", "11+", "9+", "7+", "5+", "3+", "1+"],
    },
    {
      name: "Design/Build/Repair Automatons",
      rolls: ["14+", "13+", "12+", "11+", "10+", "9+", "8+", "7+", "6+", "5+"],
    },
    {
      name: "Construction Rate",
      rolls: ["5gp", "7gp", "15gp", "25gp", "50gp", "100gp", "200gp", "400gp", "600gp", "900gp"],
    },
  ],
};
