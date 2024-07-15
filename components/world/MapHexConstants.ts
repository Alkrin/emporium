import { Dictionary } from "../../lib/dictionary";
import { MapHexData, MapHexRoadType } from "../../serverAPI";

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

export const hexPointCoords: Record<string, [string, string]> = {
  a: ["25%", "1%"],
  b: ["50%", "1%"],
  c: ["75%", "1%"],
  d: ["13.5%", "25%"],
  e: ["37.5%", "25%"],
  f: ["62.5%", "25%"],
  g: ["86.5%", "25%"],
  h: ["1%", "50%"],
  i: ["25%", "50%"],
  j: ["50%", "50%"],
  k: ["75%", "50%"],
  l: ["99%", "50%"],
  m: ["13.5%", "75%"],
  n: ["37.5%", "75%"],
  o: ["62.5%", "75%"],
  p: ["86.5%", "75%"],
  q: ["25%", "99%"],
  r: ["50%", "99%"],
  s: ["75%", "99%"],
};

export const roadColors: Record<number, string> = {
  [MapHexRoadType.Dirt]: "brown",
  [MapHexRoadType.Paved]: "darkgray",
};
