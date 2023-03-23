import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { updateCharacter } from "../redux/charactersSlice";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import { updateProficiencies } from "../redux/proficienciesSlice";
import ServerAPI from "../serverAPI";

export async function refetchProficiencies(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchProficiencies();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Proficiency Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Proficiency data",
        },
        escapable: true,
      })
    );
  } else {
    dispatch(updateProficiencies(result));
  }
}

export class ProficienciesDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchProficiencies(this.dispatch);
    }
  }
}
