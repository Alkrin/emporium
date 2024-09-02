/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ModalParams {
  id: string;
  content: () => React.ReactNode;
  // If true, this modal will close itself in response to the Escape key,
  // (or whichever key is bound to the Menu action).
  escapable?: boolean;
}

export interface ModalsState {
  modals: ModalParams[];
}

function buildDefaultModalsState() {
  const DefaultModalsState: ModalsState = {
    modals: [],
  };

  return DefaultModalsState;
}

export const modalsSlice = createSlice({
  name: "modals",
  initialState: buildDefaultModalsState(),
  reducers: {
    showModal: (state: ModalsState, action: PayloadAction<ModalParams>) => {
      state.modals.push(action.payload);
    },
    hideModal: (state: ModalsState) => {
      if (state.modals.length > 0) {
        // Removes the last item from the array.
        state.modals.pop();
      }
    },
  },
});

export const { showModal, hideModal } = modalsSlice.actions;
