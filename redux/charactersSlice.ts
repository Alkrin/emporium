import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { CharacterData } from "../serverAPI";

interface CharactersReduxState {
  characters: Dictionary<CharacterData>;
}

function buildDefaultCharactersReduxState(): CharactersReduxState {
  const defaults: CharactersReduxState = {
    characters: {},
  };
  return defaults;
}

export const charactersSlice = createSlice({
  name: "characters",
  initialState: buildDefaultCharactersReduxState(),
  reducers: {
    updateCharacter: (
      state: CharactersReduxState,
      action: PayloadAction<CharacterData>
    ) => {
      state.characters[action.payload.id] = action.payload;
    },
  },
});

export const { updateCharacter } = charactersSlice.actions;
