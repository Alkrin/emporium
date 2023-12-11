import { Dictionary } from "../../lib/dictionary";

export interface MapHexType {
  id: string;
  color: string;
  iconURL: string;
}

export enum MapHexTypes {
  Undefined = "Undefined",
  Ashland = "Ashland",
  Desert = "Desert",
  Forest = "Forest",
  Grassland = "Grassland",
  Hills = "Hills",
  Marsh = "Marsh",
  Mountain = "Mountain",
  MountainSnowy = "MountainSnowy",
  Ocean = "Ocean",
  Scrubland = "Scrubland",
}

export const MapHexTypesArray = [
  MapHexTypes.Undefined,
  ...Object.keys(MapHexTypes)
    .filter((k) => {
      return k !== MapHexTypes.Undefined;
    })
    .sort(),
];
