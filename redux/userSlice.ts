import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { UserData } from "../serverAPI";

type UserRole = "admin" | "dm" | "player";

function buildDefaultUserData(): UserData {
  const defaults: UserData = {
    id: 0,
    name: "",
    role: "player",
  };
  return defaults;
}

export const userSlice = createSlice({
  name: "user",
  initialState: buildDefaultUserData(),
  reducers: {
    setCurrentUser: (state: UserData, action: PayloadAction<UserData>) => {
      return { ...action.payload };
    },
  },
});

export const { setCurrentUser } = userSlice.actions;
