import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { CharacterData } from "../serverAPI";

interface CharactersReduxState {
  characters: Dictionary<CharacterData>;
  activeCharacterId: number;
}

export interface SetXPParams {
  characterId: number;
  xp: number;
}

export interface SetHPParams {
  characterId: number;
  hp: number;
}

function buildDefaultCharactersReduxState(): CharactersReduxState {
  const defaults: CharactersReduxState = {
    characters: {},
    activeCharacterId: -1,
  };
  return defaults;
}

export const charactersSlice = createSlice({
  name: "characters",
  initialState: buildDefaultCharactersReduxState(),
  reducers: {
    updateCharacter: (state: CharactersReduxState, action: PayloadAction<CharacterData>) => {
      state.characters[action.payload.id] = action.payload;
    },
    setActiveCharacterId: (state: CharactersReduxState, action: PayloadAction<number>) => {
      state.activeCharacterId = action.payload;
    },
    setCharacterHP: (state: CharactersReduxState, action: PayloadAction<SetHPParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].hp = action.payload.hp;
      }
    },
    setCharacterXP: (state: CharactersReduxState, action: PayloadAction<SetXPParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].xp = action.payload.xp;
      }
    },
  },
});

export const { updateCharacter, setActiveCharacterId, setCharacterHP, setCharacterXP } = charactersSlice.actions;