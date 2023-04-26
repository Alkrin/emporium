import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { StorageData } from "../serverAPI";

interface StorageReduxState {
  allStorages: Dictionary<StorageData>;
}

function buildDefaultStorageReduxState(): StorageReduxState {
  const defaults: StorageReduxState = {
    allStorages: {},
  };
  return defaults;
}

export const storagesSlice = createSlice({
  name: "storage",
  initialState: buildDefaultStorageReduxState(),
  reducers: {
    updateStorages: (state: StorageReduxState, action: PayloadAction<StorageData[]>) => {
      // Start empty.
      const p: Dictionary<StorageData> = {};
      action.payload.forEach((storage) => {
        p[storage.id] = storage;
      });
      // Then replace the whole data set in Redux.
      state.allStorages = p;
    },
  },
});

export const { updateStorages } = storagesSlice.actions;
