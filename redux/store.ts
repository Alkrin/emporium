import { configureStore } from "@reduxjs/toolkit";
import { contextMenuSlice } from "./contextMenuSlice";
import { dragAndDropSlice } from "./dragAndDropSlice";
import { hudSlice } from "./hudSlice";
import { modalsSlice } from "./modalsSlice";
import { toastersSlice } from "./toastersSlice";
import { tooltipSlice } from "./tooltipSlice";
import { userSlice } from "./userSlice";

const store = configureStore({
  reducer: {
    contextMenu: contextMenuSlice.reducer,
    dragAndDrop: dragAndDropSlice.reducer,
    hud: hudSlice.reducer,
    modals: modalsSlice.reducer,
    toasters: toastersSlice.reducer,
    tooltip: tooltipSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type ReduxDispatch = typeof store.dispatch;

export default store;
