import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import ServerAPI from "../serverAPI";
import { updateActivities, updateActivityOutcomes, updateExpectedOutcomes } from "../redux/activitiesSlice";

export async function refetchActivities(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchActivities();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "Activities Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch Activities data",
        },
        escapable: true,
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
        content: {
          title: "Error!",
          message: "Failed to fetch ExpectedOutcomes data",
        },
        escapable: true,
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
        content: {
          title: "Error!",
          message: "Failed to fetch ActivityOutcomes data",
        },
        escapable: true,
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
