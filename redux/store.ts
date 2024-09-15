import { configureStore } from "@reduxjs/toolkit";
import { charactersSlice } from "./charactersSlice";
import { contextMenuSlice } from "./contextMenuSlice";
import { dragAndDropSlice } from "./dragAndDropSlice";
import { gameDefsSlice } from "./gameDefsSlice";
import { hudSlice } from "./hudSlice";
import { itemsSlice } from "./itemsSlice";
import { modalsSlice } from "./modalsSlice";
import { proficienciesSlice } from "./proficienciesSlice";
import { storagesSlice } from "./storageSlice";
import { subPanelsSlice } from "./subPanelsSlice";
import { toastersSlice } from "./toastersSlice";
import { tooltipSlice } from "./tooltipSlice";
import { userSlice } from "./userSlice";
import { spellbooksSlice } from "./spellbooksSlice";
import { repertoiresSlice } from "./repertoiresSlice";
import { activitiesSlice } from "./activitiesSlice";
import { mapsSlice } from "./mapsSlice";
import { locationsSlice } from "./locationsSlice";
import { armiesSlice } from "./armiesSlice";
import { structuresSlice } from "./structuresSlice";
import { contractsSlice } from "./contractsSlice";

const store = configureStore({
  reducer: {
    activities: activitiesSlice.reducer,
    armies: armiesSlice.reducer,
    characters: charactersSlice.reducer,
    contextMenu: contextMenuSlice.reducer,
    contracts: contractsSlice.reducer,
    dragAndDrop: dragAndDropSlice.reducer,
    gameDefs: gameDefsSlice.reducer,
    hud: hudSlice.reducer,
    items: itemsSlice.reducer,
    locations: locationsSlice.reducer,
    maps: mapsSlice.reducer,
    modals: modalsSlice.reducer,
    proficiencies: proficienciesSlice.reducer,
    repertoires: repertoiresSlice.reducer,
    spellbooks: spellbooksSlice.reducer,
    storages: storagesSlice.reducer,
    structures: structuresSlice.reducer,
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

export type AppDispatch = typeof store.dispatch;

export default store;
