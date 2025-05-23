import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { CharacterData, CharacterEquipmentData } from "../serverAPI";

interface CharactersReduxState {
  characters: Dictionary<CharacterData>;
  activeCharacterId: number;
  dashboardCharacterId: number;
}

export interface SetXPParams {
  characterId: number;
  xp: number;
}

export interface SetHPParams {
  characterId: number;
  hp: number;
}

export interface SetMoneyParams {
  characterId: number;
  money: number;
}

export interface SetLocationParams {
  characterId: number;
  locationId: number;
}

export interface SetLanguagesParams {
  characterId: number;
  languages: string[];
}

export interface SetEquipmentParams {
  characterId: number;
  itemId: number;
  slot: keyof CharacterEquipmentData;
}

export interface SetHenchmasterParams {
  masterCharacterId: number;
  minionCharacterId: number;
}

export interface SetRemainingCXPDeductibleParams {
  characterId: number;
  remainingCXPDeductible: number;
}

function buildDefaultCharactersReduxState(): CharactersReduxState {
  const defaults: CharactersReduxState = {
    characters: {},
    activeCharacterId: 0,
    dashboardCharacterId: 0,
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
    updateCharacters: (state: CharactersReduxState, action: PayloadAction<CharacterData[]>) => {
      state.characters = {};
      action.payload.forEach((character) => {
        state.characters[character.id] = character;
      });
    },
    deleteCharacter: (state: CharactersReduxState, action: PayloadAction<number>) => {
      if (state.characters[action.payload]) {
        delete state.characters[action.payload];
      }
    },
    setActiveCharacterId: (state: CharactersReduxState, action: PayloadAction<number>) => {
      state.activeCharacterId = action.payload;
    },
    setDashboardCharacterId: (state: CharactersReduxState, action: PayloadAction<number>) => {
      state.dashboardCharacterId = action.payload;
    },
    setCharacterHP: (state: CharactersReduxState, action: PayloadAction<SetHPParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].hp = action.payload.hp;
      }
    },
    setCharacterLocation: (state: CharactersReduxState, action: PayloadAction<SetLocationParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].location_id = action.payload.locationId;
      }
    },
    setCharacterLanguages: (state: CharactersReduxState, action: PayloadAction<SetLanguagesParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].languages = action.payload.languages;
      }
    },
    setCharacterXP: (state: CharactersReduxState, action: PayloadAction<SetXPParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].xp = action.payload.xp;
      }
    },
    setCharacterXPReserve: (state: CharactersReduxState, action: PayloadAction<SetXPParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].xp_reserve = action.payload.xp;
      }
    },
    setCharacterRemainingCXPDeductible: (
      state: CharactersReduxState,
      action: PayloadAction<SetRemainingCXPDeductibleParams>
    ) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId].remaining_cxp_deductible = action.payload.remainingCXPDeductible;
      }
    },
    setEquipment: (state: CharactersReduxState, action: PayloadAction<SetEquipmentParams>) => {
      if (state.characters[action.payload.characterId]) {
        state.characters[action.payload.characterId][action.payload.slot] = action.payload.itemId;
      }
    },
    setHenchmaster: (state: CharactersReduxState, action: PayloadAction<SetHenchmasterParams>) => {
      if (state.characters[action.payload.minionCharacterId]) {
        state.characters[action.payload.minionCharacterId].henchmaster_id = action.payload.masterCharacterId;
      }
    },
    unsetAllHenchmenForCharacter: (state: CharactersReduxState, action: PayloadAction<number>) => {
      Object.values(state.characters).forEach((character) => {
        if (character.henchmaster_id === action.payload) {
          character.henchmaster_id = 0;
        }
      });
    },
  },
});

export const {
  updateCharacters,
  updateCharacter,
  deleteCharacter,
  setActiveCharacterId,
  setDashboardCharacterId,
  setCharacterHP,
  setCharacterLanguages,
  setCharacterLocation,
  setCharacterXP,
  setCharacterXPReserve,
  setEquipment,
  setHenchmaster,
  setCharacterRemainingCXPDeductible,
  unsetAllHenchmenForCharacter,
} = charactersSlice.actions;
