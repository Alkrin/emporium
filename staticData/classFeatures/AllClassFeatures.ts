import { Dictionary } from "../../lib/dictionary";
import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";
import { AntiPaladinAuraOfProtection } from "./AntiPaladinAuraOfProtection";
import { AntiPaladinDetectGood } from "./AntiPaladinDetectGood";
import { AntiPaladinUnholyFanaticism } from "./AntiPaladinUnholyFanaticism";
import { BarbarianAnimalMagnetism } from "./BarbarianAnimalMagnetism";
import { SharedSavageResilience } from "./SharedSavageResilience";
import { BardArcaneScrollUse } from "./BardArcaneScrollUse";
import { BardChroniclesOfBattle } from "./BardChroniclesOfBattle";
import { SharedInspireCourage } from "./SharedInspireCourage";
import { BardReadLanguages } from "./BardReadLanguages";
import { BladeDancerMobility } from "./BladeDancerDefensiveMobility";
import { DwarfExpertCaver } from "./DwarfExpertCaver";
import { DwarfStoneSense } from "./DwarfStoneSense";
import { DwarfAttentionToDetail } from "./DwarfAttentionToDetail";
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
import { SharedMajorMagicCreation } from "./SharedMajorMagicCreation";
import { SharedMeleeDamageBonus } from "./SharedMeleeDamageBonus";
import { SharedMinorMagicCreation } from "./SharedMinorMagicCreation";
import { SharedNaturallyStealthy } from "./SharedNaturallyStealthy";
import { SharedRangedAccuracyBonus } from "./SharedRangedAccuracyBonus";
import { SharedRangedDamageBonus } from "./SharedRangedDamageBonus";
import { SharedRitualMagic } from "./SharedRitualMagic";
import { ZaharanAfterTheFlesh } from "./ZaharanAfterTheFlesh";
import { DwarvenFuryFightingFury } from "./DwarvenFuryFightingFury";
import { DwarvenFuryFleshRunes } from "./DwarvenFuryFleshRunes";
import { DwarvenMachinistPersonalAutomaton } from "./DwarvenMachinistPersonalAutomaton";
import { SharedMeleeAccuracyBonus } from "./SharedMeleeAccuracyBonus";
import { ElvenCourtierEnchantingPerformance } from "./ElvenCourtierEnchantingPerformance";
import { SharedFriendOfBirdsAndBeasts } from "./SharedFriendOfBirdsAndBeasts";
import { MysticGracefulFightingStyle } from "./MysticGracefulFightingStyle";
import { MysticMindful } from "./MysticMindful";
import { MysticMeditativeFocus } from "./MysticMeditativeFocus";
import { MysticStrengthOfSpirit } from "./MysticStrengthOfSpirit";
import { MysticSpeedOfThought } from "./MysticSpeedOfThought";
import { MysticProbabilityTrance } from "./MysticProbabilityTrance";
import { MysticPurityOfBodyAndSoul } from "./MysticPurityOfBodyAndSoul";
import { MysticCommandOfVoice } from "./MysticCommandOfVoice";
import { MysticWholenessOfBody } from "./MysticWholenessOfBody";
import { MysticPerceiveIntentions } from "./MysticPerceiveIntentions";
import { MysticPerfectionOfBody } from "./MysticPerfectionOfBody";
import { SharedAgeless } from "./SharedAgeless";
import { NobiranWonderworkerBloodOfAncientKings } from "./NobiranWonderworkerBloodOfAncientKings";
import { PaladinHolyFervor } from "./PaladinHolyFervor";
import { VenturerMercantileNetwork } from "./VenturerMercantileNetwork";
import { VenturerReadLanguages } from "./VenturerReadLanguages";
import { VenturerAvoidGettingLost } from "./VenturerAvoidGettingLost";
import { VenturerMinorMagicCreation } from "./VenturerMinorMagicCreation";
import { WildHarvesterNaturalTactics } from "./WildHarvesterNaturalTactics";
import { WildHarvesterWorldConnection } from "./WildHarvesterWorldConnection";
import { WildHarvesterConnectionToNature } from "./WildHarvesterConnectionToNature";
import { WildHarvesterNaturallyStealthy } from "./WildHarvesterNaturallyStealthy";
import { WildHarvesterSeenItAll } from "./WildHarvesterSeenItAll";
import { WildHarvesterBoundToNature } from "./WildHarvesterBoundToNature";
import { BattlegoatGatecrasherRuneCarvedHorns } from "./BattlegoatGatecrasherRuneCarvedHorns";
import { BattlegoatGatecrasherSteelWool } from "./BattlegoatGatecrasherSteelWool";
import { BattlegoatGatecrasherMightyKidneys } from "./BattlegoatGatecrasherMightyKidneys";
import { BattlegoatGatecrasherInvincibleDigestion } from "./BattlegoatGatecrasherInvincibleDigestion";
import { BattlegoatGatecrasherDungeonScarred } from "./BattlegoatGatecrasherDungeonScarred";
import { BattlegoatGatecrasherRedEyed } from "./BattlegoatGatecrasherRedEyed";
import { SharedInhumanity } from "./SharedInhumanity";
import { SharedBrutality } from "./SharedBrutality";
import { SharedNaturalAttackPower } from "./SharedNaturalAttackPower";
import { SharedChitinousCarapace } from "./SharedChitinousCarapace";
import { TrueTurtleRunicScutes } from "./TrueTurtleRunicScutes";
import { SharedLoadbearing } from "./SharedLoadbearing";
import { SharedInvulnerable } from "./SharedInvulnerable";
import { SharedDiscomfitedByCivilization } from "./SharedDiscomfitedByCivilization";
import { TrueTurtleBoneBreakingBite } from "./TrueTurtleBoneBreakingBite";

export const AllClassFeatures: Dictionary<AbilityOrProficiency> = {
  [AntiPaladinAuraOfProtection.id]: AntiPaladinAuraOfProtection,
  [AntiPaladinDetectGood.id]: AntiPaladinDetectGood,
  [AntiPaladinUnholyFanaticism.id]: AntiPaladinUnholyFanaticism,
  [BarbarianAnimalMagnetism.id]: BarbarianAnimalMagnetism,
  [BardArcaneScrollUse.id]: BardArcaneScrollUse,
  [BardChroniclesOfBattle.id]: BardChroniclesOfBattle,
  [BardReadLanguages.id]: BardReadLanguages,
  [BattlegoatGatecrasherDungeonScarred.id]: BattlegoatGatecrasherDungeonScarred,
  [BattlegoatGatecrasherInvincibleDigestion.id]: BattlegoatGatecrasherInvincibleDigestion,
  [BattlegoatGatecrasherMightyKidneys.id]: BattlegoatGatecrasherMightyKidneys,
  [BattlegoatGatecrasherRedEyed.id]: BattlegoatGatecrasherRedEyed,
  [BattlegoatGatecrasherRuneCarvedHorns.id]: BattlegoatGatecrasherRuneCarvedHorns,
  [BattlegoatGatecrasherSteelWool.id]: BattlegoatGatecrasherSteelWool,
  [BladeDancerMobility.id]: BladeDancerMobility,
  [DwarfAttentionToDetail.id]: DwarfAttentionToDetail,
  [DwarfExpertCaver.id]: DwarfExpertCaver,
  [DwarfStoneSense.id]: DwarfStoneSense,
  [DwarvenCraftpriestReligiousTraining.id]: DwarvenCraftpriestReligiousTraining,
  [DwarvenFuryFightingFury.id]: DwarvenFuryFightingFury,
  [DwarvenFuryFleshRunes.id]: DwarvenFuryFleshRunes,
  [DwarvenMachinistPersonalAutomaton.id]: DwarvenMachinistPersonalAutomaton,
  [ElfAttunementToNature.id]: ElfAttunementToNature,
  [ElfConnectionToNature.id]: ElfConnectionToNature,
  [ElfKeenEyes.id]: ElfKeenEyes,
  [ElvenCourtierEnchantingPerformance.id]: ElvenCourtierEnchantingPerformance,
  [ExplorerExperienceAndHardiness.id]: ExplorerExperienceAndHardiness,
  [ExplorerExplorationBonuses.id]: ExplorerExplorationBonuses,
  [FighterBattlefieldProwess.id]: FighterBattlefieldProwess,
  [MysticCommandOfVoice.id]: MysticCommandOfVoice,
  [MysticGracefulFightingStyle.id]: MysticGracefulFightingStyle,
  [MysticMeditativeFocus.id]: MysticMeditativeFocus,
  [MysticMindful.id]: MysticMindful,
  [MysticPerceiveIntentions.id]: MysticPerceiveIntentions,
  [MysticPerfectionOfBody.id]: MysticPerfectionOfBody,
  [MysticProbabilityTrance.id]: MysticProbabilityTrance,
  [MysticPurityOfBodyAndSoul.id]: MysticPurityOfBodyAndSoul,
  [MysticSpeedOfThought.id]: MysticSpeedOfThought,
  [MysticStrengthOfSpirit.id]: MysticStrengthOfSpirit,
  [MysticWholenessOfBody.id]: MysticWholenessOfBody,
  [NobiranWonderworkerBloodOfAncientKings.id]: NobiranWonderworkerBloodOfAncientKings,
  [PaladinAuraOfProtection.id]: PaladinAuraOfProtection,
  [PaladinHolyFervor.id]: PaladinHolyFervor,
  [SharedAgeless.id]: SharedAgeless,
  [SharedAnimalReflexes.id]: SharedAnimalReflexes,
  [SharedBrutality.id]: SharedBrutality,
  [SharedChitinousCarapace.id]: SharedChitinousCarapace,
  [SharedCreateMagicalConstructs.id]: SharedCreateMagicalConstructs,
  [SharedCreateMagicalCrossbreeds.id]: SharedCreateMagicalCrossbreeds,
  [SharedCreateUndead.id]: SharedCreateUndead,
  [SharedDifficultToSpot.id]: SharedDifficultToSpot,
  [SharedDiscomfitedByCivilization.id]: SharedDiscomfitedByCivilization,
  [SharedFriendOfBirdsAndBeasts.id]: SharedFriendOfBirdsAndBeasts,
  [SharedInhumanity.id]: SharedInhumanity,
  [SharedInspireCourage.id]: SharedInspireCourage,
  [SharedInvulnerable.id]: SharedInvulnerable,
  [SharedLoadbearing.id]: SharedLoadbearing,
  [SharedMajorMagicCreation.id]: SharedMajorMagicCreation,
  [SharedMeleeAccuracyBonus.id]: SharedMeleeAccuracyBonus,
  [SharedMeleeDamageBonus.id]: SharedMeleeDamageBonus,
  [SharedMinorMagicCreation.id]: SharedMinorMagicCreation,
  [SharedNaturalAttackPower.id]: SharedNaturalAttackPower,
  [SharedNaturallyStealthy.id]: SharedNaturallyStealthy,
  [SharedRangedAccuracyBonus.id]: SharedRangedAccuracyBonus,
  [SharedRangedDamageBonus.id]: SharedRangedDamageBonus,
  [SharedRitualMagic.id]: SharedRitualMagic,
  [SharedSavageResilience.id]: SharedSavageResilience,
  [TrueTurtleBoneBreakingBite.id]: TrueTurtleBoneBreakingBite,
  [TrueTurtleRunicScutes.id]: TrueTurtleRunicScutes,
  [VenturerAvoidGettingLost.id]: VenturerAvoidGettingLost,
  [VenturerMercantileNetwork.id]: VenturerMercantileNetwork,
  [VenturerMinorMagicCreation.id]: VenturerMinorMagicCreation,
  [VenturerReadLanguages.id]: VenturerReadLanguages,
  [WildHarvesterBoundToNature.id]: WildHarvesterBoundToNature,
  [WildHarvesterConnectionToNature.id]: WildHarvesterConnectionToNature,
  [WildHarvesterNaturallyStealthy.id]: WildHarvesterNaturallyStealthy,
  [WildHarvesterNaturalTactics.id]: WildHarvesterNaturalTactics,
  [WildHarvesterSeenItAll.id]: WildHarvesterSeenItAll,
  [WildHarvesterWorldConnection.id]: WildHarvesterWorldConnection,
  [ZaharanAfterTheFlesh.id]: ZaharanAfterTheFlesh,
};
