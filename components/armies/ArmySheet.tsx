import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import ServerAPI, { ArmyData, LocationData, TroopData, TroopDefData, TroopInjuryData } from "../../serverAPI";
import styles from "./ArmySheet.module.scss";
import { FittingView } from "../FittingView";
import { EditButton } from "../EditButton";
import { showModal } from "../../redux/modalsSlice";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { updateArmy } from "../../redux/armiesSlice";
import { Dictionary } from "../../lib/dictionary";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { CreateTroopSubPanel } from "./CreateTroopSubPanel";
import { EditTroopSubPanel } from "./EditTroopSubPanel";
import {
  getArmyAvailableBattleRating,
  getArmyLowestSpeed,
  getArmyTotalBattleRating,
  getArmyTotalWages,
  getTroopAvailableBattleRating,
  getTroopTotalBattleRating,
} from "../../lib/armyUtils";

interface ReactProps {
  armyId: number;
  exiting: boolean;
}

interface InjectedProps {
  army: ArmyData;
  troops: TroopData[];
  injuries: Dictionary<TroopInjuryData[]>;
  location: LocationData;
  troopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AArmySheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    const armyExists = this.props.armyId > 0 && !!this.props.army;

    return (
      <div className={`${styles.root} ${animationClass}`}>
        {armyExists ? (
          <>
            <div className={styles.topPanel}>
              <FittingView className={styles.nameContainer}>
                <div className={styles.nameLabel}>{this.props.army.name}</div>
              </FittingView>
            </div>
            {this.renderSummary()}
            <div className={styles.troopsPanel}>
              <div className={styles.troopsLabel}>{"Troops"}</div>
              <EditButton className={styles.editButton} onClick={this.onCreateTroopClicked.bind(this)} />
            </div>
            <div className={styles.listContainer}>{this.getSortedTroops().map(this.renderTroopRow.bind(this))}</div>
          </>
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
    );
  }

  private renderSummary(): React.ReactNode {
    return (
      <div className={styles.summaryRoot}>
        <div className={styles.row}>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Location:\xa0`}</div>
            <div className={styles.valueText}>{this.props.location?.name ?? "---"}</div>
            <EditButton className={styles.editButton} onClick={this.onEditLocationClicked.bind(this)} />
          </div>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Battle Rating:\xa0`}</div>
            <div className={styles.valueText}>
              {`${getArmyAvailableBattleRating(this.props.armyId).toFixed(2)} / ${getArmyTotalBattleRating(
                this.props.armyId
              ).toFixed(2)}`}
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Movement:\xa0`}</div>
            <div className={styles.valueText}>{`${getArmyLowestSpeed(this.props.armyId)}' / ${
              getArmyLowestSpeed(this.props.armyId) / 5
            } miles`}</div>
          </div>
          <div className={styles.halfWidth}>
            <div className={styles.normalText}>{`Total Wages:\xa0`}</div>
            <div className={styles.valueText}>{getArmyTotalWages(this.props.armyId)}gp</div>
          </div>
        </div>
      </div>
    );
  }

  private renderTroopRow(troop: TroopData, index: number): React.ReactNode {
    const def = this.props.troopDefs[troop.def_id];
    return (
      <div className={styles.listRow} key={index}>
        <div className={styles.leftRow}>
          <div className={styles.listCount}>{troop.count}×</div>
          <div className={styles.listName}>{def.name}</div>
          <EditButton
            onClick={() => {
              this.props.dispatch?.(
                showSubPanel({
                  id: "EditTroop",
                  content: () => {
                    return <EditTroopSubPanel troop={troop} />;
                  },
                })
              );
            }}
          />
        </div>
        <div className={styles.leftRow}>
          <div className={styles.listThird}>
            <div className={styles.listField}>{"Battle Rating:"}</div>
            <div className={styles.listValue}>{`${getTroopAvailableBattleRating(troop).toFixed(
              2
            )} / ${getTroopTotalBattleRating(troop).toFixed(2)}`}</div>
          </div>
          <div className={styles.listThird}>
            <div className={styles.listField}>{"Movement:"}</div>
            <div className={styles.listValue}>{`${def.move}' / ${def.move / 5} miles`}</div>
          </div>
          <div className={styles.listThird}>
            <div className={styles.listField}>{"Wages:"}</div>
            <div className={styles.listValue}>{`${def.wage * troop.count}gp`}</div>
          </div>
        </div>
      </div>
    );
  }

  private getSortedTroops(): TroopData[] {
    const troops = [...this.props.troops];

    troops.sort((troopA, troopB) => {
      const nameA = this.props.troopDefs[troopA.def_id].name;
      const nameB = this.props.troopDefs[troopB.def_id].name;
      return nameA.localeCompare(nameB);
    });

    return troops;
  }

  private onCreateTroopClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateTroop",
        content: () => {
          return <CreateTroopSubPanel armyId={this.props.armyId} />;
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
              preselectedLocationId={this.props.army.location_id}
              onSelectionConfirmed={async (location_id) => {
                const newArmy: ArmyData = { ...this.props.army, location_id };
                const res = await ServerAPI.editArmy(newArmy);
                if ("error" in res) {
                  // Error modal.
                  this.props.dispatch?.(
                    showModal({
                      id: "EditLocationError",
                      content: {
                        title: "Error",
                        message: "An Error occurred while attempting to change army location.",
                      },
                    })
                  );
                } else {
                  // Successfully updated on the server, so update it locally too.
                  this.props.dispatch?.(updateArmy(newArmy));
                }
              }}
            />
          );
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const army = state.armies.armies[props.armyId];
  const location = state.locations.locations[army?.location_id];
  const troops = state.armies.troopsByArmy[army?.id] ?? [];
  const injuries = state.armies.troopInjuriesByTroop;
  const troopDefs = state.gameDefs.troops;
  return {
    ...props,
    army,
    troops,
    injuries,
    location,
    troopDefs,
  };
}

export const ArmySheet = connect(mapStateToProps)(AArmySheet);
