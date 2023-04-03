import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { ItemDefData } from "../serverAPI";

interface GameDefsReduxState {
  items: ItemDefData[];
}

function buildDefaultGameDefsReduxState(): GameDefsReduxState {
  const defaults: GameDefsReduxState = {
    items: [],
  };
  return defaults;
}

export const gameDefsSlice = createSlice({
  name: "gameDefs",
  initialState: buildDefaultGameDefsReduxState(),
  reducers: {
    updateItemDefs: (state: GameDefsReduxState, action: PayloadAction<ItemDefData[]>) => {
      state.items = action.payload;
    },
    updateItemDef: (state: GameDefsReduxState, action: PayloadAction<ItemDefData>) => {
      const index = state.items.findIndex((idd) => {
        return idd.id === action.payload.id;
      });
      if (index !== -1) {
        // Already existed, so update it.
        state.items[index] = action.payload;
      } else {
        // New def, so add it.
        state.items.push(action.payload);
      }
    },
    deleteItemDef: (state: GameDefsReduxState, action: PayloadAction<number>) => {
      state.items = state.items.filter((idd) => {
        return idd.id !== action.payload;
      });
    },
  },
});

export const { updateItemDefs, updateItemDef, deleteItemDef } = gameDefsSlice.actions;
