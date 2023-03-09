import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { UserData } from "../serverAPI";

export type UserRole = "admin" | "dm" | "player";

interface UserReduxState {
  currentUser: UserData;
  lastAuthedUserName: string;
  users: Dictionary<UserData>;
}

function buildDefaultUserReduxState(): UserReduxState {
  const defaults: UserReduxState = {
    currentUser: {
      id: 0,
      name: "",
      role: "player",
    },
    lastAuthedUserName: "",
    users: {},
  };
  return defaults;
}

export const userSlice = createSlice({
  name: "user",
  initialState: buildDefaultUserReduxState(),
  reducers: {
    setCurrentUser: (state: UserReduxState, action: PayloadAction<UserData>) => {
      state.currentUser = action.payload;
    },
    setLastAuthedUserName: (state: UserReduxState, action: PayloadAction<string>) => {
      state.lastAuthedUserName = action.payload;
    },
    updateUser: (state: UserReduxState, action: PayloadAction<UserData>) => {
      state.users[action.payload.id] = action.payload;
    },
  },
});

export const { setCurrentUser, setLastAuthedUserName, updateUser } = userSlice.actions;
