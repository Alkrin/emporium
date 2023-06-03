import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ItemDefData, SpellDefData } from "../serverAPI";

interface GameDefsReduxState {
  items: Dictionary<ItemDefData>;
  spells: Dictionary<SpellDefData>;
}

function buildDefaultGameDefsReduxState(): GameDefsReduxState {
  const defaults: GameDefsReduxState = {
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
  },
});

export const { updateItemDefs, updateItemDef, deleteItemDef, updateSpellDefs, updateSpellDef, deleteSpellDef } =
  gameDefsSlice.actions;
