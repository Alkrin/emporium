import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { CharacterData, CharacterEquipmentData } from "../serverAPI";

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

export interface SetEquipmentParams {
  characterId: number;
  itemId: number;
  slot: keyof CharacterEquipmentData;
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
    deleteCharacter: (state: CharactersReduxState, action: PayloadAction<number>) => {
      if (state.characters[action.payload]) {
        delete state.characters[action.payload];
      }
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
    setEquipment: (state: CharactersReduxState, action: PayloadAction<SetEquipmentParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId][action.payload.slot] = action.payload.itemId;
      }
    },
  },
});

export const { updateCharacter, deleteCharacter, setActiveCharacterId, setCharacterHP, setCharacterXP, setEquipment } =
  charactersSlice.actions;
