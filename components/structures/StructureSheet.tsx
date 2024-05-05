import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import ServerAPI, {
  ContractData,
  LocationData,
  StructureComponentData,
  StructureComponentDefData,
  StructureData,
} from "../../serverAPI";
import styles from "./StructureSheet.module.scss";
import { FittingView } from "../FittingView";
import { EditButton } from "../EditButton";
import { showModal } from "../../redux/modalsSlice";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { Dictionary } from "../../lib/dictionary";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { CreateStructureComponentSubPanel } from "./CreateStructureComponentSubPanel";
import { EditStructureComponentSubPanel } from "./EditStructureComponentSubPanel";
import { SheetRoot } from "../SheetRoot";
import {
  getMaintenanceStatusForStructure,
  getStructureMonthlyMaintenance,
  getStructureValue,
} from "../../lib/structureUtils";
import { updateStructure } from "../../redux/structuresSlice";
import dateFormat from "dateformat";
import { PayStructureMaintenanceDialog } from "./PayStructureMaintenanceDialog";
import { ContractId } from "../../redux/gameDefsSlice";
import { EditStructureMaintenanceContractDialog } from "./EditStructureMaintenanceContractDialog";

interface ReactProps {
  structureId: number;
  exiting: boolean;
}

interface InjectedProps {
  structure: StructureData;
  components: StructureComponentData[];
  componentDefs: Dictionary<StructureComponentDefData>;
  location: LocationData;
  contract: ContractData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AStructureSheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    const structureExists = this.props.structureId > 0 && !!this.props.structure;

    return (
      <SheetRoot className={`${styles.root} ${animationClass}`}>
        {structureExists ? (
          <>
            <div className={styles.topPanel}>
              <FittingView className={styles.nameContainer}>
                <div className={styles.nameLabel}>{this.props.structure.name}</div>
              </FittingView>
              <div className={styles.descriptionLabel}>{this.props.structure.description}</div>
            </div>
            {this.renderSummary()}
            <div className={styles.componentsPanel}>
              <div className={styles.componentsLabel}>{"Components"}</div>
              <EditButton className={styles.editButton} onClick={this.onCreateComponentClicked.bind(this)} />
            </div>
            <div className={styles.listContainer}>
              {this.getSortedComponents().map(this.renderComponentRow.bind(this))}
            </div>
          </>
        ) : (
          <div className={styles.placeholder} />
        )}
      </SheetRoot>
    );
  }

  private renderSummary(): React.ReactNode {
    const maintenanceStatus = getMaintenanceStatusForStructure(this.props.structureId);
    return (
      <div className={styles.summaryRoot}>
        <div className={styles.row}>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Location:\xa0`}</div>
            <div className={styles.valueText}>{this.props.location?.name ?? "---"}</div>
            <EditButton className={styles.editButton} onClick={this.onEditLocationClicked.bind(this)} />
          </div>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Monthly Maintenance:\xa0`}</div>
            <div className={styles.valueText}>
              {getStructureMonthlyMaintenance(this.props.structureId).toFixed(2)}gp
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Value:\xa0`}</div>
            <div className={styles.valueText}>{getStructureValue(this.props.structureId).toFixed(2)}gp</div>
          </div>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`${dateFormat(new Date(), "mmmm yyyy")} Fees:\xa0`}</div>
            <div className={`${styles.maintenanceStatus} ${styles[maintenanceStatus]}`}>{maintenanceStatus}</div>
            <EditButton className={styles.editButton} onClick={this.onPayMaintenanceClicked.bind(this)} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.halfWidth}></div>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Contract:\xa0`}</div>
            <div className={styles.valueText}>{this.props.contract ? "Active" : "---"}</div>
            <EditButton className={styles.editButton} onClick={this.onEditContractClicked.bind(this)} />
          </div>
        </div>
      </div>
    );
  }

  private renderComponentRow(component: StructureComponentData, index: number): React.ReactNode {
    const def = this.props.componentDefs[component.component_id];
    return (
      <div className={styles.listRow} key={index}>
        <div className={styles.leftRow}>
          <div className={styles.listCount}>{component.quantity.toFixed(2)}×</div>
          <div className={styles.listName}>{def.name}</div>
          <EditButton
            className={styles.editButton}
            onClick={() => {
              this.props.dispatch?.(
                showSubPanel({
                  id: "EditStructureComponent",
                  content: () => {
                    return <EditStructureComponentSubPanel component={component} />;
                  },
                })
              );
            }}
          />
        </div>
        <div className={styles.leftRow}>
          <div className={styles.listHalf}>
            <div className={styles.listField}>{"Value:"}</div>
            <div className={styles.listValue}>{`${(component.quantity * def.cost).toFixed(2)}gp`}</div>
          </div>
          <div className={styles.listHalf}>
            <div className={styles.listField}>{"Monthly Maintenance:"}</div>
            <div className={styles.listValue}>{`${(component.quantity * def.cost * 0.005).toFixed(2)}gp`}</div>
          </div>
        </div>
      </div>
    );
  }

  private onPayMaintenanceClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "payMaintenance",
        content: () => {
          return <PayStructureMaintenanceDialog />;
        },
        escapable: true,
      })
    );
  }

  private getSortedComponents(): StructureComponentData[] {
    const components = [...this.props.components];

    components.sort((componentA, componentB) => {
      const nameA = this.props.componentDefs[componentA.component_id].name;
      const nameB = this.props.componentDefs[componentB.component_id].name;
      return nameA.localeCompare(nameB);
    });

    return components;
  }

  private onCreateComponentClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateComponent",
        content: () => {
          return <CreateStructureComponentSubPanel structureId={this.props.structureId} />;
        },
      })
    );
  }

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        widthVmin: 61,
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.props.structure.location_id}
              onSelectionConfirmed={async (location_id) => {
                const newStructure: StructureData = { ...this.props.structure, location_id };
                const res = await ServerAPI.editStructure(newStructure);
                if ("error" in res) {
                  // Error modal.
                  this.props.dispatch?.(
                    showModal({
                      id: "EditStructureError",
                      content: {
                        title: "Error",
                        message: "An Error occurred while attempting to change structure location.",
                      },
                    })
                  );
                } else {
                  // Successfully updated on the server, so update it locally too.
                  this.props.dispatch?.(updateStructure(newStructure));
                }
              }}
            />
          );
        },
      })
    );
  }

  private onEditContractClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditContract",
        content: () => {
          return (
            <EditStructureMaintenanceContractDialog
              contract={this.props.contract}
              structureId={this.props.structureId}
            />
          );
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const structure = state.structures.structures[props.structureId];
  const location = state.locations.locations[structure?.location_id];
  const components = state.structures.componentsByStructure[structure?.id] ?? [];
  const componentDefs = state.gameDefs.structureComponents;
  const contract =
    state.contracts.contractsByDefByPartyBId[ContractId.StructureMaintenanceContract]?.[props.structureId]?.[0];
  return {
    ...props,
    structure,
    components,
    location,
    componentDefs,
    contract,
  };
}

export const StructureSheet = connect(mapStateToProps)(AStructureSheet);
