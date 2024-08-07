import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import {
  updateEquipmentSetItems,
  updateEquipmentSets,
  updateItemDefs,
  updateSpellDefs,
  updateStructureComponentDefs,
  updateTroopDefs,
} from "../redux/gameDefsSlice";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";

export async function refetchItemDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchItemDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ItemDef Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch ItemDef data",
        },
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

export async function refetchSpellDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchSpellDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "SpellDef Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch SpellDef data",
        },
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateSpellDefs(result));
  }
}

export async function refetchEquipmentSets(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchEquipmentSets();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "EquipmentSets Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch EquipmentSets data",
        },
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
        content: {
          title: "Error!",
          message: "Failed to fetch EquipmentSetItems data",
        },
        escapable: true,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateEquipmentSetItems(result));
  }
}

export async function refetchStructureComponentDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchStructureComponentDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "StructureComponentDef Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch StructureComponentDef data",
        },
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
        content: {
          title: "Error!",
          message: "Failed to fetch TroopDef data",
        },
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
      await refetchEquipmentSets(this.dispatch);
      await refetchEquipmentSetItems(this.dispatch);
      await refetchItemDefs(this.dispatch);
      await refetchSpellDefs(this.dispatch);
      await refetchStructureComponentDefs(this.dispatch);
      await refetchTroopDefs(this.dispatch);
    }
  }
}
