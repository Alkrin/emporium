import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { LocationCityData, LocationData, LocationLairData, StringToNumbers } from "../serverAPI";
import { Dictionary } from "../lib/dictionary";
import { updateLocationCities, updateLocationLairs, updateLocations } from "../redux/locationsSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchLocations(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchLocations();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Location Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Location data"} />,
        escapable: true,
      })
    );
  } else {
    const dict: Dictionary<LocationData> = {};
    result.forEach((l) => {
      dict[l.id] = {
        ...l,
        is_public: !!l.is_public, // Converts from 1/0 to a true/false.
        viewer_ids: StringToNumbers(l.viewer_ids),
      };
    });
    dispatch(updateLocations(dict));
  }
}

export async function refetchLocationCities(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchLocationCities();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Location: Cities Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Location: Cities data"} />,
        escapable: true,
      })
    );
  } else {
    const dict: Dictionary<LocationCityData> = {};
    result.forEach((l) => {
      dict[l.id] = l;
    });
    dispatch(updateLocationCities(dict));
  }
}

export async function refetchLocationLairs(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchLocationLairs();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Location: Lairs Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Location: Lairs data"} />,
        escapable: true,
      })
    );
  } else {
    const dict: Dictionary<LocationLairData> = {};
    result.forEach((l) => {
      dict[l.id] = l;
    });
    dispatch(updateLocationLairs(dict));
  }
}

export class LocationsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchLocations(this.dispatch);
      await refetchLocationCities(this.dispatch);
      await refetchLocationLairs(this.dispatch);
    }
  }
}
