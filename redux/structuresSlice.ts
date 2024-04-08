import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { StructureComponentData, StructureData } from "../serverAPI";

interface StructuresReduxState {
  structures: Dictionary<StructureData>;
  componentsByStructure: Dictionary<StructureComponentData[]>;
  activeStructureId: number;
}

function buildDefaultStructuresReduxState(): StructuresReduxState {
  const defaults: StructuresReduxState = {
    structures: {},
    componentsByStructure: {},
    activeStructureId: 0,
  };
  return defaults;
}

export const structuresSlice = createSlice({
  name: "structures",
  initialState: buildDefaultStructuresReduxState(),
  reducers: {
    updateStructures: (state: StructuresReduxState, action: PayloadAction<Dictionary<StructureData>>) => {
      state.structures = action.payload;
    },
    updateStructure: (state: StructuresReduxState, action: PayloadAction<StructureData>) => {
      state.structures[action.payload.id] = action.payload;
    },
    deleteStructure: (state: StructuresReduxState, action: PayloadAction<number>) => {
      delete state.componentsByStructure[action.payload];
      delete state.structures[action.payload];
    },
    updateStructureComponents: (state: StructuresReduxState, action: PayloadAction<StructureComponentData[]>) => {
      state.componentsByStructure = {};
      action.payload.forEach((structureComponent) => {
        if (!state.componentsByStructure[structureComponent.structure_id]) {
          state.componentsByStructure[structureComponent.structure_id] = [];
        }
        state.componentsByStructure[structureComponent.structure_id].push(structureComponent);
      });
    },
    updateStructureComponent: (state: StructuresReduxState, action: PayloadAction<StructureComponentData>) => {
      const newStructureComponent = action.payload;
      if (!state.componentsByStructure[newStructureComponent.structure_id]) {
        state.componentsByStructure[newStructureComponent.structure_id] = [];
      }
      const index = state.componentsByStructure[newStructureComponent.structure_id].findIndex((structureComponent) => {
        return structureComponent.id === newStructureComponent.id;
      });
      if (index === -1) {
        // Fully new structure component.
        state.componentsByStructure[newStructureComponent.structure_id].push(newStructureComponent);
      } else {
        // Update existing structure component.
        state.componentsByStructure[newStructureComponent.structure_id][index] = newStructureComponent;
      }
    },
    deleteStructureComponent: (state: StructuresReduxState, action: PayloadAction<number>) => {
      Object.entries(state.componentsByStructure).forEach(([structureIdString, structureComponents]) => {
        const structureId = +structureIdString;
        // We do this extra match step so that we don't trigger updates on unchanged structures.
        const matchingStructureIndex = structureComponents.findIndex((structureComponent: StructureComponentData) => {
          return structureComponent.id === action.payload;
        });

        if (matchingStructureIndex >= 0) {
          state.componentsByStructure[structureId] = state.componentsByStructure[structureId].filter((troop) => {
            return troop.id !== action.payload;
          });
        }
      });
    },
    setActiveStructureId: (state: StructuresReduxState, action: PayloadAction<number>) => {
      state.activeStructureId = action.payload;
    },
  },
});

export const {
  updateStructures,
  updateStructure,
  updateStructureComponents,
  updateStructureComponent,
  deleteStructure,
  deleteStructureComponent,
  setActiveStructureId,
} = structuresSlice.actions;
