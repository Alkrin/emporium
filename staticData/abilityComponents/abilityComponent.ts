import { DatabaseEditingDialogFieldDef } from "../../components/database/databaseEditingDialog/databaseUtils";
import { Dictionary } from "../../lib/dictionary";
import { AbilityComponentArmorStatic } from "./AbilityComponentArmorStatic";
import { AbilityComponentMeleeDamageByLevel } from "./AbilityComponentMeleeDamageByLevel";
import { AbilityComponentProficiencyRoll } from "./AbilityComponentProficiencyRoll";
import { AbilityComponentRangedDamageByLevel } from "./AbilityComponentRangedDamageByLevel";
import { AbilityComponentResearchCapability } from "./AbilityComponentResearchCapability";
import { AbilityComponentResearchBonusesOrEffectiveLevel } from "./AbilityComponentResearchBonusesOrEffectiveLevel";
import { AbilityComponentHarvestingCapability } from "./AbilityComponentHarvestingCapability";
import { AbilityComponentAvailableJob } from "./AbilityComponentAvailableJob";
import { AbilityComponentReactionRollBonusConditional } from "./AbilityComponentReactionRollBonusConditional";
import { AbilityComponentReactionRollBonusStatic } from "./AbilityComponentReactionRollBonusStatic";
import { AbilityComponentInitiativeBonusConditional } from "./AbilityComponentInitiativeBonusConditional";
import { AbilityComponentInitiativeBonusStatic } from "./AbilityComponentInitiativeBonusStatic";
import { AbilityComponentCharacterStatBonus } from "./AbilityComponentCharacterStatBonus";
import { AbilityComponentCharacterStatOverride } from "./AbilityComponentCharacterStatOverride";

export interface AbilityComponent {
  id: string;
  name: string;
  description: string;
  fields: DatabaseEditingDialogFieldDef[];
}

export const AllAbilityComponents: Dictionary<AbilityComponent> = {
  [AbilityComponentArmorStatic.id]: AbilityComponentArmorStatic,
  [AbilityComponentAvailableJob.id]: AbilityComponentAvailableJob,
  [AbilityComponentCharacterStatBonus.id]: AbilityComponentCharacterStatBonus,
  [AbilityComponentCharacterStatOverride.id]: AbilityComponentCharacterStatOverride,
  [AbilityComponentHarvestingCapability.id]: AbilityComponentHarvestingCapability,
  [AbilityComponentInitiativeBonusConditional.id]: AbilityComponentInitiativeBonusConditional,
  [AbilityComponentInitiativeBonusStatic.id]: AbilityComponentInitiativeBonusStatic,
  [AbilityComponentMeleeDamageByLevel.id]: AbilityComponentMeleeDamageByLevel,
  [AbilityComponentProficiencyRoll.id]: AbilityComponentProficiencyRoll,
  [AbilityComponentRangedDamageByLevel.id]: AbilityComponentRangedDamageByLevel,
  [AbilityComponentReactionRollBonusConditional.id]: AbilityComponentReactionRollBonusConditional,
  [AbilityComponentReactionRollBonusStatic.id]: AbilityComponentReactionRollBonusStatic,
  [AbilityComponentResearchBonusesOrEffectiveLevel.id]: AbilityComponentResearchBonusesOrEffectiveLevel,
  [AbilityComponentResearchCapability.id]: AbilityComponentResearchCapability,
};

export const AllAbilityComponentsArray = Object.values(AllAbilityComponents).sort((a, b) => {
  return a.name.localeCompare(b.name);
});
