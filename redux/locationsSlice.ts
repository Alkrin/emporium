import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { LocationCityData, LocationData, LocationLairData } from "../serverAPI";

interface LocationsReduxState {
  locations: Dictionary<LocationData>;
  cities: Dictionary<LocationCityData>;
  lairs: Dictionary<LocationLairData>;
}

function buildDefaultMapsReduxState(): LocationsReduxState {
  const defaults: LocationsReduxState = {
    locations: {},
    cities: {},
    lairs: {},
  };
  return defaults;
}

export const locationsSlice = createSlice({
  name: "locations",
  initialState: buildDefaultMapsReduxState(),
  reducers: {
    updateLocations: (state: LocationsReduxState, action: PayloadAction<Dictionary<LocationData>>) => {
      state.locations = action.payload;
    },
    updateLocation: (state: LocationsReduxState, action: PayloadAction<LocationData>) => {
      state.locations[action.payload.id] = action.payload;
    },
    deleteLocation: (state: LocationsReduxState, action: PayloadAction<number>) => {
      delete state.locations[action.payload];
    },
    updateLocationLairs: (state: LocationsReduxState, action: PayloadAction<Dictionary<LocationLairData>>) => {
      state.lairs = action.payload;
    },
    updateLocationLair: (state: LocationsReduxState, action: PayloadAction<LocationLairData>) => {
      state.lairs[action.payload.id] = action.payload;
    },
    deleteLocationLair: (state: LocationsReduxState, action: PayloadAction<number>) => {
      delete state.lairs[action.payload];
    },
    updateLocationCities: (state: LocationsReduxState, action: PayloadAction<Dictionary<LocationCityData>>) => {
      state.cities = action.payload;
    },
    updateLocationCity: (state: LocationsReduxState, action: PayloadAction<LocationCityData>) => {
      state.cities[action.payload.id] = action.payload;
    },
    deleteLocationCity: (state: LocationsReduxState, action: PayloadAction<number>) => {
      delete state.cities[action.payload];
    },
  },
});

export const {
  updateLocations,
  updateLocation,
  deleteLocation,
  updateLocationCities,
  updateLocationCity,
  deleteLocationCity,
  updateLocationLairs,
  updateLocationLair,
  deleteLocationLair,
} = locationsSlice.actions;
