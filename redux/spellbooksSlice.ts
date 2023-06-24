import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { SpellbookEntryData } from "../serverAPI";

interface SpellbooksReduxState {
  books: Dictionary<SpellbookEntryData[]>;
}

function buildDefaultSpellbooksReduxState(): SpellbooksReduxState {
  const defaults: SpellbooksReduxState = {
    books: {},
  };
  return defaults;
}

export const spellbooksSlice = createSlice({
  name: "spellbooks",
  initialState: buildDefaultSpellbooksReduxState(),
  reducers: {
    updateSpellbooks: (state: SpellbooksReduxState, action: PayloadAction<SpellbookEntryData[]>) => {
      // Start empty.
      const p: Dictionary<SpellbookEntryData[]> = {};
      action.payload.forEach((entry) => {
        if (!p[entry.spellbook_id]) {
          p[entry.spellbook_id] = [];
        }
        p[entry.spellbook_id].push(entry);
      });
      // Then replace the whole data set in Redux.
      state.books = p;
    },
    addSpellbookEntry: (state: SpellbooksReduxState, action: PayloadAction<SpellbookEntryData>) => {
      if (!state.books[action.payload.spellbook_id]) {
        state.books[action.payload.spellbook_id] = [];
      }
      state.books[action.payload.spellbook_id].push(action.payload);
    },
    removeSpellbookEntry: (state: SpellbooksReduxState, action: PayloadAction<SpellbookEntryData>) => {
      if (state.books[action.payload.spellbook_id]) {
        state.books[action.payload.spellbook_id] = state.books[action.payload.spellbook_id].filter((entry) => {
          return entry.id !== action.payload.id;
        });
        if (state.books[action.payload.spellbook_id].length === 0) {
          delete state.books[action.payload.spellbook_id];
        }
      }
    },
    deleteSpellbook: (state: SpellbooksReduxState, action: PayloadAction<number>) => {
      delete state.books[action.payload];
    },
  },
});

export const { updateSpellbooks, addSpellbookEntry, removeSpellbookEntry, deleteSpellbook } = spellbooksSlice.actions;
