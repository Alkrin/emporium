import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./ToolsHexClearingSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import ServerAPI, {
  ActivityParticipant,
  CharacterData,
  TroopData,
  TroopDefData,
  TroopInjuryData,
} from "../../serverAPI";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { SelectAdventurersDialog } from "../dialogs/SelectAdventurersDialog";
import { SelectArmiesDialog } from "../dialogs/SelectArmiesDialog";
import {
  getArmyAvailableBattleRating,
  getArmyTotalBattleRating,
  getTroopAvailableUnitCount,
} from "../../lib/armyUtils";
import dateFormat from "dateformat";
import { SelectAdventurerInjuryDialog } from "../dialogs/SelectAdventurerInjuryDialog";
import { InputSingleNumberDialog } from "../dialogs/InputSingleNumberDialog";
import {
  AdventurerParticipant,
  ArmyParticipant,
  RewardDistro,
  createActivityParticipant,
  generateActivityOutcomes,
  generateAnonymousActivity,
} from "../../lib/activityUtils";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { refetchArmies, refetchTroopInjuries, refetchTroops } from "../../dataSources/ArmiesDataSource";
import { refetchActivities } from "../../dataSources/ActivitiesDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { getBonusForStat, getBonusString } from "../../lib/characterUtils";

interface State {
  isSaving: boolean;
  currentDate: string;
  leadFromBehindID: number;
  adventurerParticipants: AdventurerParticipant[];
  armyParticipants: ArmyParticipant[];
  goldFoundString: string;
  xpEarnedString: string;
}

const defaultState: State = {
  isSaving: false,
  currentDate: dateFormat(new Date(), "yyyy-mm-dd"),
  leadFromBehindID: 0,
  adventurerParticipants: [],
  armyParticipants: [],
  goldFoundString: "0",
  xpEarnedString: "0",
};

interface ReactProps {}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopInjuriesByTroop: Dictionary<TroopInjuryData[]>;
  troopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AToolsHexClearingSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;

    const totalAdventurerLevel = this.getTotalAdventurerLevel();
    const healthyAdventurerLevel = this.getHealthyAdventurerLevel();

    const totalBattleRating = this.getAllTroopsTotalBattleRating();
    const availableBattleRating = this.getAllTroopsAvailableBattleRating();
    const healthyBattleRating = this.getAllTroopsHealthyBattleRating();

    const totalParticipantCount = this.getTotalParticipantCount();
    const healthyParticipantCount = this.getHealthyParticipantCount();

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>Hex Clearing</div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{`Current Date:`}</div>
          <input
            className={styles.currentDate}
            type={"date"}
            value={this.state.currentDate}
            onChange={(e) => {
              this.setState({ currentDate: e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{`Adventurers: ${this.state.adventurerParticipants.length}`}</div>
          <div className={styles.sectionButton} onClick={this.onAdventurersClick.bind(this)} />
          <div className={styles.row}>
            <div className={styles.labelText}>{`\xa0\xa0Expedition Level:\xa0`}</div>
            <div className={styles.valueText}>{`${totalAdventurerLevel}`}</div>
            {totalAdventurerLevel !== healthyAdventurerLevel && (
              <div className={styles.reducedValueText}>{`\xa0(${healthyAdventurerLevel})`}</div>
            )}
            <div className={styles.valueText}>{`\xa0/ 6 = ${(totalAdventurerLevel / 6).toFixed(2)} = ${Math.floor(
              totalAdventurerLevel / 6
            ).toFixed(0)}`}</div>
            {totalAdventurerLevel !== healthyAdventurerLevel && (
              <div className={styles.reducedValueText}>{`\xa0(${Math.floor(healthyAdventurerLevel / 6).toFixed(
                0
              )})`}</div>
            )}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Lead from Behind?"}</div>
          <select
            className={styles.leadFromBehindSelector}
            value={this.state.leadFromBehindID}
            onChange={(e) => {
              this.setState({ leadFromBehindID: +e.target.value });
            }}
          >
            <option value={0}>---</option>
            {this.getSortedAdventurers().map(({ id, name }) => {
              return (
                <option value={id} key={`user${name}`}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{`Troops: ${this.state.armyParticipants.length}`}</div>
          <div className={styles.sectionButton} onClick={this.onArmiesClick.bind(this)} />
          <div className={styles.row}>
            <div className={styles.labelText}>{`\xa0\xa0Battle Rating:\xa0`}</div>
            <div className={styles.valueText}>{`${availableBattleRating.toFixed(2)} / ${totalBattleRating.toFixed(
              2
            )}`}</div>
            {availableBattleRating !== healthyBattleRating && (
              <div className={styles.reducedValueText}>{`\xa0(${healthyBattleRating.toFixed(2)})`}</div>
            )}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Scaling Modifier: "}</div>
          <div className={styles.valueText}>{`\xa0\xa0\xa0${totalParticipantCount}`}</div>
          {totalParticipantCount !== healthyParticipantCount && (
            <div className={styles.reducedValueText}>{`\xa0(${healthyParticipantCount})`}</div>
          )}
          <div className={styles.valueText}>{`\xa0/ 6 = ${(totalParticipantCount / 6).toFixed(2)}`}</div>
          {totalParticipantCount !== healthyParticipantCount && (
            <div className={styles.reducedValueText}>{`\xa0(${(healthyParticipantCount / 6).toFixed(2)})`}</div>
          )}
        </div>
        {this.state.adventurerParticipants.length > 0 && <div className={styles.listConLabel}>{"CON"}</div>}
        <div className={styles.participantListContainer}>
          {this.state.adventurerParticipants.map(this.renderAdventurerParticipantRow.bind(this))}
          {this.state.armyParticipants.map(this.renderArmyParticipantRow.bind(this))}
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Gold Found"}</div>
          <input
            className={styles.numberInputField}
            type={"number"}
            value={this.state.goldFoundString}
            onChange={(e) => {
              this.setState({ goldFoundString: e.target.value });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"XP Earned"}</div>
          <input
            className={styles.numberInputField}
            type={"number"}
            value={this.state.xpEarnedString}
            onChange={(e) => {
              this.setState({ xpEarnedString: e.target.value });
            }}
          />
        </div>
        <div className={styles.applyButton} onClick={this.onApplyOutcomesClick.bind(this)}>
          {"Apply Outcomes and Adjust Participants"}
        </div>
        {this.state.isSaving ? (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>{"Saving..."}</div>
          </div>
        ) : null}

        <SubPanelCloseButton />
      </div>
    );
  }

  private renderArmyParticipantRow(p: ArmyParticipant, index: number): React.ReactNode {
    const troop = this.props.troopsByArmy[p.armyId].find((t) => {
      return t.id === p.troopId;
    });
    const troopDef = this.props.troopDefs[troop?.def_id ?? 0];
    return (
      <div className={styles.listRow} key={`troop${index}`}>
        <div className={styles.listIndex}>{index + 1 + this.state.adventurerParticipants.length}</div>
        <div className={styles.listCount}>{p.troopCount}×</div>
        <div className={styles.listName}>{troopDef.name}</div>
        <div
          className={`${styles.injuryButton} ${p.pendingInjuryCount > 0 ? styles.injured : ""}`}
          onClick={this.onArmyInjuryClicked.bind(this, p)}
        />
        <div
          className={`${styles.deathButton} ${p.pendingDeathCount > 0 ? styles.dead : ""}`}
          onClick={this.onArmyDeathClicked.bind(this, p)}
        />
      </div>
    );
  }

  private renderAdventurerParticipantRow(p: AdventurerParticipant, index: number): React.ReactNode {
    const adventurer = this.props.allCharacters[p.characterId];
    const isInjured = p.pendingInjuryIds.length > 0;
    const isDead = p.isPendingDeath;
    const conBonus = getBonusForStat(adventurer.constitution);
    return (
      <div className={styles.listRow} key={`adventurer${index}`}>
        <div className={styles.listIndex}>{index + 1}</div>
        <div className={styles.listName}>{adventurer.name}</div>
        <div className={`${styles.listConBonus} ${conBonus < 0 ? styles.negative : ""}`}>
          {getBonusString(conBonus)}
        </div>
        <div
          className={`${styles.injuryButton} ${isInjured ? styles.injured : ""}`}
          onClick={this.onAdventurerInjuryClicked.bind(this, p)}
        />
        <div
          className={`${styles.deathButton} ${isDead ? styles.dead : ""}`}
          onClick={this.onAdventurerDeathClicked.bind(this, p)}
        />
      </div>
    );
  }

  private getTotalParticipantCount(): number {
    return this.state.adventurerParticipants.length + this.state.armyParticipants.length;
  }

  private getHealthyParticipantCount(): number {
    let healthyCount = 0;

    Object.values(this.state.adventurerParticipants).forEach((ap) => {
      if (!ap.isPendingDeath && ap.pendingInjuryIds.length === 0) {
        healthyCount++;
      }
    });

    Object.values(this.state.armyParticipants).forEach((ap) => {
      const healthyTroopCount = ap.troopCount - ap.pendingDeathCount - ap.pendingInjuryCount;
      if (healthyTroopCount > 0) {
        healthyCount++;
      }
    });

    return healthyCount;
  }

  private async onApplyOutcomesClick(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    const activity = generateAnonymousActivity(
      this.state.currentDate,
      this.state.adventurerParticipants.map((adventurer) => {
        return createActivityParticipant(adventurer.characterId);
      })
    );
    const [outcomes, campaignGPDistributions] = generateActivityOutcomes(
      activity,
      this.state.currentDate,
      this.state.adventurerParticipants,
      this.state.armyParticipants,
      +this.state.xpEarnedString,
      +this.state.goldFoundString,
      0
    );

    const res = await ServerAPI.resolveActivity(activity, "", outcomes, campaignGPDistributions);
    if (
      "error" in res ||
      !!res.find((v) => {
        return "error" in v;
      })
    ) {
      // Error popup.
      this.props.dispatch?.(
        showModal({
          id: "ResolutionFailed",
          content: {
            title: "Error!",
            message: "An error occurred while attempting to distribute rewards.  State not updated.",
            buttonText: "Okay",
          },
        })
      );
      console.error("Resolution Error", res);
    } else {
      // Refetch anything that might be altered by an activity resolution.  So... almost everything.
      if (this.props.dispatch) {
        await refetchActivities(this.props.dispatch);
        await refetchStorages(this.props.dispatch);
        await refetchCharacters(this.props.dispatch);
        await refetchItems(this.props.dispatch);
        await refetchArmies(this.props.dispatch);
        await refetchTroops(this.props.dispatch);
        await refetchTroopInjuries(this.props.dispatch);
      }
      // Remove injured and dead characters.
      const remainingAdventurers = this.state.adventurerParticipants.filter((a) => {
        return !a.isPendingDeath && a.pendingInjuryIds.length === 0;
      });
      this.setState({ adventurerParticipants: remainingAdventurers });

      // Re-generate ArmyParticipants.
      const armyIDs: Dictionary<number> = {};
      this.state.armyParticipants.forEach((p) => {
        armyIDs[p.armyId] = p.armyId;
      });
      this.updateArmyParticipants(Object.values(armyIDs), []);
    }

    this.setState({ isSaving: false, goldFoundString: "0", xpEarnedString: "0" });
  }

  private onAdventurerInjuryClicked(p: AdventurerParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    this.props.dispatch?.(
      showModal({
        id: "AdventurerInjury",
        content: () => {
          return (
            <SelectAdventurerInjuryDialog
              preselectedInjuryIds={p.pendingInjuryIds}
              onSelectionConfirmed={async (injuryIds: string[]) => {
                const participants: AdventurerParticipant[] = [...this.state.adventurerParticipants];
                p.pendingInjuryIds = injuryIds;
                this.setState({ adventurerParticipants: participants });
              }}
            />
          );
        },
      })
    );
  }

  private onAdventurerDeathClicked(p: AdventurerParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    this.props.dispatch?.(
      showModal({
        id: "AdventurerDeath",
        content: {
          title: "Death",
          message: `Was ${this.props.allCharacters[p.characterId].name} slain?`,
          buttonText: "No",
          onButtonClick: () => {
            p.isPendingDeath = false;
            this.setState({ adventurerParticipants: [...this.state.adventurerParticipants] });
            this.props.dispatch?.(hideModal());
          },
          extraButtons: [
            {
              text: "Yes",
              onClick: () => {
                p.isPendingDeath = true;
                this.setState({ adventurerParticipants: [...this.state.adventurerParticipants] });
                this.props.dispatch?.(hideModal());
              },
            },
          ],
        },
      })
    );
  }

  private onArmyInjuryClicked(p: ArmyParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    const def = this.props.troopDefs[p.troopDefId];
    this.props.dispatch?.(
      showModal({
        id: "ArmyInjury",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${p.troopCount}× ${def.name}`}
              prompt={"How many injured individuals in this platoon?"}
              initialValue={p.pendingInjuryCount}
              onValueConfirmed={async (count: number) => {
                const participants: ArmyParticipant[] = [...this.state.armyParticipants];
                p.pendingInjuryCount = count;
                this.setState({ armyParticipants: participants });
              }}
            />
          );
        },
      })
    );
  }

  private onArmyDeathClicked(p: ArmyParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    const def = this.props.troopDefs[p.troopDefId];
    this.props.dispatch?.(
      showModal({
        id: "ArmyDeath",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${p.troopCount}× ${def.name}`}
              prompt={"How many individuals killed in this platoon?"}
              initialValue={p.pendingDeathCount}
              onValueConfirmed={async (count: number) => {
                const participants: ArmyParticipant[] = [...this.state.armyParticipants];
                p.pendingDeathCount = count;
                this.setState({ armyParticipants: participants });
              }}
            />
          );
        },
      })
    );
  }

  private getAllTroopsHealthyBattleRating(): number {
    let br = 0;

    this.state.armyParticipants.forEach((p) => {
      const healthyCount = p.troopCount - p.pendingDeathCount - p.pendingInjuryCount;
      if (healthyCount > 0) {
        const troopDef = this.props.troopDefs[p.troopDefId];
        if (healthyCount === troopDef.platoon_size) {
          br += troopDef.platoon_br;
        } else {
          br += troopDef.individual_br * healthyCount;
        }
      }
    });

    return br;
  }

  private getAllTroopsAvailableBattleRating(): number {
    let br = 0;

    const armies: Dictionary<number> = {};
    this.state.armyParticipants.forEach((p) => {
      armies[p.armyId] = p.armyId;
    });

    Object.values(armies).forEach((armyId) => {
      br += getArmyAvailableBattleRating(armyId, this.state.currentDate);
    });

    return br;
  }

  private getAllTroopsTotalBattleRating(): number {
    let br = 0;

    const armies: Dictionary<number> = {};
    this.state.armyParticipants.forEach((p) => {
      armies[p.armyId] = p.armyId;
    });

    Object.values(armies).forEach((armyId) => {
      br += getArmyTotalBattleRating(armyId);
    });

    return br;
  }

  private getSortedAdventurers(): CharacterData[] {
    const adventurers = this.state.adventurerParticipants.map((p) => {
      return this.props.allCharacters[p.characterId];
    });
    adventurers.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return adventurers;
  }

  private getTotalAdventurerLevel(): number {
    const total = this.state.adventurerParticipants.reduce((levels: number, p: AdventurerParticipant) => {
      if (p.characterId === this.state.leadFromBehindID) {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0) / 2;
      } else {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0);
      }
    }, 0);
    return total;
  }

  private getHealthyAdventurerLevel(): number {
    const total = this.state.adventurerParticipants.reduce((levels: number, p: AdventurerParticipant) => {
      // If the participant is dead or injured, don't count their power.
      if (p.isPendingDeath || p.pendingInjuryIds.length > 0) {
        return levels;
      }

      if (p.characterId === this.state.leadFromBehindID) {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0) / 2;
      } else {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0);
      }
    }, 0);
    return total;
  }

  private onAdventurersClick(): void {
    if (this.state.isSaving) {
      return;
    }
    // Show a modal to select / edit the adventurer list.
    this.props.dispatch?.(
      showModal({
        id: "Adventurers",
        widthVmin: 60,
        content: () => {
          return (
            <SelectAdventurersDialog
              currentDateOverride={this.state.currentDate}
              preselectedAdventurerIDs={this.state.adventurerParticipants.map((p) => {
                return p.characterId;
              })}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                // If the selected LeadFromBehind adventurer is no longer participating, deselect them.
                if (this.state.leadFromBehindID && !adventurerIDs.includes(this.state.leadFromBehindID)) {
                  this.setState({ leadFromBehindID: 0 });
                }
                this.updateAdventurerParticipants(adventurerIDs);
              }}
            />
          );
        },
      })
    );
  }

  private updateAdventurerParticipants(adventurerIDs: number[]): void {
    // If any adventurers were removed, remove them.
    const participants = this.state.adventurerParticipants.filter((p) => {
      return adventurerIDs.includes(p.characterId);
    });
    // If there are new adventurers, add them.
    adventurerIDs.forEach((aid) => {
      if (
        !participants.find((p) => {
          return p.characterId === aid;
        })
      ) {
        const newParticipant: AdventurerParticipant = {
          characterId: aid,
          pendingInjuryIds: [],
          isPendingDeath: false,
        };
        participants.push(newParticipant);
      }
    });

    // And update state with the new set.
    this.setState({ adventurerParticipants: participants });
  }

  private onArmiesClick(): void {
    // Show a modal to select / edit the army list.
    this.props.dispatch?.(
      showModal({
        id: "Armies",
        widthVmin: 60,
        content: () => {
          const armyIDs: Dictionary<number> = {};
          this.state.armyParticipants.forEach((p) => {
            armyIDs[p.armyId] = p.armyId;
          });
          return (
            <SelectArmiesDialog
              currentDateOverride={this.state.currentDate}
              preselectedArmyIDs={Object.values(armyIDs)}
              onSelectionConfirmed={(armyIDs: number[]) => {
                this.updateArmyParticipants(armyIDs, this.state.armyParticipants);
              }}
            />
          );
        },
      })
    );
  }

  private updateArmyParticipants(armyIDs: number[], previousParticipants: ArmyParticipant[]): void {
    // If any armies were removed, remove them.
    const participants = previousParticipants.filter((p) => {
      return armyIDs.includes(p.armyId);
    });
    // If there are new armies, add them.
    armyIDs.forEach((aid) => {
      if (
        !participants.find((p) => {
          return p.armyId === aid;
        })
      ) {
        // Split the troops into platoons.
        const troops = this.props.troopsByArmy[aid];
        troops.forEach((troop) => {
          const def = this.props.troopDefs[troop.def_id];
          // This function accounts for injuries.
          let remainingTroops = getTroopAvailableUnitCount(troop);
          while (remainingTroops > 0) {
            const troopCount = Math.min(def.platoon_size, remainingTroops);
            const newParticipant: ArmyParticipant = {
              armyId: aid,
              troopId: troop.id,
              troopDefId: def.id,
              troopCount,
              pendingInjuryCount: 0,
              pendingDeathCount: 0,
            };
            participants.push(newParticipant);
            remainingTroops -= troopCount;
          }
        });
      }
    });

    // No extra sorting for the troops.

    // And update state with the new set.
    this.setState({ armyParticipants: participants });
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const { troopsByArmy, troopInjuriesByTroop } = state.armies;
  const troopDefs = state.gameDefs.troops;

  return {
    ...props,
    allCharacters,
    troopsByArmy,
    troopInjuriesByTroop,
    troopDefs,
  };
}

export const ToolsHexClearingSubPanel = connect(mapStateToProps)(AToolsHexClearingSubPanel);
