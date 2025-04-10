import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI, { StructureData } from "../serverAPI";
import { Dictionary } from "../lib/dictionary";
import { updateStructureComponents, updateStructures } from "../redux/structuresSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchStructures(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchStructures();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Structure Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Structure data"} />,
      })
    );
  } else {
    const dict: Dictionary<StructureData> = {};
    result.forEach((structure) => {
      dict[structure.id] = structure;
    });
    dispatch(updateStructures(dict));
  }
}

export async function refetchStructureComponents(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchStructureComponents();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "StructureComponent Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch StructureComponent data"} />,
      })
    );
  } else {
    dispatch(updateStructureComponents(result));
  }
}

export class StructuresDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchStructures(this.dispatch);
      await refetchStructureComponents(this.dispatch);
    }
  }
}
