import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { RepertoireEntryData } from "../serverAPI";

interface RepertoiresReduxState {
  repertoiresByCharacter: Dictionary<RepertoireEntryData[]>;
}

function buildDefaultRepertoiresReduxState(): RepertoiresReduxState {
  const defaults: RepertoiresReduxState = {
    repertoiresByCharacter: {},
  };
  return defaults;
}

export const repertoiresSlice = createSlice({
  name: "repertoires",
  initialState: buildDefaultRepertoiresReduxState(),
  reducers: {
    updateRepertoires: (state: RepertoiresReduxState, action: PayloadAction<RepertoireEntryData[]>) => {
      // Start empty.
      const p: Dictionary<RepertoireEntryData[]> = {};
      action.payload.forEach((entry) => {
        if (!p[entry.character_id]) {
          p[entry.character_id] = [];
        }
        p[entry.character_id].push(entry);
      });
      // Then replace the whole data set in Redux.
      state.repertoiresByCharacter = p;
    },
    addRepertoireEntry: (state: RepertoiresReduxState, action: PayloadAction<RepertoireEntryData>) => {
      if (!state.repertoiresByCharacter[action.payload.character_id]) {
        state.repertoiresByCharacter[action.payload.character_id] = [];
      }
      state.repertoiresByCharacter[action.payload.character_id].push(action.payload);
    },
    removeRepertoireEntry: (state: RepertoiresReduxState, action: PayloadAction<RepertoireEntryData>) => {
      if (state.repertoiresByCharacter[action.payload.character_id]) {
        state.repertoiresByCharacter[action.payload.character_id] = state.repertoiresByCharacter[
          action.payload.character_id
        ].filter((entry) => {
          return entry.id !== action.payload.id;
        });
        if (state.repertoiresByCharacter[action.payload.character_id].length === 0) {
          delete state.repertoiresByCharacter[action.payload.character_id];
        }
      }
    },
    deleteRepertoireForCharacter: (state: RepertoiresReduxState, action: PayloadAction<number>) => {
      if (state.repertoiresByCharacter[action.payload]) {
        delete state.repertoiresByCharacter[action.payload];
      }
    },
  },
});

export const { updateRepertoires, addRepertoireEntry, removeRepertoireEntry, deleteRepertoireForCharacter } =
  repertoiresSlice.actions;
