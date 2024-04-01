import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { StorageData } from "../serverAPI";

interface StorageReduxState {
  allStorages: Dictionary<StorageData>;
  storagesByCharacterId: Dictionary<StorageData[]>;
  activeStorageId: number;
}

function buildDefaultStorageReduxState(): StorageReduxState {
  const defaults: StorageReduxState = {
    allStorages: {},
    storagesByCharacterId: {},
    activeStorageId: -1,
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
    setActiveStorageId: (state: StorageReduxState, action: PayloadAction<number>) => {
      state.activeStorageId = action.payload;
    },
    deleteStorage: (state: StorageReduxState, action: PayloadAction<number>) => {
      if (state.allStorages[action.payload]) {
        // Take it out of storagesByCharacterId.
        state.storagesByCharacterId[state.allStorages[action.payload].owner_id] = state.storagesByCharacterId[
          state.allStorages[action.payload].owner_id
        ].filter((storage) => {
          return storage.id !== action.payload;
        });
        // Take it out of allStorages.
        delete state.allStorages[action.payload];
      }
    },
  },
});

export const { updateStorages, updateStorage, setActiveStorageId, deleteStorage } = storagesSlice.actions;
