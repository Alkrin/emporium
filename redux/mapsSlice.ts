import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { MapData, MapHexData } from "../serverAPI";

interface MapsReduxState {
  maps: Dictionary<MapData>;
  mapHexes: Record<number, MapHexData>;
  mapHexesByMap: Dictionary<MapHexData[]>;
}

function buildDefaultMapsReduxState(): MapsReduxState {
  const defaults: MapsReduxState = {
    maps: {},
    mapHexes: {},
    mapHexesByMap: {},
  };
  return defaults;
}

export const mapsSlice = createSlice({
  name: "maps",
  initialState: buildDefaultMapsReduxState(),
  reducers: {
    updateMaps: (state: MapsReduxState, action: PayloadAction<Dictionary<MapData>>) => {
      state.maps = action.payload;
    },
    updateMap: (state: MapsReduxState, action: PayloadAction<MapData>) => {
      state.maps[action.payload.id] = action.payload;
    },
    deleteMap: (state: MapsReduxState, action: PayloadAction<number>) => {
      delete state.maps[action.payload];
    },
    updateMapHexes: (state: MapsReduxState, action: PayloadAction<MapHexData[]>) => {
      state.mapHexes = {};
      state.mapHexesByMap = {};
      action.payload.forEach((hex) => {
        state.mapHexes[hex.id] = hex;

        if (!state.mapHexesByMap[hex.map_id]) {
          state.mapHexesByMap[hex.map_id] = [];
        }
        state.mapHexesByMap[hex.map_id].push(hex);
      });
    },
    updateMapHex: (state: MapsReduxState, action: PayloadAction<MapHexData>) => {
      const newHex = action.payload;

      state.mapHexes[newHex.id] = newHex;

      if (!state.mapHexesByMap[newHex.map_id]) {
        state.mapHexesByMap[newHex.map_id] = [];
      }

      const index = state.mapHexesByMap[newHex.map_id].findIndex((hex) => {
        return hex.id === newHex.id;
      });
      if (index === -1) {
        // Fully new hex.
        state.mapHexesByMap[newHex.map_id].push(newHex);
      } else {
        // Update existing hex.
        state.mapHexesByMap[newHex.map_id][index] = newHex;
      }
    },
  },
});

export const { updateMaps, updateMap, deleteMap, updateMapHexes, updateMapHex } = mapsSlice.actions;
