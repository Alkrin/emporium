import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ItemData } from "../serverAPI";

interface ItemsReduxState {
  allItems: Dictionary<ItemData>;
}

function buildDefaultItemsReduxState(): ItemsReduxState {
  const defaults: ItemsReduxState = {
    allItems: {},
  };
  return defaults;
}

export const itemsSlice = createSlice({
  name: "items",
  initialState: buildDefaultItemsReduxState(),
  reducers: {
    updateItems: (state: ItemsReduxState, action: PayloadAction<ItemData[]>) => {
      // Start empty.
      const p: Dictionary<ItemData> = {};
      action.payload.forEach((item) => {
        p[item.id] = item;
      });
      // Then replace the whole data set in Redux.
      state.allItems = p;
    },
    updateItem: (state: ItemsReduxState, action: PayloadAction<ItemData>) => {
      state.allItems[action.payload.id] = action.payload;
    },
    deleteItem: (state: ItemsReduxState, action: PayloadAction<number>) => {
      delete state.allItems[action.payload];
    },
  },
});

export const { updateItems, updateItem, deleteItem } = itemsSlice.actions;
