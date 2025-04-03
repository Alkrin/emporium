import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { LocationData } from "../serverAPI";
import { updateLocations } from "../redux/locationsSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchLocations(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchLocations();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Location Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Location data"} />,
      })
    );
  } else {
    const dict: Record<number, LocationData> = {};
    result.forEach((l) => {
      dict[l.id] = l;
    });
    dispatch(updateLocations(dict));
  }
}

export class LocationsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchLocations(this.dispatch);
    }
  }
}
