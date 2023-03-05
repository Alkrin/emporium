import { configureStore } from "@reduxjs/toolkit";
import { charactersSlice } from "./charactersSlice";
import { contextMenuSlice } from "./contextMenuSlice";
import { dragAndDropSlice } from "./dragAndDropSlice";
import { hudSlice } from "./hudSlice";
import { modalsSlice } from "./modalsSlice";
import { subPanelsSlice } from "./subPanelsSlice";
import { toastersSlice } from "./toastersSlice";
import { tooltipSlice } from "./tooltipSlice";
import { userSlice } from "./userSlice";

const store = configureStore({
  reducer: {
    characters: charactersSlice.reducer,
    contextMenu: contextMenuSlice.reducer,
    dragAndDrop: dragAndDropSlice.reducer,
    hud: hudSlice.reducer,
    modals: modalsSlice.reducer,
    subPanels: subPanelsSlice.reducer,
    toasters: toastersSlice.reducer,
    tooltip: tooltipSlice.reducer,
    user: userSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // This gets rid of a restriction on the data types we can store in Redux.
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;

export type ReduxDispatch = typeof store.dispatch;

export default store;
