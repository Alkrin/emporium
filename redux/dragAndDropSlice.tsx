/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import React from "react";
import { Dictionary } from "../lib/dictionary";

interface DragStartParams {
  draggableId: string;
  draggingRender: () => React.ReactNode;
}

export interface DropTargetParams {
  dropTargetId: string;
  dropTypes: string[];
  bounds: DOMRect;
}

export interface RemoveDropTargetParams {
  dropTargetId: string;
  dropTypes: string[];
}

interface DragAndDropState {
  /** The id of the single Draggable currently being dragged.  Else null. */
  currentDraggableId: string | null;
  currentDraggableBounds: DOMRect | null;
  dragDelta: [number, number];
  /** First key is a dropType.  Second key is a dropTargetId. */
  dropTargets: Dictionary<Dictionary<DOMRect>>;
  currentDraggingRender: (() => React.ReactNode) | null;
}

function buildDefaultDragAndDropState() {
  const DefaultDragAndDropState: DragAndDropState = {
    currentDraggableId: null,
    currentDraggableBounds: null,
    currentDraggingRender: null,
    dragDelta: [0, 0],
    dropTargets: {},
  };

  return DefaultDragAndDropState;
}

export const dragAndDropSlice = createSlice({
  name: "dragAndDrop",
  initialState: buildDefaultDragAndDropState(),
  reducers: {
    startDrag: (state: DragAndDropState, action: PayloadAction<DragStartParams>) => {
      state.currentDraggableId = action.payload.draggableId;
      state.currentDraggingRender = action.payload.draggingRender;
    },
    endDrag: (state: DragAndDropState) => {
      state.currentDraggableId = null;
      state.currentDraggableBounds = null;
      state.currentDraggingRender = null;
      state.dragDelta = [0, 0];
    },
    reportDraggableBounds: (state: DragAndDropState, action: PayloadAction<DOMRect>) => {
      if (state.currentDraggableBounds === null) {
        state.currentDraggableBounds = action.payload;
      }
    },
    reportDropTargetBounds: (state: DragAndDropState, action: PayloadAction<DropTargetParams>) => {
      const { dropTypes, dropTargetId, bounds } = action.payload;
      // Make sure the dropTypes have a home.
      dropTypes.forEach((dropType) => {
        if (!state.dropTargets[dropType]) {
          state.dropTargets[dropType] = {};
        }
        state.dropTargets[dropType][dropTargetId] = bounds;
      });
    },
    removeDropTarget: (state: DragAndDropState, action: PayloadAction<RemoveDropTargetParams>) => {
      const { dropTypes, dropTargetId } = action.payload;
      dropTypes.forEach((dropType) => {
        if (state.dropTargets[dropType]?.[dropTargetId]) {
          delete state.dropTargets[dropType][dropTargetId];
        }
      });
    },
    updateDragDelta: (state: DragAndDropState, action: PayloadAction<[number, number]>) => {
      state.dragDelta = action.payload;
    },
  },
});

export const { startDrag, endDrag, reportDraggableBounds, reportDropTargetBounds, removeDropTarget, updateDragDelta } =
  dragAndDropSlice.actions;
