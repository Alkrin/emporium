import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import { updateStorages } from "../redux/storageSlice";
import ServerAPI from "../serverAPI";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchStorages(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchStorages();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Storage Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Storage data"} />,
      })
    );
  } else {
    dispatch(updateStorages(result));
  }
}

export class StoragesDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchStorages(this.dispatch);
    }
  }
}
