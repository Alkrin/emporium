import { DatabaseEditingDialogFieldDef } from "../../components/database/databaseEditingDialog/databaseUtils";
import { Dictionary } from "../../lib/dictionary";
import { AbilityComponentArmorStatic } from "./AbilityComponentArmorStatic";
import { AbilityComponentMeleeDamageByLevel } from "./AbilityComponentMeleeDamageByLevel";
import { AbilityComponentProficiencyRoll } from "./AbilityComponentProficiencyRoll";
import { AbilityComponentRangedDamageByLevel } from "./AbilityComponentRangedDamageByLevel";

export interface AbilityComponent {
  id: string;
  name: string;
  description: string;
  fields: DatabaseEditingDialogFieldDef[];
}

export const AllAbilityComponents: Dictionary<AbilityComponent> = {
  [AbilityComponentArmorStatic.id]: AbilityComponentArmorStatic,
  [AbilityComponentMeleeDamageByLevel.id]: AbilityComponentMeleeDamageByLevel,
  [AbilityComponentProficiencyRoll.id]: AbilityComponentProficiencyRoll,
  [AbilityComponentRangedDamageByLevel.id]: AbilityComponentRangedDamageByLevel,
};

export const AllAbilityComponentsArray = Object.values(AllAbilityComponents).sort((a, b) => {
  return a.name.localeCompare(b.name);
});
