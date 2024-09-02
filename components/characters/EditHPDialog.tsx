import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { setCharacterHP } from "../../redux/charactersSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData } from "../../serverAPI";
import styles from "./EditHPDialog.module.scss";
import { getCharacterMaxHP } from "../../lib/characterUtils";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  hpTotal: number;
  hpDelta: number;
  saving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditHPDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hpTotal: -1,
      hpDelta: 0,
      saving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.rowText}>Set Exact HP Value</div>
          <input
            className={styles.hpTextField}
            type={"number"}
            value={this.state.hpTotal}
            max={getCharacterMaxHP(this.props.character)}
            onChange={(e) => {
              this.setState({ hpTotal: +e.target.value });
            }}
            tabIndex={1}
            autoFocus
          />
          <div className={styles.dialogButton} onClick={this.onSetHPTotalClicked.bind(this)}>
            Apply
          </div>
        </div>
        <div className={styles.orText}>- or -</div>
        <div className={styles.row}>
          <div className={styles.rowText}>Add HP Value</div>
          <input
            className={styles.hpTextField}
            type={"number"}
            value={this.state.hpDelta}
            onChange={(e) => {
              this.setState({ hpDelta: +e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onAddHPClicked.bind(this)}>
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
    this.setState({ hpTotal: this.props.character.hp });
  }

  private async onSetHPTotalClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });
    const result = await ServerAPI.setHP(this.props.character.id, this.state.hpTotal);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setHP Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update HP.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(setCharacterHP({ characterId: this.props.character.id, hp: result.newHPValue }));
      this.props.dispatch?.(hideModal());
    }
    this.setState({ saving: false });
  }

  private async onAddHPClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });
    const result = await ServerAPI.setHP(
      this.props.character.id,
      Math.min(this.props.character.hp + this.state.hpDelta, getCharacterMaxHP(this.props.character))
    );

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setHP Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update HP.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(setCharacterHP({ characterId: this.props.character.id, hp: result.newHPValue }));
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

export const EditHPDialog = connect(mapStateToProps)(AEditHPDialog);
