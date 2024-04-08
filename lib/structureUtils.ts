import store from "../redux/store";
import { StructureComponentData } from "../serverAPI";

export function getStructureValue(structureId: number): number {
  const redux = store.getState();
  const structure = redux.structures.structures[structureId];
  if (!structure) {
    return 0;
  }
  const components = redux.structures.componentsByStructure[structureId] ?? [];
  const defs = redux.gameDefs.structureComponents;

  let value = components.reduce<number>((runningTotal: number, component: StructureComponentData) => {
    return runningTotal + defs[component.component_id].cost * component.quantity;
  }, 0);
  return value;
}

export function getStructureMonthlyMaintenance(structureId: number): number {
  const structureValue = getStructureValue(structureId);
  // Maintenance is 0.5% of structure value.
  return structureValue * 0.005;
}
