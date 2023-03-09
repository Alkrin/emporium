import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import ExternalDataSource from "../redux/externalDataSource";
import { showModal } from "../redux/modalsSlice";
import { updateUser } from "../redux/userSlice";
import ServerAPI from "../serverAPI";

export async function refetchUsers(dispatch: Dispatch): Promise<void> {
  const result = await ServerAPI.fetchUsers();

  if ("error" in result) {
    dispatch(
      showModal({
        id: "User Fetch Error",
        content: {
          title: "Error!",
          message: "Failed to fetch User data",
        },
        escapable: true,
      })
    );
  } else {
    result.forEach((user) => {
      dispatch(updateUser(user));
    });
  }
}

export class UsersDataSource extends ExternalDataSource {
  async componentDidMount(): Promise<void> {
    if (this.dispatch) {
      await refetchUsers(this.dispatch);
    }
  }
}
