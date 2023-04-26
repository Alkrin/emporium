import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { updateItems } from "../redux/itemsSlice";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";

export async function refetchItems(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchItems();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Item Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Item data",
        },
        escapable: true,
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
