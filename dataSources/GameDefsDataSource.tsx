import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import {
  updateAbilityDefs,
  updateCharacterClasses,
  updateEquipmentSetItems,
  updateEquipmentSets,
  updateHarvestingCategories,
  updateItemDefs,
  updateJobCredentials,
  updateJobs,
  updateProficiencyRolls,
  updateResearchCategories,
  updateResearchSubcategories,
  updateSpellDefs,
  updateStructureComponentDefs,
  updateTroopDefs,
} from "../redux/gameDefsSlice";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { BasicDialog } from "../components/dialogs/BasicDialog";
import { ServerAPIJobCredentials } from "../pages/api/tables/job_credentials/functions";
import { ServerAPIJob } from "../pages/api/tables/jobs/functions";

export async function refetchAbilityDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchAbilityDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "AbilityDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch AbilityDef data"} />,
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
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateEquipmentSetItems(result));
  }
}

export async function refetchHarvestingCategories(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchHarvestingCategories();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "HarvestingCategories Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch HarvestingCategories data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateHarvestingCategories(result));
  }
}

export async function refetchItemDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchItemDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ItemDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ItemDef data"} />,
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

export async function refetchJobCredentials(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPIJobCredentials.fetch();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "JobCredential Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch JobCredential data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe entries that no longer exist.
    dispatch(updateJobCredentials(result));
  }
}

export async function refetchJobs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPIJob.fetch();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Job Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Job data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe entries that no longer exist.
    dispatch(updateJobs(result));
  }
}

export async function refetchProficiencyRolls(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchProficiencyRolls();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ProficiencyRolls Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ProficiencyRolls data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateProficiencyRolls(result));
  }
}

export async function refetchResearchCategories(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchResearchCategories();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ResearchCategories Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ResearchCategories data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateResearchCategories(result));
  }
}

export async function refetchResearchSubcategories(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchResearchSubcategories();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ResearchSubcategories Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ResearchSubcategories data"} />,
      })
    );
  } else {
    // Send the whole batch at once so we can axe defs that no longer exist.
    dispatch(updateResearchSubcategories(result));
  }
}

export async function refetchSpellDefs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchSpellDefs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "SpellDef Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch SpellDef data"} />,
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
      await Promise.all([
        refetchAbilityDefs(this.dispatch),
        refetchCharacterClasses(this.dispatch),
        refetchEquipmentSets(this.dispatch),
        refetchEquipmentSetItems(this.dispatch),
        refetchHarvestingCategories(this.dispatch),
        refetchItemDefs(this.dispatch),
        refetchJobCredentials(this.dispatch),
        refetchJobs(this.dispatch),
        refetchProficiencyRolls(this.dispatch),
        refetchResearchCategories(this.dispatch),
        refetchResearchSubcategories(this.dispatch),
        refetchSpellDefs(this.dispatch),
        refetchStructureComponentDefs(this.dispatch),
        refetchTroopDefs(this.dispatch),
      ]);
    }
  }
}
