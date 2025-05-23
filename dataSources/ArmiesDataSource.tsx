import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { ArmyData } from "../serverAPI";
import { Dictionary } from "../lib/dictionary";
import { updateArmies, updateTroopInjuries, updateTroops } from "../redux/armiesSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchArmies(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchArmies();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Army Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Army data"} />,
      })
    );
  } else {
    const dict: Dictionary<ArmyData> = {};
    result.forEach((army) => {
      dict[army.id] = army;
    });
    dispatch(updateArmies(dict));
  }
}

export async function refetchTroops(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchTroops();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Troop Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Troop data"} />,
      })
    );
  } else {
    dispatch(updateTroops(result));
  }
}

export async function refetchTroopInjuries(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchTroopInjuries();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "TroopInjury Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch TroopInjury data"} />,
      })
    );
  } else {
    dispatch(updateTroopInjuries(result));
  }
}

export class ArmiesDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchArmies(this.dispatch);
      await refetchTroops(this.dispatch);
      await refetchTroopInjuries(this.dispatch);
    }
  }
}
