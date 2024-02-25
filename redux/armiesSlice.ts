import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ArmyData, TroopData, TroopInjuryData } from "../serverAPI";

interface ArmiesReduxState {
  armies: Dictionary<ArmyData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopInjuriesByTroop: Dictionary<TroopInjuryData[]>;
  activeArmyId: number;
}

function buildDefaultArmiesReduxState(): ArmiesReduxState {
  const defaults: ArmiesReduxState = {
    armies: {},
    troopsByArmy: {},
    troopInjuriesByTroop: {},
    activeArmyId: 0,
  };
  return defaults;
}

export const armiesSlice = createSlice({
  name: "armies",
  initialState: buildDefaultArmiesReduxState(),
  reducers: {
    updateArmies: (state: ArmiesReduxState, action: PayloadAction<Dictionary<ArmyData>>) => {
      state.armies = action.payload;
    },
    updateArmy: (state: ArmiesReduxState, action: PayloadAction<ArmyData>) => {
      state.armies[action.payload.id] = action.payload;
    },
    deleteArmy: (state: ArmiesReduxState, action: PayloadAction<number>) => {
      state.troopsByArmy[action.payload]?.forEach(({ id: troopId }) => {
        delete state.troopInjuriesByTroop[troopId];
      });
      delete state.troopsByArmy[action.payload];
      delete state.armies[action.payload];
    },
    updateTroops: (state: ArmiesReduxState, action: PayloadAction<TroopData[]>) => {
      state.troopsByArmy = {};
      action.payload.forEach((troop) => {
        if (!state.troopsByArmy[troop.army_id]) {
          state.troopsByArmy[troop.army_id] = [];
        }
        state.troopsByArmy[troop.army_id].push(troop);
      });
    },
    updateTroop: (state: ArmiesReduxState, action: PayloadAction<TroopData>) => {
      const newTroop = action.payload;
      if (!state.troopsByArmy[newTroop.army_id]) {
        state.troopsByArmy[newTroop.army_id] = [];
      }
      const index = state.troopsByArmy[newTroop.army_id].findIndex((hex) => {
        return hex.id === newTroop.id;
      });
      if (index === -1) {
        // Fully new hex.
        state.troopsByArmy[newTroop.army_id].push(newTroop);
      } else {
        // Update existing hex.
        state.troopsByArmy[newTroop.army_id][index] = newTroop;
      }
    },
    deleteTroop: (state: ArmiesReduxState, action: PayloadAction<number>) => {
      Object.entries(state.troopsByArmy).forEach(([armyIdString, troops]) => {
        const armyId = +armyIdString;
        // We do this extra match step so that we don't trigger updates on unchanged armies.
        const matchingTroopIndex = troops.findIndex((troop: TroopData) => {
          return troop.id === action.payload;
        });

        if (matchingTroopIndex >= 0) {
          state.troopsByArmy[armyId] = state.troopsByArmy[armyId].filter((troop) => {
            return troop.id !== action.payload;
          });
        }
      });
    },
    updateTroopInjuries: (state: ArmiesReduxState, action: PayloadAction<TroopInjuryData[]>) => {
      state.troopInjuriesByTroop = {};
      action.payload.forEach((injury) => {
        if (!state.troopInjuriesByTroop[injury.troop_id]) {
          state.troopInjuriesByTroop[injury.troop_id] = [];
        }
        state.troopInjuriesByTroop[injury.troop_id].push(injury);
      });
    },
    setActiveArmyId: (state: ArmiesReduxState, action: PayloadAction<number>) => {
      state.activeArmyId = action.payload;
    },
  },
});

export const {
  updateArmies,
  updateArmy,
  updateTroops,
  updateTroop,
  deleteArmy,
  deleteTroop,
  updateTroopInjuries,
  setActiveArmyId,
} = armiesSlice.actions;
