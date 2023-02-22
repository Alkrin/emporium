/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from "react";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";

export enum HUDVerticalAnchor {
  Top,
  Center,
  Bottom,
}

export enum HUDHorizontalAnchor {
  Left,
  Center,
  Right,
}

export interface EscapableParams {
  id: string;
  onEscape: (dispatch: Dispatch) => void;
}

interface HUDState {
  escapables: EscapableParams[];
  hudWidth: number;
  hudHeight: number;
}

function buildDefaultHUDState() {
  const DefaultHUDState: HUDState = {
    escapables: [],
    hudWidth: 0,
    hudHeight: 0,
  };

  return DefaultHUDState;
}

export const hudSlice = createSlice({
  name: "hud",
  initialState: buildDefaultHUDState(),
  reducers: {
    addOrUpdateEscapable: (
      state: HUDState,
      action: PayloadAction<EscapableParams>
    ) => {
      // If the item already existed, remove it so we can put it on the top.
      state.escapables = state.escapables.filter((escapable) => {
        return escapable.id !== action.payload.id;
      });
      state.escapables.push(action.payload);
    },
    removeEscapable: (state: HUDState, action: PayloadAction<string>) => {
      state.escapables = state.escapables.filter((escapable) => {
        return escapable.id !== action.payload;
      });
    },
    updateHUDSize: (
      state: HUDState,
      action: PayloadAction<[number, number]>
    ) => {
      state.hudWidth = action.payload[0];
      state.hudHeight = action.payload[1];
    },
  },
});

export const { addOrUpdateEscapable, removeEscapable, updateHUDSize } =
  hudSlice.actions;
