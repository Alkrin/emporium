import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { StorageData } from "../../serverAPI";
import styles from "./EditMoneyDialog.module.scss";
import { updateStorage } from "../../redux/storageSlice";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  gpTotalString: string;
  gpDeltaString: string;
  saving: boolean;
}

interface ReactProps {
  storageId: number;
}

interface InjectedProps {
  storage: StorageData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditMoneyDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      gpTotalString: (props.storage?.money ?? 0).toFixed(2),
      gpDeltaString: (0).toFixed(2),
      saving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.storageName}>{getStorageDisplayName(this.props.storageId)}</div>
        <div className={styles.row}>
          <div className={styles.rowText}>Set Exact GP Value</div>
          <input
            className={styles.gpTextField}
            type={"number"}
            value={this.state.gpTotalString}
            onChange={(e) => {
              this.setState({ gpTotalString: e.target.value });
            }}
            tabIndex={1}
            autoFocus
          />
          <div className={styles.dialogButton} onClick={this.onSetMoneyTotalClicked.bind(this)}>
            Apply
          </div>
        </div>
        <div className={styles.orText}>- or -</div>
        <div className={styles.row}>
          <div className={styles.rowText}>Add GP Value</div>
          <input
            className={styles.gpTextField}
            type={"number"}
            value={this.state.gpDeltaString}
            onChange={(e) => {
              this.setState({ gpDeltaString: e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onAddMoneyClicked.bind(this)}>
            Apply
          </div>
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
      </div>
    );
  }

  private async onSetMoneyTotalClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });

    const result = await ServerAPI.setMoney(this.props.storage.id, +this.state.gpTotalString);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setMoney Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update money.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      const data: StorageData = {
        ...this.props.storage,
        money: result.newMoneyValue,
      };
      this.props.dispatch?.(updateStorage(data));
      this.props.dispatch?.(hideModal());
    }
    this.setState({ saving: false });
  }

  private async onAddMoneyClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });

    const result = await ServerAPI.setMoney(
      this.props.storage.id,
      // It is possible to have negative money, for bookkeeping purposes.
      this.props.storage.money + +this.state.gpDeltaString
    );

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setMoney Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update money.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      const data: StorageData = {
        ...this.props.storage,
        money: result.newMoneyValue,
      };
      this.props.dispatch?.(updateStorage(data));
      this.props.dispatch?.(hideModal());
    }
    this.setState({ saving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const storage = state.storages.allStorages[props.storageId];
  return {
    ...props,
    storage,
  };
}

export const EditMoneyDialog = connect(mapStateToProps)(AEditMoneyDialog);
