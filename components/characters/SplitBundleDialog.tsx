import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { ItemData, ItemDefData } from "../../serverAPI";
import styles from "./SplitBundleDialog.module.scss";
import { showToaster } from "../../redux/toastersSlice";
import { updateItem } from "../../redux/itemsSlice";

interface State {
  bundleCount: number;
  newBundleCount: number;
  isSaving: boolean;
}

interface ReactProps {
  item: ItemData;
  def: ItemDefData;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASplitBundleDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      bundleCount: props.item.count - 1,
      newBundleCount: 1,
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.rowText}>Original Bundle</div>
          <input
            className={styles.bundleTextField}
            type={"number"}
            value={this.state.bundleCount}
            max={this.props.item.count - 1}
            min={1}
            onChange={(e) => {
              this.setState({ bundleCount: +e.target.value, newBundleCount: this.props.item.count - +e.target.value });
            }}
            onBlur={this.fixBundleCounts.bind(this)}
            tabIndex={1}
            autoFocus
          />
        </div>
        <div className={styles.row}>
          <div className={styles.rowText}>New Bundle</div>
          <input
            className={styles.bundleTextField}
            type={"number"}
            value={this.state.newBundleCount}
            max={this.props.item.count - 1}
            min={1}
            onChange={(e) => {
              this.setState({ newBundleCount: +e.target.value, bundleCount: this.props.item.count - +e.target.value });
            }}
            onBlur={this.fixBundleCounts.bind(this)}
            tabIndex={2}
          />
        </div>
        <div className={styles.actionButton} onClick={this.onSplitClicked.bind(this)} tabIndex={3}>
          Split
        </div>
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)} tabIndex={4}>
          Close
        </div>
      </div>
    );
  }

  private fixBundleCounts(): void {
    if (this.state.bundleCount < 1) {
      this.setState({ bundleCount: 1, newBundleCount: this.props.item.count - 1 });
    } else if (this.state.bundleCount >= this.props.item.count) {
      this.setState({ newBundleCount: 1, bundleCount: this.props.item.count - 1 });
    }
  }

  private async onSplitClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    const result = await ServerAPI.splitBundleItems(
      this.props.item,
      this.props.item.container_id,
      this.props.item.storage_id,
      this.state.newBundleCount,
      this.props.def.id
    );
    if ("error" in result) {
      this.showServerErrorToaster(result.error);
    } else if (result.length !== 2) {
      this.showServerErrorToaster("Invalid server response size.");
    } else if ("error" in result[0]) {
      this.showServerErrorToaster(result[0].error);
    } else if ("error" in result[1]) {
      this.showServerErrorToaster(result[1].error);
    } else {
      if (this.props.dispatch && "insertId" in result[1]) {
        // Remove the items that were split off.
        this.props.dispatch(updateItem({ ...this.props.item, count: this.state.bundleCount }));
        // Generate a brand new item bundle in the same container/storage with the returned id.
        this.props.dispatch(
          updateItem({
            def_id: this.props.item.def_id,
            count: this.state.newBundleCount,
            id: result[1].insertId,
            storage_id: this.props.item.storage_id,
            container_id: this.props.item.container_id,
            notes: this.props.item.notes,
            is_for_sale: this.props.item.is_for_sale,
            owner_ids: [...this.props.item.owner_ids],
            is_unused: this.props.item.is_unused,
          })
        );
        this.props.dispatch?.(hideModal());
      } else {
        this.showServerErrorToaster("Unexpected bundle creation response.");
      }
    }
    this.setState({ isSaving: false });
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private showServerErrorToaster(errorText: string): void {
    this.props.dispatch?.(
      showToaster({
        id: "ServerError",
        content: { title: "Server Error", message: errorText },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SplitBundleDialog = connect(mapStateToProps)(ASplitBundleDialog);
