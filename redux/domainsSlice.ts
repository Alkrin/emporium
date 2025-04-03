import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { DomainData } from "../serverAPI";

export interface SetDomainRulerParams {
  domainId: number;
  rulerId: number;
}

interface DomainsReduxState {
  allDomains: Record<number, DomainData>;
}

function buildDefaultReduxState(): DomainsReduxState {
  const defaults: DomainsReduxState = {
    allDomains: {},
  };
  return defaults;
}

export const domainsSlice = createSlice({
  name: "domains",
  initialState: buildDefaultReduxState(),
  reducers: {
    updateDomains: (state: DomainsReduxState, action: PayloadAction<DomainData[]>) => {
      // Start empty.
      const p: Record<number, DomainData> = {};
      action.payload.forEach((domain) => {
        p[domain.id] = domain;
      });
      // Then replace the whole data set in Redux.
      state.allDomains = p;
    },
    updateDomain: (state: DomainsReduxState, action: PayloadAction<DomainData>) => {
      state.allDomains[action.payload.id] = action.payload;
    },
    deleteDomain: (state: DomainsReduxState, action: PayloadAction<number>) => {
      delete state.allDomains[action.payload];
    },
    setDomainRuler: (state: DomainsReduxState, action: PayloadAction<SetDomainRulerParams>) => {
      if (state.allDomains[action.payload.domainId]) {
        state.allDomains[action.payload.domainId].ruler_character_id = action.payload.rulerId;
      }
    },
  },
});

export const { updateDomains, updateDomain, deleteDomain, setDomainRuler } = domainsSlice.actions;
