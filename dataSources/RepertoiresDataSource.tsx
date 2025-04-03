import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { updateRepertoires } from "../redux/repertoiresSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchRepertoires(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchRepertoires();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Repertoire Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Repertoire data"} />,
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
