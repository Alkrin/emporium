import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { updateActivities, updateActivityOutcomes, updateExpectedOutcomes } from "../redux/activitiesSlice";
import { BasicDialog } from "../components/dialogs/BasicDialog";

export async function refetchActivities(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchActivities();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Activities Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch Activities data"} />,
      })
    );
  } else {
    dispatch(updateActivities(result));
  }
}

export async function refetchExpectedOutcomes(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchExpectedOutcomes();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ExpectedOutcomes Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ExpectedOutcomes data"} />,
      })
    );
  } else {
    dispatch(updateExpectedOutcomes(result));
  }
}

export async function refetchActivityOutcomes(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchActivityOutcomes();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "ActivityOutcomes Fetch Error",
        content: () => <BasicDialog title={"Error!"} prompt={"Failed to fetch ActivityOutcomes data"} />,
      })
    );
  } else {
    dispatch(updateActivityOutcomes(result));
  }
}

export class ActivitiesDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchActivities(this.dispatch);
      await refetchActivityOutcomes(this.dispatch);
      await refetchExpectedOutcomes(this.dispatch);
    }
  }
}
