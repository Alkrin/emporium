import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { CharacterData, StorageData } from "../../serverAPI";
import styles from "./EditCostOfLivingDialog.module.scss";
import dateFormat from "dateformat";
import {
  getApparentLevelForCharacter,
  getCostOfLivingForCharacterLevel,
  getMaintenanceStatusForCharacter,
} from "../../lib/characterUtils";
import { InfoButton } from "../InfoButton";
import { EditButton } from "../EditButton";
import { SelectStorageDialog } from "../dialogs/SelectStorageDialog";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { Dictionary } from "../../lib/dictionary";
import { SavingVeil } from "../SavingVeil";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { showToaster } from "../../redux/toastersSlice";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  sourceStorageId: number;
  gpToPayString: string;
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allStorages: Dictionary<StorageData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditCostOfLivingDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sourceStorageId: 0,
      gpToPayString: "0",
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const maintenanceStatus = getMaintenanceStatusForCharacter(this.props.character.id);

    return (
      <div className={styles.root}>
        <div className={styles.characterName}>{this.props.character.name}</div>
        <div className={styles.infoPanel}>
          <div className={styles.row}>
            <div className={styles.normalText}>{`L${this.props.character.level} Cost of Living:\xa0`}</div>
            <div className={styles.valueText}>{`${getCostOfLivingForCharacterLevel(
              this.props.character.level
            )}gp`}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.normalText}>{`Amount Paid:\xa0`}</div>
            <div className={styles.valueText}>{`${this.props.character.maintenance_paid.toFixed(2)}gp`}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.normalText}>{`${dateFormat(new Date(), "mmm yyyy")} Status:\xa0`}</div>
            <div className={`${styles.maintenanceStatus} ${styles[maintenanceStatus]}`}>{maintenanceStatus}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.normalText}>{`Apparent Character Level:\xa0`}</div>
            <div className={styles.valueText}>{getApparentLevelForCharacter(this.props.character.id)}</div>
            <InfoButton
              className={styles.infoButton}
              tooltipParams={{
                id: "ApparentLevel",
                content: () => {
                  return (
                    <div className={styles.explanationText}>
                      {"NPCs determine a character's level by seeing how much money they spend.  " +
                        "If you spend more, they will think you are higher level.  " +
                        "If you spend less, they will assume you are lower level.  " +
                        "This influences Morale and recruiting rolls."}
                    </div>
                  );
                },
              }}
            />
          </div>
        </div>
        <div className={styles.promptTitle}>{"Make a Payment?"}</div>
        <div className={styles.row}>
          <div className={styles.normalText}>{"Source:\xa0"}</div>
          <div className={styles.valueText}>{getStorageDisplayName(this.state.sourceStorageId)}</div>
          <EditButton className={styles.infoButton} onClick={this.onSelectMoneySourceClicked.bind(this)} />
        </div>
        <div className={styles.row}>
          <div className={styles.normalText}>{`Available:\xa0`}</div>
          <div className={styles.valueText}>{`${
            this.props.allStorages[this.state.sourceStorageId]?.money ?? "--- "
          }gp`}</div>
        </div>

        <div className={styles.row}>
          <div className={styles.rowText}>GP to Pay</div>
          <input
            className={styles.gpTextField}
            type={"number"}
            value={this.state.gpToPayString}
            onChange={(e) => {
              this.setState({ gpToPayString: e.target.value });
            }}
            tabIndex={2}
          />
          <div className={styles.dialogButton} onClick={this.onPayClicked.bind(this)}>
            Pay
          </div>
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Close
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private async onPayClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    if (
      +this.state.gpToPayString <= 0 || // No/negative payment?
      this.state.sourceStorageId === 0 || // No money source?
      +this.state.gpToPayString > this.props.allStorages[this.state.sourceStorageId].money // Not enough money?
    ) {
      this.props.dispatch?.(
        showModal({
          id: "payCharacterMaintenanceInvalid",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"You must select a payment source and a valid payment amount!"} />
          ),
          escapable: true,
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    const result = await ServerAPI.payCharacterMaintenance(
      this.props.character.id,
      this.state.sourceStorageId,
      +this.state.gpToPayString
    );

    if ("error" in result || result.find((r) => "error" in r)) {
      this.props.dispatch?.(
        showModal({
          id: "payCharacterMaintenanceError",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to make the payment.  Please check your network connection and try again."}
            />
          ),
          escapable: true,
        })
      );
    } else if (this.props.dispatch) {
      await refetchCharacters(this.props.dispatch);
      await refetchStorages(this.props.dispatch);
      this.setState({ gpToPayString: "0" });
      this.props.dispatch(
        showToaster({
          content: {
            title: "Payment Applied!",
            message: "",
          },
        })
      );
    }

    this.setState({ isSaving: false });
  }

  private onSelectMoneySourceClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "moneySourceEdit",
        content: () => {
          return (
            <SelectStorageDialog
              preselectedStorageId={this.state.sourceStorageId}
              onSelectionConfirmed={async (sourceStorageId: number) => {
                this.setState({ sourceStorageId });
              }}
              focusedCharacterId={this.props.character.id}
            />
          );
        },
        escapable: true,
      })
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const { allStorages } = state.storages;
  return {
    ...props,
    character,
    allStorages,
  };
}

export const EditCostOfLivingDialog = connect(mapStateToProps)(AEditCostOfLivingDialog);
