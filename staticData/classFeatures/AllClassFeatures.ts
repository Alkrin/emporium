import { Dictionary } from "../../lib/dictionary";
import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";
import { AntiPaladinAuraOfProtection } from "./AntiPaladinAuraOfProtection";
import { AntiPaladinDetectGood } from "./AntiPaladinDetectGood";
import { AntiPaladinUnholyFanaticism } from "./AntiPaladinUnholyFanaticism";
import { BarbarianAnimalMagnetism } from "./BarbarianAnimalMagnetism";
import { BarbarianSavageResilience } from "./BarbarianSavageResilience";
import { BardArcaneScrollUse } from "./BardArcaneScrollUse";
import { BardChroniclesOfBattle } from "./BardChroniclesOfBattle";
import { BardInspireCourage } from "./BardInspireCourage";
import { BardReadLanguages } from "./BardReadLanguages";
import { BladeDancerMobility } from "./BladeDancerDefensiveMobility";
import { DwarfStoneSense } from "./DwarfStoneSense";
import { DwarvenCraftpriestAttentionToDetail } from "./DwarvenCraftpriestAttentionToDetail";
import { DwarvenCraftpriestCreateMagicalConstructs } from "./DwarvenCraftpriestCreateMagicalConstructs";
import { DwarvenCraftpriestReligiousTraining } from "./DwarvenCraftpriestReligiousTraining";
import { ElfAttunementToNature } from "./ElfAttunementToNature";
import { ElfConnectionToNature } from "./ElfConnectionToNature";
import { ElfKeenEyes } from "./ElfKeenEyes";
import { ExplorerExperienceAndHardiness } from "./ExplorerExperienceAndHardiness";
import { ExplorerExplorationBonuses } from "./ExplorerExplorationBonuses";
import { FighterBattlefieldProwess } from "./FighterBattlefieldProwess";
import { PaladinAuraOfProtection } from "./PaladinAuraOfProtection";
import { SharedAnimalReflexes } from "./SharedAnimalReflexes";
import { SharedCreateMagicalConstructs } from "./SharedCreateMagicalConstructs";
import { SharedCreateMagicalCrossbreeds } from "./SharedCreateMagicalCrossbreeds";
import { SharedCreateUndead } from "./SharedCreateUndead";
import { SharedDifficultToSpot } from "./SharedDifficultToSpot";
import { SharedHalfMinorMagicCreation } from "./SharedHalfMinorMagicCreation";
import { SharedMajorMagicCreation } from "./SharedMajorMagicCreation";
import { SharedMeleeDamageBonus } from "./SharedMeleeDamageBonus";
import { SharedMinorMagicCreation } from "./SharedMinorMagicCreation";
import { SharedNaturallyStealthy } from "./SharedNaturallyStealthy";
import { SharedRangedAccuracyBonus } from "./SharedRangedAccuracyBonus";
import { SharedRangedDamageBonus } from "./SharedRangedDamageBonus";
import { SharedRitualMagic } from "./SharedRitualMagic";
import { ZaharanAfterTheFlesh } from "./ZaharanAfterTheFlesh";

export const AllClassFeatures: Dictionary<AbilityOrProficiency> = {
  [AntiPaladinAuraOfProtection.id]: AntiPaladinAuraOfProtection,
  [AntiPaladinDetectGood.id]: AntiPaladinDetectGood,
  [AntiPaladinUnholyFanaticism.id]: AntiPaladinUnholyFanaticism,
  [BarbarianAnimalMagnetism.id]: BarbarianAnimalMagnetism,
  [BarbarianSavageResilience.id]: BarbarianSavageResilience,
  [BardArcaneScrollUse.id]: BardArcaneScrollUse,
  [BardChroniclesOfBattle.id]: BardChroniclesOfBattle,
  [BardInspireCourage.id]: BardInspireCourage,
  [BardReadLanguages.id]: BardReadLanguages,
  [BladeDancerMobility.id]: BladeDancerMobility,
  [DwarfStoneSense.id]: DwarfStoneSense,
  [DwarvenCraftpriestAttentionToDetail.id]: DwarvenCraftpriestAttentionToDetail,
  [DwarvenCraftpriestCreateMagicalConstructs.id]: DwarvenCraftpriestCreateMagicalConstructs,
  [DwarvenCraftpriestReligiousTraining.id]: DwarvenCraftpriestReligiousTraining,
  [ElfAttunementToNature.id]: ElfAttunementToNature,
  [ElfConnectionToNature.id]: ElfConnectionToNature,
  [ElfKeenEyes.id]: ElfKeenEyes,
  [ExplorerExperienceAndHardiness.id]: ExplorerExperienceAndHardiness,
  [ExplorerExplorationBonuses.id]: ExplorerExplorationBonuses,
  [FighterBattlefieldProwess.id]: FighterBattlefieldProwess,
  [PaladinAuraOfProtection.id]: PaladinAuraOfProtection,
  [SharedAnimalReflexes.id]: SharedAnimalReflexes,
  [SharedCreateMagicalConstructs.id]: SharedCreateMagicalConstructs,
  [SharedCreateMagicalCrossbreeds.id]: SharedCreateMagicalCrossbreeds,
  [SharedCreateUndead.id]: SharedCreateUndead,
  [SharedDifficultToSpot.id]: SharedDifficultToSpot,
  [SharedHalfMinorMagicCreation.id]: SharedHalfMinorMagicCreation,
  [SharedMajorMagicCreation.id]: SharedMajorMagicCreation,
  [SharedMeleeDamageBonus.id]: SharedMeleeDamageBonus,
  [SharedMinorMagicCreation.id]: SharedMinorMagicCreation,
  [SharedNaturallyStealthy.id]: SharedNaturallyStealthy,
  [SharedRangedAccuracyBonus.id]: SharedRangedAccuracyBonus,
  [SharedRangedDamageBonus.id]: SharedRangedDamageBonus,
  [SharedRitualMagic.id]: SharedRitualMagic,
  [ZaharanAfterTheFlesh.id]: ZaharanAfterTheFlesh,
};
