import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ProficiencyData } from "../serverAPI";
import { ProficiencySource } from "../staticData/types/abilitiesAndProficiencies";

export interface AddRemoveInjuryParams {
  characterId: number;
  injuryId: string;
}

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
    deleteProficienciesForCharacter: (state: ProficienciesReduxState, action: PayloadAction<number>) => {
      if (state.proficienciesByCharacterId[action.payload]) {
        delete state.proficienciesByCharacterId[action.payload];
      }
    },
    addInjury: (state: ProficienciesReduxState, action: PayloadAction<AddRemoveInjuryParams>) => {
      const { characterId, injuryId } = action.payload;
      const injuryData: ProficiencyData = {
        character_id: characterId,
        feature_id: injuryId,
        subtype: "",
        source: ProficiencySource.Injury,
      };
      if (!state.proficienciesByCharacterId[characterId]) {
        state.proficienciesByCharacterId[characterId] = [];
      }
      state.proficienciesByCharacterId[characterId].push(injuryData);
    },
    removeInjury: (state: ProficienciesReduxState, action: PayloadAction<AddRemoveInjuryParams>) => {
      const { characterId, injuryId } = action.payload;
      if (state.proficienciesByCharacterId[characterId]) {
        state.proficienciesByCharacterId[characterId] = state.proficienciesByCharacterId[characterId].filter((p) => {
          return p.feature_id !== injuryId;
        });
      }
    },
  },
});

export const { updateProficiencies, deleteProficienciesForCharacter, addInjury, removeInjury } =
  proficienciesSlice.actions;
