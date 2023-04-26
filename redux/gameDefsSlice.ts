import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ItemDefData } from "../serverAPI";

interface GameDefsReduxState {
  items: Dictionary<ItemDefData>;
}

function buildDefaultGameDefsReduxState(): GameDefsReduxState {
  const defaults: GameDefsReduxState = {
    items: {},
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
  },
});

export const { updateItemDefs, updateItemDef, deleteItemDef } = gameDefsSlice.actions;
