import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { UserData } from "../serverAPI";

export type UserRole = "debug" | "admin" | "dm" | "player";

interface UserReduxState {
  currentUser: UserData;
  lastAuthedUserName: string;
}

function buildDefaultUserReduxState(): UserReduxState {
  const defaults: UserReduxState = {
    currentUser: {
      id: 0,
      name: "",
      role: "debug",
    },
    lastAuthedUserName: "",
  };
  return defaults;
}

export const userSlice = createSlice({
  name: "user",
  initialState: buildDefaultUserReduxState(),
  reducers: {
    setCurrentUser: (
      state: UserReduxState,
      action: PayloadAction<UserData>
    ) => {
      state.currentUser = action.payload;
    },
    setLastAuthedUserName: (
      state: UserReduxState,
      action: PayloadAction<string>
    ) => {
      state.lastAuthedUserName = action.payload;
    },
  },
});

export const { setCurrentUser, setLastAuthedUserName } = userSlice.actions;
