import * as React from "react";
import { authLocalStore } from "../localStores/authLocalStore";
import ExternalDataSource from "../redux/externalDataSource";
import { setLastAuthedUserName } from "../redux/userSlice";

export class LocalStorageDataSource extends ExternalDataSource {
  componentDidMount(): void {
    // It may seem a little silly to push localStorage into Redux, but the goal is
    // to ensure that we consistently rely on Redux as the source of truth for the
    // UI, since Redux automatically triggers re-renders when data changes.
    const prevPlayer = authLocalStore.getLastAuthedPlayerName();
    this.dispatch?.(setLastAuthedUserName(prevPlayer));
  }
}
