import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import {
  AbilityDefData,
  CharacterClassv2,
  ContractData,
  EquipmentSetData,
  EquipmentSetItemData,
  HarvestingCategoryData,
  ItemDefData,
  ProficiencyRollData,
  ResearchCategoryData,
  ResearchSubcategoryData,
  SpellDefData,
  StructureComponentDefData,
  TroopDefData,
} from "../serverAPI";
import { JobCredentialData } from "../pages/api/tables/job_credentials/types";
import { JobData } from "../pages/api/tables/jobs/types";

export interface ContractDefData {
  id: number;
  name: string;
  description: string; // May include tags for {PartyA}, {PartyB}, {TargetA}, {TargetB}, and {Value}.
  terms: Dictionary<ContractTermType>;
}

export interface UpdateItemsForEquipmentSetParams {
  set_id: number;
  items: EquipmentSetItemData[];
}

export interface GameDefsReduxState {
  abilities: Record<number, AbilityDefData>;
  characterClasses: Record<number, CharacterClassv2>;
  contracts: Record<number, ContractDefData>;
  equipmentSets: Record<number, EquipmentSetData>;
  equipmentSetsByClass: Record<string, EquipmentSetData[]>;
  equipmentSetItemsBySet: Record<number, EquipmentSetItemData[]>;
  harvestingCategories: Record<number, HarvestingCategoryData>;
  items: Record<number, ItemDefData>;
  jobCredentials: Record<number, JobCredentialData>;
  jobs: Record<number, JobData>;
  proficiencyRolls: Record<number, ProficiencyRollData>;
  researchCategories: Record<number, ResearchCategoryData>;
  researchSubcategories: Record<number, ResearchSubcategoryData>;
  spells: Record<number, SpellDefData>;
  structureComponents: Record<number, StructureComponentDefData>;
  troops: Record<number, TroopDefData>;
}

function buildDefaultGameDefsReduxState(): GameDefsReduxState {
  const defaults: GameDefsReduxState = {
    abilities: {},
    characterClasses: {},
    contracts: buildContractDefs(),
    equipmentSets: {},
    equipmentSetsByClass: {},
    equipmentSetItemsBySet: {},
    harvestingCategories: {},
    items: {},
    jobCredentials: {},
    jobs: {},
    proficiencyRolls: {},
    researchCategories: {},
    researchSubcategories: {},
    spells: {},
    structureComponents: {},
    troops: {},
  };
  return defaults;
}

// NEVER CHANGE THE VALUE OF A CONTRACT ID, or the whole system will break.
export enum ContractId {
  Invalid = 0,
  ArmyWageContract = 1,
  CharacterWageContract = 2,
  StructureMaintenanceContract = 3,
  ActivityLootContract = 4,
  PartiedLootContract = 5,
  UnpartiedLootContract = 6,
}
export enum ContractTerm {
  PartyA = "PartyA",
  PartyB = "PartyB",
  TargetA = "TargetA",
  TargetB = "TargetB",
  Value = "Value",
}
export enum ContractTermType {
  Army = "Army",
  Character = "Character",
  Number = "Number",
  Storage = "Storage",
  Structure = "Structure",
}

export function getContractTermKey(term: ContractTerm): keyof ContractData {
  const keys: Dictionary<keyof ContractData> = {
    [ContractTerm.PartyA]: "party_a_id",
    [ContractTerm.PartyB]: "party_b_id",
    [ContractTerm.TargetA]: "target_a_id",
    [ContractTerm.TargetB]: "target_b_id",
    [ContractTerm.Value]: "value",
  };

  return keys[term];
}

function buildContractDefs(): Dictionary<ContractDefData> {
  const defs: Dictionary<ContractDefData> = {
    [ContractId.ArmyWageContract]: {
      id: ContractId.ArmyWageContract,
      name: "Army Wage Contract",
      description: "The character {PartyA} will pay the wages of army {PartyB} once per month from storage {TargetA}.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Army,
        [ContractTerm.TargetA]: ContractTermType.Storage,
      },
    },
    [ContractId.CharacterWageContract]: {
      id: ContractId.CharacterWageContract,
      name: "Character Wage Contract",
      description:
        "The character {PartyA} will pay the wages of character {PartyB} once per month from storage {TargetA} " +
        "into storage {TargetB}.  The amount is equal to the Cost Of Living for {PartyB}'s current level at the time of payment.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Character,
        [ContractTerm.TargetA]: ContractTermType.Storage,
        [ContractTerm.TargetB]: ContractTermType.Storage,
      },
    },
    [ContractId.StructureMaintenanceContract]: {
      id: ContractId.StructureMaintenanceContract,
      name: "Structure Maintenance Contract",
      description:
        "The character {PartyA} will pay the maintenance for structure {PartyB} once per month from storage {TargetA}.  " +
        "The amount is equal to the full maintenance cost for {PartyB} at the time of payment.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Structure,
        [ContractTerm.TargetA]: ContractTermType.Storage,
      },
    },
    [ContractId.ActivityLootContract]: {
      id: ContractId.ActivityLootContract,
      name: "Activity Loot Contract",
      description:
        "When character {PartyA} participates in an Activity, {PartyA} will pay {Value}% of their share to {PartyB}, into storage {TargetA}.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Character,
        [ContractTerm.Value]: ContractTermType.Number,
        [ContractTerm.TargetA]: ContractTermType.Storage,
      },
    },
    [ContractId.PartiedLootContract]: {
      id: ContractId.PartiedLootContract,
      name: "Partied Loot Contract",
      description:
        "When character {PartyA} and character {PartyB} both participate in the same Activity, {PartyB} will not receive a direct share of loot.  " +
        "Instead, {PartyA} will pay {PartyB} {Value}% from {PartyA}'s share.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Character,
        [ContractTerm.Value]: ContractTermType.Number,
      },
    },
    [ContractId.UnpartiedLootContract]: {
      id: ContractId.UnpartiedLootContract,
      name: "Unpartied Loot Contract",
      description:
        "When character {PartyA} does not participate and character {PartyB} does participate in an Activity, {PartyB} will pay {Value}% from " +
        "{PartyB}'s share into storage {TargetA}.",
      terms: {
        [ContractTerm.PartyA]: ContractTermType.Character,
        [ContractTerm.PartyB]: ContractTermType.Character,
        [ContractTerm.Value]: ContractTermType.Number,
        [ContractTerm.TargetA]: ContractTermType.Storage,
      },
    },
  };
  return defs;
}

export const gameDefsSlice = createSlice({
  name: "gameDefs",
  initialState: buildDefaultGameDefsReduxState(),
  reducers: {
    updateCharacterClasses: (state: GameDefsReduxState, action: PayloadAction<CharacterClassv2[]>) => {
      state.characterClasses = {};
      action.payload.forEach((cc) => {
        state.characterClasses[cc.id] = cc;
      });
    },
    updateCharacterClass: (state: GameDefsReduxState, action: PayloadAction<CharacterClassv2>) => {
      state.characterClasses[action.payload.id] = action.payload;
    },
    deleteCharacterClass: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.characterClasses[action.payload];
    },
    updateItemDefs: (state: GameDefsReduxState, action: PayloadAction<ItemDefData[]>) => {
      state.items = {};
      action.payload.forEach((idd) => {
        state.items[idd.id] = idd;
      });
    },
    updateItemDef: (state: GameDefsReduxState, action: PayloadAction<ItemDefData>) => {
      state.items[action.payload.id] = action.payload;
    },
    deleteItemDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.items[action.payload];
    },
    updateJobCredentials: (state: GameDefsReduxState, action: PayloadAction<JobCredentialData[]>) => {
      state.jobCredentials = {};
      action.payload.forEach((jcd) => {
        state.jobCredentials[jcd.id] = jcd;
      });
    },
    updateJobCredential: (state: GameDefsReduxState, action: PayloadAction<JobCredentialData>) => {
      state.jobCredentials[action.payload.id] = action.payload;
    },
    deleteJobCredential: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.jobCredentials[action.payload];
    },
    updateJobs: (state: GameDefsReduxState, action: PayloadAction<JobData[]>) => {
      state.jobs = {};
      action.payload.forEach((jd) => {
        state.jobs[jd.id] = jd;
      });
    },
    updateJob: (state: GameDefsReduxState, action: PayloadAction<JobData>) => {
      state.jobs[action.payload.id] = action.payload;
    },
    deleteJob: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.jobs[action.payload];
    },
    updateSpellDefs: (state: GameDefsReduxState, action: PayloadAction<SpellDefData[]>) => {
      state.spells = {};
      action.payload.forEach((sdd) => {
        state.spells[sdd.id] = sdd;
      });
    },
    updateSpellDef: (state: GameDefsReduxState, action: PayloadAction<SpellDefData>) => {
      state.spells[action.payload.id] = action.payload;
    },
    deleteSpellDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.spells[action.payload];
    },
    updateAbilityDefs: (state: GameDefsReduxState, action: PayloadAction<AbilityDefData[]>) => {
      state.spells = {};
      action.payload.forEach((add) => {
        state.abilities[add.id] = add;
      });
    },
    updateAbilityDef: (state: GameDefsReduxState, action: PayloadAction<AbilityDefData>) => {
      state.abilities[action.payload.id] = action.payload;
    },
    deleteAbilityDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.abilities[action.payload];
    },
    updateHarvestingCategories: (state: GameDefsReduxState, action: PayloadAction<HarvestingCategoryData[]>) => {
      state.harvestingCategories = {};
      action.payload.forEach((hcd) => {
        state.harvestingCategories[hcd.id] = hcd;
      });
    },
    updateHarvestingCategory: (state: GameDefsReduxState, action: PayloadAction<HarvestingCategoryData>) => {
      state.harvestingCategories[action.payload.id] = action.payload;
    },
    deleteHarvestingCategory: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.harvestingCategories[action.payload];
    },
    updateProficiencyRolls: (state: GameDefsReduxState, action: PayloadAction<ProficiencyRollData[]>) => {
      state.proficiencyRolls = {};
      action.payload.forEach((prd) => {
        state.proficiencyRolls[prd.id] = prd;
      });
    },
    updateProficiencyRoll: (state: GameDefsReduxState, action: PayloadAction<ProficiencyRollData>) => {
      state.proficiencyRolls[action.payload.id] = action.payload;
    },
    deleteProficiencyRoll: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.proficiencyRolls[action.payload];
    },
    updateResearchCategories: (state: GameDefsReduxState, action: PayloadAction<ResearchCategoryData[]>) => {
      state.researchCategories = {};
      action.payload.forEach((rcd) => {
        state.researchCategories[rcd.id] = rcd;
      });
    },
    updateResearchCategory: (state: GameDefsReduxState, action: PayloadAction<ResearchCategoryData>) => {
      state.researchCategories[action.payload.id] = action.payload;
    },
    deleteResearchCategory: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.researchCategories[action.payload];
    },
    updateResearchSubcategories: (state: GameDefsReduxState, action: PayloadAction<ResearchSubcategoryData[]>) => {
      state.researchSubcategories = {};
      action.payload.forEach((rscd) => {
        state.researchSubcategories[rscd.id] = rscd;
      });
    },
    updateResearchSubcategory: (state: GameDefsReduxState, action: PayloadAction<ResearchSubcategoryData>) => {
      state.researchSubcategories[action.payload.id] = action.payload;
    },
    deleteResearchSubcategory: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.researchSubcategories[action.payload];
    },
    updateEquipmentSets: (state: GameDefsReduxState, action: PayloadAction<EquipmentSetData[]>) => {
      // Start empty.
      const p: Dictionary<EquipmentSetData[]> = {};
      const q: Dictionary<EquipmentSetData> = {};
      action.payload.forEach((equipmentSet) => {
        q[equipmentSet.id] = equipmentSet;
        if (!p[equipmentSet.class_name]) {
          p[equipmentSet.class_name] = [];
        }
        p[equipmentSet.class_name].push(equipmentSet);
      });
      // Sort equipment sets by name.
      Object.values(p).forEach((classSets) => {
        classSets.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      });
      // Then replace the whole data set in Redux.
      state.equipmentSets = q;
      state.equipmentSetsByClass = p;
    },
    updateEquipmentSetItems: (state: GameDefsReduxState, action: PayloadAction<EquipmentSetItemData[]>) => {
      // Start empty.
      const p: Dictionary<EquipmentSetItemData[]> = {};
      action.payload.forEach((item) => {
        if (!p[item.set_id]) {
          p[item.set_id] = [];
        }
        p[item.set_id].push(item);
      });
      // Then replace the whole data set in Redux.
      state.equipmentSetItemsBySet = p;
    },
    updateEquipmentSet: (state: GameDefsReduxState, action: PayloadAction<EquipmentSetData>) => {
      // Record the equipment set.
      state.equipmentSets[action.payload.id] = { ...action.payload };
      // Remove the set from any previous location in equipmentSetsByClass (in case class changed).
      Object.entries(state.equipmentSetsByClass).forEach(([class_name, equipmentSets]) => {
        state.equipmentSetsByClass[class_name] = equipmentSets.filter((setData) => {
          return setData.id !== action.payload.id;
        });
      });
      // Push the set into its appropriate class location.
      if (!state.equipmentSetsByClass[action.payload.class_name]) {
        state.equipmentSetsByClass[action.payload.class_name] = [];
      }
      state.equipmentSetsByClass[action.payload.class_name].push(action.payload);
    },
    updateItemsForEquipmentSet: (
      state: GameDefsReduxState,
      action: PayloadAction<UpdateItemsForEquipmentSetParams>
    ) => {
      const { set_id, items } = action.payload;
      // If there was a previous list of items, this overrides them.
      state.equipmentSetItemsBySet[set_id] = [...items];
    },
    deleteEquipmentSet: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      const setId = action.payload;
      delete state.equipmentSets[setId];
      delete state.equipmentSetItemsBySet[setId];
      Object.entries(state.equipmentSetsByClass).forEach(([class_name, equipmentSets]) => {
        state.equipmentSetsByClass[class_name] = equipmentSets.filter((setData) => {
          return setData.id !== setId;
        });
      });
    },
    updateStructureComponentDefs: (state: GameDefsReduxState, action: PayloadAction<StructureComponentDefData[]>) => {
      state.structureComponents = {};
      action.payload.forEach((scdd) => {
        state.structureComponents[scdd.id] = scdd;
      });
    },
    updateStructureComponentDef: (state: GameDefsReduxState, action: PayloadAction<StructureComponentDefData>) => {
      state.structureComponents[action.payload.id] = action.payload;
    },
    deleteStructureComponentDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.structureComponents[action.payload];
    },
    updateTroopDefs: (state: GameDefsReduxState, action: PayloadAction<TroopDefData[]>) => {
      state.troops = {};
      action.payload.forEach((tdd) => {
        state.troops[tdd.id] = tdd;
      });
    },
    updateTroopDef: (state: GameDefsReduxState, action: PayloadAction<TroopDefData>) => {
      state.troops[action.payload.id] = action.payload;
    },
    deleteTroopDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      delete state.troops[action.payload];
    },
  },
});

export const {
  updateAbilityDefs,
  updateAbilityDef,
  deleteAbilityDef,
  updateCharacterClasses,
  updateCharacterClass,
  deleteCharacterClass,
  updateEquipmentSets,
  updateEquipmentSetItems,
  updateEquipmentSet,
  updateItemsForEquipmentSet,
  deleteEquipmentSet,
  updateHarvestingCategories,
  updateHarvestingCategory,
  deleteHarvestingCategory,
  updateItemDefs,
  updateItemDef,
  deleteItemDef,
  updateJobCredentials,
  updateJobCredential,
  deleteJobCredential,
  updateJobs,
  updateJob,
  deleteJob,
  updateProficiencyRolls,
  updateProficiencyRoll,
  deleteProficiencyRoll,
  updateResearchCategories,
  updateResearchCategory,
  deleteResearchCategory,
  updateResearchSubcategories,
  updateResearchSubcategory,
  deleteResearchSubcategory,
  updateSpellDefs,
  updateSpellDef,
  deleteSpellDef,
  updateStructureComponentDefs,
  updateStructureComponentDef,
  deleteStructureComponentDef,
  updateTroopDefs,
  updateTroopDef,
  deleteTroopDef,
} = gameDefsSlice.actions;
