import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { setCharacterXP } from "../../redux/charactersSlice";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData } from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import styles from "./EditXPDialog.module.scss";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  xpTotalString: string;
  xpDeltaString: string;
  saving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditXPDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      xpTotalString: props.character.xp.toString(),
      xpDeltaString: "0",
      saving: false,
    };
  }

  render(): React.ReactNode {
    const xpBonus = this.getXPBonus();
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.rowText}>{"Set Exact XP Value"}</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.xpTotalString}
            min={0}
            onChange={(e) => {
              this.setState({ xpTotalString: e.target.value });
            }}
            tabIndex={1}
            autoFocus
          />
          <div className={styles.dialogButton} onClick={this.onSetXPTotalClicked.bind(this)}>
            {"Apply"}
          </div>
        </div>
        <div className={styles.orText}>{"- or -"}</div>
        <div className={styles.row}>
          <div className={styles.rowText}>{"Add XP Value"}</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.xpDeltaString}
            min={0}
            onChange={(e) => {
              this.setState({ xpDeltaString: e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onAddXPClicked.bind(this)}>
            {"Apply"}
          </div>
        </div>

        {xpBonus > 0 && (
          <div className={styles.xpBonusReminder}>{`Don't forget your XP bonus! ${this.state.xpDeltaString} × ${
            1 + xpBonus
          } = ${Math.ceil(+this.state.xpDeltaString * (1 + xpBonus))}`}</div>
        )}
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Close"}
        </div>
      </div>
    );
  }

  private getXPBonus(): number {
    const characterClass = AllClasses[this.props.character.class_name];
    let lowestPrimeReq: number = 18;
    characterClass.primeRequisites.forEach((stat) => {
      // Ugly type-casts so we can access stats by name.
      const statValue = this.props.character[stat.toLocaleLowerCase() as keyof CharacterData] as number;
      lowestPrimeReq = Math.min(lowestPrimeReq, statValue);
    });

    if (lowestPrimeReq >= 16) {
      return 0.1;
    } else if (lowestPrimeReq >= 13) {
      return 0.05;
    } else {
      return 0;
    }
  }

  private async onSetXPTotalClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });
    const result = await ServerAPI.setXP(this.props.character.id, +this.state.xpTotalString);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setXP Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update XP.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(setCharacterXP({ characterId: this.props.character.id, xp: result.newXPValue }));
      this.props.dispatch?.(hideModal());
    }
    this.setState({ saving: false });
  }

  private async onAddXPClicked(): Promise<void> {
    if (this.state.saving) {
      return;
    }
    this.setState({ saving: true });
    const result = await ServerAPI.setXP(this.props.character.id, this.props.character.xp + +this.state.xpDeltaString);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setXP Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update XP.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(setCharacterXP({ characterId: this.props.character.id, xp: result.newXPValue }));
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

export const EditXPDialog = connect(mapStateToProps)(AEditXPDialog);
