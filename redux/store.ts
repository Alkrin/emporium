import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./userSlice";

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type ReduxDispatch = typeof store.dispatch;

export default store;
