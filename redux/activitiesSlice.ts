import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ActivityData, ActivityOutcomeData } from "../serverAPI";

interface ActivitiesReduxState {
  activities: Dictionary<ActivityData>;
  expectedOutcomesByActivity: Dictionary<ActivityOutcomeData[]>;
  outcomesByActivity: Dictionary<ActivityOutcomeData[]>;
  activeActivityId: number;
}

function buildDefaultActivitiesReduxState(): ActivitiesReduxState {
  const defaults: ActivitiesReduxState = {
    activities: {},
    expectedOutcomesByActivity: {},
    outcomesByActivity: {},
    activeActivityId: 0,
  };
  return defaults;
}

export const activitiesSlice = createSlice({
  name: "activities",
  initialState: buildDefaultActivitiesReduxState(),
  reducers: {
    updateActivities: (state: ActivitiesReduxState, action: PayloadAction<ActivityData[]>) => {
      const newActivities: Dictionary<ActivityData> = {};
      action.payload.forEach((a) => {
        newActivities[a.id] = a;
      });
      state.activities = newActivities;
    },
    updateExpectedOutcomes: (state: ActivitiesReduxState, action: PayloadAction<ActivityOutcomeData[]>) => {
      const newOutcomes: Dictionary<ActivityOutcomeData[]> = {};
      action.payload.forEach((o) => {
        if (!newOutcomes[o.activity_id]) {
          newOutcomes[o.activity_id] = [];
        }
        newOutcomes[o.activity_id].push(o);
      });
      state.expectedOutcomesByActivity = newOutcomes;
    },
    updateActivityOutcomes: (state: ActivitiesReduxState, action: PayloadAction<ActivityOutcomeData[]>) => {
      const newOutcomes: Dictionary<ActivityOutcomeData[]> = {};
      action.payload.forEach((o) => {
        if (!newOutcomes[o.activity_id]) {
          newOutcomes[o.activity_id] = [];
        }
        newOutcomes[o.activity_id].push(o);
      });
      state.outcomesByActivity = newOutcomes;
    },
    setActiveActivityId: (state: ActivitiesReduxState, action: PayloadAction<number>) => {
      state.activeActivityId = action.payload;
    },
    deleteOutcomesForActivity: (state: ActivitiesReduxState, action: PayloadAction<number>) => {
      delete state.outcomesByActivity[action.payload];
    },
    deleteActivity: (state: ActivitiesReduxState, action: PayloadAction<number>) => {
      delete state.activities[action.payload];
    },
  },
});

export const {
  updateActivities,
  updateExpectedOutcomes,
  updateActivityOutcomes,
  setActiveActivityId,
  deleteActivity,
  deleteOutcomesForActivity,
} = activitiesSlice.actions;
