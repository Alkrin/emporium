import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { updateRepertoires } from "../redux/repertoiresSlice";

export async function refetchRepertoires(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchRepertoires();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Repertoire Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Repertoire data",
        },
        escapable: true,
      })
    );
  } else {
    dispatch(updateRepertoires(result));
  }
}

export class RepertoiresDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchRepertoires(this.dispatch);
    }
  }
}
