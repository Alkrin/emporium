import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { updateItems } from "../redux/itemsSlice";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchItems(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchItems();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Item Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Item data"} />,
      })
    );
  } else {
    dispatch(updateItems(result));
  }
}

export class ItemsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchItems(this.dispatch);
    }
  }
}
