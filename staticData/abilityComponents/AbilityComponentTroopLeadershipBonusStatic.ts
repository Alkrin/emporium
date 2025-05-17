import { DatabaseEditingDialogField } from "../../components/database/databaseEditingDialog/databaseUtils";
import { AbilityComponent } from "./abilityComponent";

export const AbilityComponentTroopLeadershipBonusStatic: AbilityComponent = {
  id: "TroopLeadershipBonusStatic",
  name: "Troop Leadership Bonus, Static",
  description: "Grants a fixed bonus to Leadership Ability when commanding troops in battle.",
  fields: [
    {
      type: DatabaseEditingDialogField.Number,
      labelTexts: ["Leadership Ability Bonus"],
      fieldNames: ["bonus"],
    },
  ],
};

export interface AbilityComponentTroopLeadershipBonusStaticData {
  /** The flat bonus granted to the character's Leadership Ability. */
  bonus: number;
}
