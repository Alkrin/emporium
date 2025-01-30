import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { setCharacterHP, setCharacterRemainingCXPDeductible } from "../../../redux/charactersSlice";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { RootState } from "../../../redux/store";
import ServerAPI, { CharacterData } from "../../../serverAPI";
import styles from "./EditCXPDeductibleDialog.module.scss";
import {
  addCommasToNumber,
  getCXPDeductibleRemainingForCharacter,
  getCampaignXPDeductibleCapForLevel,
  getCharacterMaxHP,
} from "../../../lib/characterUtils";
import { BasicDialog } from "../../dialogs/BasicDialog";

interface State {
  deductiblePaidString: string;
  deductibleRemainingString: string;
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditCXPDeductibleDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      deductiblePaidString: "0",
      deductibleRemainingString: "0",
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const maxDeductible = getCampaignXPDeductibleCapForLevel(this.props.character.level);
    return (
      <div className={styles.root}>
        <div className={styles.title}>{`L${this.props.character.level} CXP Deductible: ${addCommasToNumber(
          maxDeductible
        )}`}</div>
        <div className={styles.row}>
          <div className={styles.rowText}>Set Deductible Paid</div>
          <input
            className={styles.textField}
            type={"number"}
            value={this.state.deductiblePaidString}
            max={getCharacterMaxHP(this.props.character)}
            onChange={(e) => {
              this.setState({ deductiblePaidString: e.target.value });
            }}
            tabIndex={1}
            autoFocus
          />
          <div className={styles.dialogButton} onClick={this.onSetDeductiblePaidClicked.bind(this)}>
            Apply
          </div>
        </div>
        <div className={styles.orText}>- or -</div>
        <div className={styles.row}>
          <div className={styles.rowText}>Set Deductible Remaining</div>
          <input
            className={styles.textField}
            type={"number"}
            value={this.state.deductibleRemainingString}
            onChange={(e) => {
              this.setState({ deductibleRemainingString: e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onSetDeductibleRemainingClicked.bind(this)}>
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
    const maxDeductible = getCampaignXPDeductibleCapForLevel(this.props.character.level);
    const deductibleRemaining = getCXPDeductibleRemainingForCharacter(this.props.character.id);

    this.setState({
      deductiblePaidString: `${maxDeductible - deductibleRemaining}`,
      deductibleRemainingString: `${deductibleRemaining}`,
    });
  }

  private async onSetDeductiblePaidClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // Validate the input.
    const maxDeductible = getCampaignXPDeductibleCapForLevel(this.props.character.level);
    const deductiblePaid = +this.state.deductiblePaidString;
    if (deductiblePaid < 0 || deductiblePaid > maxDeductible) {
      this.props.dispatch?.(
        showModal({
          id: "setDeductible Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={`The deductible paid amount must be between 0 and ${maxDeductible}.  Please enter a valid value.`}
            />
          ),
          escapable: true,
        })
      );
      return;
    }

    this.setState({ isSaving: true });
    const result = await ServerAPI.setCharacterRemainingCXPDeductible(
      this.props.character.id,
      maxDeductible - deductiblePaid
    );

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setDeductible Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update CXP Deductible.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(
        setCharacterRemainingCXPDeductible({
          characterId: this.props.character.id,
          remainingCXPDeductible: maxDeductible - deductiblePaid,
        })
      );
      this.props.dispatch?.(hideModal());
    }
    this.setState({ isSaving: false });
  }

  private async onSetDeductibleRemainingClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // Validate the input.
    const maxDeductible = getCampaignXPDeductibleCapForLevel(this.props.character.level);
    const deductibleRemaining = +this.state.deductibleRemainingString;
    if (deductibleRemaining < 0 || deductibleRemaining > maxDeductible) {
      this.props.dispatch?.(
        showModal({
          id: "setDeductible Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={`The deductible remaining amount must be between 0 and ${maxDeductible}.  Please enter a valid value.`}
            />
          ),
          escapable: true,
        })
      );
      return;
    }

    this.setState({ isSaving: true });
    const result = await ServerAPI.setCharacterRemainingCXPDeductible(this.props.character.id, deductibleRemaining);

    if ("error" in result) {
      this.props.dispatch?.(
        showModal({
          id: "setDeductible Error",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update CXP Deductible.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else {
      this.props.dispatch?.(
        setCharacterRemainingCXPDeductible({
          characterId: this.props.character.id,
          remainingCXPDeductible: deductibleRemaining,
        })
      );
      this.props.dispatch?.(hideModal());
    }
    this.setState({ isSaving: false });
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

export const EditCXPDeductibleDialog = connect(mapStateToProps)(AEditCXPDeductibleDialog);
