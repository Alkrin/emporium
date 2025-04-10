import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { updateSpellbooks } from "../redux/spellbooksSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchSpellbooks(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchSpellbooks();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Spellbook Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Spellbook data"} />,
      })
    );
  } else {
    dispatch(updateSpellbooks(result));
  }
}

export class SpellbooksDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchSpellbooks(this.dispatch);
    }
  }
}
