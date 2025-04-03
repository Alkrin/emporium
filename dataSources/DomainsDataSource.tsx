import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { BasicDialog } from "../components/dialogs/BasicDialog";
import { updateDomains } from "../redux/domainsSlice";

export async function refetchDomains(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchDomains();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Domain Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Domain data"} />,
      })
    );
  } else {
    dispatch(updateDomains(result));
  }
}

export class DomainsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchDomains(this.dispatch);
    }
  }
}
