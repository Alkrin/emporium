import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { LocationData } from "../serverAPI";

interface LocationsReduxState {
  locations: Record<number, LocationData>;
}

function buildDefaultMapsReduxState(): LocationsReduxState {
  const defaults: LocationsReduxState = {
    locations: {},
  };
  return defaults;
}

export const locationsSlice = createSlice({
  name: "locations",
  initialState: buildDefaultMapsReduxState(),
  reducers: {
    updateLocations: (state: LocationsReduxState, action: PayloadAction<Record<number, LocationData>>) => {
      state.locations = action.payload;
    },
    updateLocation: (state: LocationsReduxState, action: PayloadAction<LocationData>) => {
      state.locations[action.payload.id] = action.payload;
    },
    deleteLocation: (state: LocationsReduxState, action: PayloadAction<number>) => {
      delete state.locations[action.payload];
    },
  },
});

export const { updateLocations, updateLocation, deleteLocation } = locationsSlice.actions;
