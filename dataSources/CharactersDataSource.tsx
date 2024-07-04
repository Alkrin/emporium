import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { updateCharacters } from "../redux/charactersSlice";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";

export async function refetchCharacters(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchCharacters();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Character Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Character data",
        },
        escapable: true,
      })
    );
  } else {
    dispatch(updateCharacters(result));
  }
}

export class CharactersDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchCharacters(this.dispatch);
    }
  }
}
