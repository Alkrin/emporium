import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ProficiencyData, UserData } from "../serverAPI";

interface ProficienciesReduxState {
  proficienciesByCharacterId: Dictionary<ProficiencyData[]>;
}

function buildDefaultProficienciesReduxState(): ProficienciesReduxState {
  const defaults: ProficienciesReduxState = {
    proficienciesByCharacterId: {},
  };
  return defaults;
}

export const proficienciesSlice = createSlice({
  name: "proficiencies",
  initialState: buildDefaultProficienciesReduxState(),
  reducers: {
    updateProficiencies: (state: ProficienciesReduxState, action: PayloadAction<ProficiencyData[]>) => {
      // Start empty.
      const p: Dictionary<ProficiencyData[]> = {};
      action.payload.forEach((proficiency) => {
        // Make sure we have an array for this character.
        if (!p[proficiency.character_id]) {
          p[proficiency.character_id] = [];
        }
        // And push this proficiencyData into it.
        p[proficiency.character_id].push(proficiency);
      });
      // Then replace the whole data set in Redux.
      state.proficienciesByCharacterId = p;
    },
  },
});

export const { updateProficiencies } = proficienciesSlice.actions;
