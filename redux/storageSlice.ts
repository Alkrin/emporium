import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { StorageData } from "../serverAPI";

interface StorageReduxState {
  allStorages: Dictionary<StorageData>;
  storagesByCharacterId: Dictionary<StorageData[]>;
}

function buildDefaultStorageReduxState(): StorageReduxState {
  const defaults: StorageReduxState = {
    allStorages: {},
    storagesByCharacterId: {},
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
      const storagesByCharacterId: Dictionary<StorageData[]> = {};
      action.payload.forEach((storage) => {
        p[storage.id] = storage;
        if (!storagesByCharacterId[storage.owner_id]) {
          storagesByCharacterId[storage.owner_id] = [];
        }
        storagesByCharacterId[storage.owner_id].push(storage);
      });
      Object.values(storagesByCharacterId).forEach((storages) => {
        storages.sort((a, b) => {
          // Personal Pile first.
          if (a.name.includes("Personal Pile")) {
            return -1;
          } else if (b.name.includes("Personal Pile")) {
            return 1;
          }

          // All other storages alphabetically.
          return a.name.localeCompare(b.name);
        });
      });
      // Then replace the whole data set in Redux.
      state.allStorages = p;
      state.storagesByCharacterId = storagesByCharacterId;
    },
    updateStorage: (state: StorageReduxState, action: PayloadAction<StorageData>) => {
      const storage = action.payload;
      state.allStorages[storage.id] = storage;

      const index = state.storagesByCharacterId[storage.owner_id].findIndex((s) => {
        return s.id === storage.id;
      });

      if (index !== -1) {
        state.storagesByCharacterId[storage.owner_id][index] = storage;
      }
    },
  },
});

export const { updateStorages, updateStorage } = storagesSlice.actions;
