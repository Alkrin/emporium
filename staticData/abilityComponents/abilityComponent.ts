import { DatabaseEditingDialogFieldDef } from "../../components/database/databaseEditingDialog/databaseUtils";
import { Dictionary } from "../../lib/dictionary";
import { AbilityComponentArmorStatic } from "./AbilityComponentArmorStatic";
import { AbilityComponentMeleeDamageByLevel } from "./AbilityComponentMeleeDamageByLevel";
import { AbilityComponentProficiencyRoll } from "./AbilityComponentProficiencyRoll";
import { AbilityComponentRangedDamageByLevel } from "./AbilityComponentRangedDamageByLevel";
import { AbilityComponentResearchCapability } from "./AbilityComponentResearchCapability";
import { AbilityComponentResearchBonusesOrEffectiveLevel } from "./AbilityComponentResearchBonusesOrEffectiveLevel";
import { AbilityComponentHarvestingCapability } from "./AbilityComponentHarvestingCapability";

export interface AbilityComponent {
  id: string;
  name: string;
  description: string;
  fields: DatabaseEditingDialogFieldDef[];
}

export const AllAbilityComponents: Dictionary<AbilityComponent> = {
  [AbilityComponentArmorStatic.id]: AbilityComponentArmorStatic,
  [AbilityComponentHarvestingCapability.id]: AbilityComponentHarvestingCapability,
  [AbilityComponentMeleeDamageByLevel.id]: AbilityComponentMeleeDamageByLevel,
  [AbilityComponentProficiencyRoll.id]: AbilityComponentProficiencyRoll,
  [AbilityComponentRangedDamageByLevel.id]: AbilityComponentRangedDamageByLevel,
  [AbilityComponentResearchCapability.id]: AbilityComponentResearchCapability,
  [AbilityComponentResearchBonusesOrEffectiveLevel.id]: AbilityComponentResearchBonusesOrEffectiveLevel,
};

export const AllAbilityComponentsArray = Object.values(AllAbilityComponents).sort((a, b) => {
  return a.name.localeCompare(b.name);
});
