import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { ContractData } from "../serverAPI";
import { Dictionary } from "../lib/dictionary";
import { updateContracts } from "../redux/contractsSlice";

export async function refetchContracts(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchContracts();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Contract Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Contract data",
        },
        escapable: true,
      })
    );
  } else {
    const dict: Dictionary<ContractData> = {};
    result.forEach((army) => {
      dict[army.id] = army;
    });
    dispatch(updateContracts(dict));
  }
}

export class ContractsDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchContracts(this.dispatch);
    }
  }
}
