import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { EquipmentSetData, EquipmentSetItemData, ItemDefData, SpellDefData } from "../serverAPI";

export interface UpdateItemsForEquipmentSetParams {
  set_id: number;
  items: EquipmentSetItemData[];
}

interface GameDefsReduxState {
  equipmentSets: Dictionary<EquipmentSetData>;
  equipmentSetsByClass: Dictionary<EquipmentSetData[]>;
  equipmentSetItemsBySet: Dictionary<EquipmentSetItemData[]>;
  items: Dictionary<ItemDefData>;
  spells: Dictionary<SpellDefData>;
}

function buildDefaultGameDefsReduxState(): GameDefsReduxState {
  const defaults: GameDefsReduxState = {
    equipmentSets: {},
    equipmentSetsByClass: {},
    equipmentSetItemsBySet: {},
    items: {},
    spells: {},
  };
  return defaults;
}

export const gameDefsSlice = createSlice({
  name: "gameDefs",
  initialState: buildDefaultGameDefsReduxState(),
  reducers: {
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
  },
});

export const {
  updateItemDefs,
  updateItemDef,
  deleteItemDef,
  updateSpellDefs,
  updateSpellDef,
  deleteSpellDef,
  updateEquipmentSets,
  updateEquipmentSetItems,
  updateEquipmentSet,
  updateItemsForEquipmentSet,
  deleteEquipmentSet,
} = gameDefsSlice.actions;
