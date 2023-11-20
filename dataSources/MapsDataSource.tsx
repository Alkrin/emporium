import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { MapData } from "../serverAPI";
import { updateMapHexes, updateMaps } from "../redux/mapsSlice";
import { Dictionary } from "../lib/dictionary";

export async function refetchMaps(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchMaps();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Map Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Map data",
        },
        escapable: true,
      })
    );
  } else {
    const dict: Dictionary<MapData> = {};
    result.forEach((map) => {
      dict[map.id] = map;
    });
    dispatch(updateMaps(dict));
  }
}

export async function refetchMapHexes(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchMapHexes();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "MapHex Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch MapHex data",
        },
        escapable: true,
      })
    );
  } else {
    dispatch(updateMapHexes(result));
  }
}

export class MapsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchMaps(this.dispatch);
      await refetchMapHexes(this.dispatch);
    }
  }
}
