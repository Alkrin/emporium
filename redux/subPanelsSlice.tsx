/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SubPanelParams {
  id: string;
  content: () => React.ReactNode;
  // If true, this subpanel will close itself in response to the Escape key.
  escapable?: boolean;
}

export interface SubPanelsState {
  subPanels: SubPanelParams[];
}

function buildDefaultSubPanelsState() {
  const DefaultModalsState: SubPanelsState = {
    subPanels: [],
  };

  return DefaultModalsState;
}

export const subPanelsSlice = createSlice({
  name: "subpanels",
  initialState: buildDefaultSubPanelsState(),
  reducers: {
    showSubPanel: (
      state: SubPanelsState,
      action: PayloadAction<SubPanelParams>
    ) => {
      state.subPanels.push(action.payload);
    },
    hideSubPanel: (state: SubPanelsState) => {
      if (state.subPanels.length > 0) {
        // Removes the first item from the array.
        state.subPanels.shift();
      }
    },
  },
});

export const { showSubPanel, hideSubPanel } = subPanelsSlice.actions;
