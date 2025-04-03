import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentDomainMoraleBonusStatic: AbilityComponent = {
  id: "DomainMoraleBonusStatic",
  name: "Domain Morale Bonus, Static",
  description: "Grants a fixed bonus to the base morale of any domain ruled by the character.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Morale Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentDomainMoraleBonusStaticData {
  /** The flat bonus granted to the character's domain's base morale. */
  bonus: number;
}
