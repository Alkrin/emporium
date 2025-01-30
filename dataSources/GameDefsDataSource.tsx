import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import {
  updateAbilityDefs,
  updateCharacterClasses,
  updateEquipmentSetItems,
  updateEquipmentSets,
  updateItemDefs,
  updateProficiencyRolls,
  updateSpellDefs,
  updateStructureComponentDefs,
  updateTroopDefs,
} from "../redux/gameDefsSlice";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchAbilityDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchAbilityDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "AbilityDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch AbilityDef data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateAbilityDefs(result));
  }
}

export async function refetchCharacterClasses(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchCharacterClasses();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "CharacterClass Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch CharacterClass data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateCharacterClasses(result));
  }
}

export async function refetchEquipmentSets(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchEquipmentSets();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "EquipmentSets Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch EquipmentSets data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateEquipmentSets(result));
  }
}

export async function refetchEquipmentSetItems(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchEquipmentSetItems();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "EquipmentSetItems Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch EquipmentSetItems data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateEquipmentSetItems(result));
  }
}

export async function refetchItemDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchItemDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ItemDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ItemDef data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    result.forEach((idd) => {
      // Force "booleans" to be true booleans.
      idd.has_charges = !!idd.has_charges;
      idd.fixed_weight = !!idd.fixed_weight;
    });
    dispatch(updateItemDefs(result));
  }
}

export async function refetchProficiencyRolls(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchProficiencyRolls();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ProficiencyRolls Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ProficiencyRolls data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateProficiencyRolls(result));
  }
}

export async function refetchSpellDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchSpellDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "SpellDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch SpellDef data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateSpellDefs(result));
  }
}

export async function refetchStructureComponentDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchStructureComponentDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "StructureComponentDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch StructureComponentDef data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateStructureComponentDefs(result));
  }
}

export async function refetchTroopDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchTroopDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "TroopDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch TroopDef data"} />,
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateTroopDefs(result));
  }
}

export class GameDefsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchAbilityDefs(this.dispatch);
      await refetchCharacterClasses(this.dispatch);
      await refetchEquipmentSets(this.dispatch);
      await refetchEquipmentSetItems(this.dispatch);
      await refetchItemDefs(this.dispatch);
      await refetchProficiencyRolls(this.dispatch);
      await refetchSpellDefs(this.dispatch);
      await refetchStructureComponentDefs(this.dispatch);
      await refetchTroopDefs(this.dispatch);
    }
  }
}
