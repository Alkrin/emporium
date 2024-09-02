import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { StorageData, StructureData } from "../../serverAPI";
import styles from "./PayStructureMaintenanceDialog.module.scss";
import dateFormat from "dateformat";
import { EditButton } from "../EditButton";
import { SelectStorageDialog } from "../dialogs/SelectStorageDialog";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { Dictionary } from "../../lib/dictionary";
import { SavingVeil } from "../SavingVeil";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { showToaster } from "../../redux/toastersSlice";
import { getMaintenanceStatusForStructure, getStructureMonthlyMaintenance } from "../../lib/structureUtils";
import { refetchStructures } from "../../dataSources/StructuresDataSource";
import { MaintenanceStatus } from "../../lib/characterUtils";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  sourceStorageId: number;
  gpToPayString: string;
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  structure: StructureData;
  allStorages: Dictionary<StorageData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class APayStructureMaintenanceDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sourceStorageId: 0,
      gpToPayString: getStructureMonthlyMaintenance(props.structure.id).toFixed(2),
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const maintenanceStatus = getMaintenanceStatusForStructure(this.props.structure.id);

    return (
      <div className={styles.root}>
        <div className={styles.structureName}>{this.props.structure.name}</div>
        <div className={styles.infoPanel}>
          <div className={styles.row}>
            <div className={styles.normalText}>{`Monthly Maintenance:\xa0`}</div>
            <div className={styles.valueText}>{`${getStructureMonthlyMaintenance(this.props.structure.id)}gp`}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.normalText}>{`${dateFormat(new Date(), "mmm yyyy")} Status:\xa0`}</div>
            <div className={`${styles.maintenanceStatus} ${styles[maintenanceStatus]}`}>{maintenanceStatus}</div>
          </div>
        </div>
        {maintenanceStatus !== MaintenanceStatus.Paid && (
          <>
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
              <input className={styles.gpTextField} type={"number"} value={this.state.gpToPayString} disabled={true} />
              <div className={styles.dialogButton} onClick={this.onPayClicked.bind(this)}>
                Pay
              </div>
            </div>
          </>
        )}

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
          id: "payStructureMaintenanceInvalid",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"You must select a payment source and a valid payment amount!"} />
          ),
          escapable: true,
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    const result = await ServerAPI.payStructureMaintenance(
      this.props.structure.id,
      this.state.sourceStorageId,
      +this.state.gpToPayString
    );

    if ("error" in result || result.find((r) => "error" in r)) {
      this.props.dispatch?.(
        showModal({
          id: "payStructureMaintenanceError",
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
      await refetchStructures(this.props.dispatch);
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
  const structure = state.structures.structures[state.structures.activeStructureId];
  const { allStorages } = state.storages;
  return {
    ...props,
    structure,
    allStorages,
  };
}

export const PayStructureMaintenanceDialog = connect(mapStateToProps)(APayStructureMaintenanceDialog);
