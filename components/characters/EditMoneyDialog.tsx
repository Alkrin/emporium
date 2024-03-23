import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData, StorageData } from "../../serverAPI";
import styles from "./EditMoneyDialog.module.scss";
import { getPersonalPile } from "../../lib/characterUtils";
import { updateStorage } from "../../redux/storageSlice";

interface State {
  gpTotal: number;
  gpDelta: number;
  saving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditMoneyDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      gpTotal: -1,
      gpDelta: 0,
      saving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.rowText}>Set Exact GP Value</div>
          <input
            className={styles.gpTextField}
            type={"number"}
            value={this.state.gpTotal}
            onChange={(e) => {
              this.setState({ gpTotal: +e.target.value });
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
            value={this.state.gpDelta}
            onChange={(e) => {
              this.setState({ gpDelta: +e.target.value });
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

  componentDidMount(): void {
    this.setState({ gpTotal: getPersonalPile(this.props.character.id).money });
  }

  private async onSetMoneyTotalClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });

    const personalPile = getPersonalPile(this.props.character.id);

    const result = await ServerAPI.setMoney(personalPile.id, this.state.gpTotal);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setMoney Error",
          content: {
            title: "Error!",
            message: "Failed to update money.  Please check your network connection and try again.",
          },
          escapable: true,
        })
      );
    } else {
      const data: StorageData = {
        ...getPersonalPile(this.props.character.id),
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

    const personalPile = getPersonalPile(this.props.character.id);

    const result = await ServerAPI.setMoney(
      personalPile.id,
      // It is possible to have negative money, for bookkeeping purposes.
      personalPile.money + this.state.gpDelta
    );

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setMoney Error",
          content: {
            title: "Error!",
            message: "Failed to update money.  Please check your network connection and try again.",
          },
          escapable: true,
        })
      );
    } else {
      const data: StorageData = {
        ...getPersonalPile(this.props.character.id),
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
  const character = state.characters.characters[state.characters.activeCharacterId];
  return {
    ...props,
    character,
  };
}

export const EditMoneyDialog = connect(mapStateToProps)(AEditMoneyDialog);
