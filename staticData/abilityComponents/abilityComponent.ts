import { DatabaseEditingDialogFieldDef } from "../../components/database/databaseEditingDialog/databaseUtils";
import { Dictionary } from "../../lib/dictionary";
import { AbilityComponentArmorStatic } from "./AbilityComponentArmorStatic";

export interface AbilityComponent {
  id: string;
  name: string;
  description: string;
  fields: DatabaseEditingDialogFieldDef[];
}

export const AllAbilityComponents: Dictionary<AbilityComponent> = {
  [AbilityComponentArmorStatic.id]: AbilityComponentArmorStatic,
};

export const AllAbilityComponentsArray = Object.values(AllAbilityComponents).sort((a, b) => {
  return a.name.localeCompare(b.name);
});
