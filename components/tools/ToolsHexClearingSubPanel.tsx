import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./ToolsHexClearingSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import ServerAPI, {
  ActivityAdventurerParticipant,
  ActivityArmyParticipant,
  ActivityData,
  ActivityOutcomeData,
  ActivityOutcomeData_GrantItems,
  ActivityOutcomeData_InjuriesAndDeaths,
  ActivityOutcomeData_LootAndXP,
  ActivityOutcomeType,
  ArmyData,
  CharacterClassv2,
  CharacterData,
  StorageData,
  TroopData,
  TroopDefData,
} from "../../serverAPI";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { SelectAdventurersDialog } from "../dialogs/SelectAdventurersDialog";
import { SelectArmiesDialog } from "../dialogs/SelectArmiesDialog";
import { getArmyAvailableBattleRating, getArmyTotalBattleRating } from "../../lib/armyUtils";
import dateFormat from "dateformat";
import { SelectAdventurerInjuryDialog } from "../dialogs/SelectAdventurerInjuryDialog";
import { InputSingleNumberDialog } from "../dialogs/InputSingleNumberDialog";
import {
  createActivityAdventurerParticipant,
  createActivityArmyParticipant,
  generateActivityResolution,
  generateAnonymousActivity,
} from "../../lib/activityUtils";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { refetchArmies, refetchTroopInjuries, refetchTroops } from "../../dataSources/ArmiesDataSource";
import { refetchActivities } from "../../dataSources/ActivitiesDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import {
  getStatBonusForValue,
  getBonusString,
  getCharacterStatv2,
  getActiveAbilityComponentsForCharacter,
  getCharacterSupportsV2,
  getCharacterStat,
  getCombatSpeedsForCharacter,
  getEncumbranceLevelForCharacter,
} from "../../lib/characterUtils";
import { refetchContracts } from "../../dataSources/ContractsDataSource";
import { ActivityOutcomesList } from "../activities/ActivityOutcomeList";
import { CreateActivityOutcomeDialog } from "../activities/CreateActivityOutcomeDialog";
import { AddButton } from "../AddButton";
import { getStorageDisplayName } from "../../lib/storageUtils";
import { EditButton } from "../EditButton";
import { SelectStorageDialog } from "../dialogs/SelectStorageDialog";
import { BasicDialog } from "../dialogs/BasicDialog";
import { ExportButton } from "../ExportButton";
import { ExportDialog } from "../dialogs/ExportDialog";
import { CharacterStat } from "../../staticData/types/characterClasses";

interface State {
  isSaving: boolean;
  activity: ActivityData;
  laxOutcome: ActivityOutcomeData_LootAndXP;
  painOutcome: ActivityOutcomeData_InjuriesAndDeaths;
  itemOutcomes: ActivityOutcomeData_GrantItems[];

  goldFoundString: string;
  xpEarnedString: string;

  targetStorageId: number;
}

const defaultState: State = {
  isSaving: false,
  activity: generateAnonymousActivity(dateFormat(new Date(), "yyyy-mm-dd"), [], [], 0),
  laxOutcome: {
    id: 0,
    activity_id: 0,
    type: ActivityOutcomeType.LootAndXP,
    goldWithXP: 0,
    goldWithoutXP: 0,
    combatXP: 0,
    campaignXP: 0,
  },
  painOutcome: {
    id: 0,
    activity_id: 0,
    type: ActivityOutcomeType.InjuriesAndDeaths,
    deadCharacterIds: [],
    characterInjuries: {},
    troopDeathsByArmy: {},
    troopInjuriesByArmy: {},
  },
  itemOutcomes: [],
  goldFoundString: "0",
  xpEarnedString: "0",
  targetStorageId: 0,
};

interface ReactProps {}

interface InjectedProps {
  allArmies: Dictionary<ArmyData>;
  allCharacters: Dictionary<CharacterData>;
  allCharacterClasses: Record<number, CharacterClassv2>;
  allStorages: Dictionary<StorageData>;
  troopsByArmy: Dictionary<TroopData[]>;
  troopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AToolsHexClearingSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  render(): React.ReactNode {
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
            value={this.state.activity.end_date}
            onChange={(e) => {
              this.setState({
                activity: { ...this.state.activity, start_date: e.target.value, end_date: e.target.value },
              });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{`Adventurers: ${this.state.activity.participants.length}`}</div>
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
            value={this.state.activity.lead_from_behind_id}
            onChange={(e) => {
              this.setState({ activity: { ...this.state.activity, lead_from_behind_id: +e.target.value } });
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
          <div className={styles.firstLabel}>{`Troops: ${this.state.activity.army_participants.reduce<number>(
            (total, ap) => total + Object.keys(ap.troopCounts).length,
            0
          )}`}</div>
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
        {this.state.activity.participants.length > 0 && <div className={styles.listConLabel}>{"CON"}</div>}
        <div className={styles.participantListContainer}>
          {this.state.activity.participants.length > 0 && (
            <div className={styles.participantHeader}>{"Adventurers"}</div>
          )}
          {this.state.activity.participants.map(this.renderAdventurerParticipantRow.bind(this))}
          {this.state.activity.army_participants.map(this.renderArmyParticipantRows.bind(this))}
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Gold Found"}</div>
          <input
            className={styles.numberInputField}
            type={"number"}
            value={this.state.goldFoundString}
            onChange={(e) => {
              this.setState({
                goldFoundString: e.target.value,
                laxOutcome: { ...this.state.laxOutcome, goldWithXP: +e.target.value },
              });
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
              this.setState({
                xpEarnedString: e.target.value,
                laxOutcome: { ...this.state.laxOutcome, combatXP: +e.target.value },
              });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.firstLabel}>{"Items Found"}</div>
          <AddButton className={styles.itemsAddButton} onClick={this.onItemOutcomeAddClicked.bind(this)} />
          <div className={styles.firstLabel}>{"Target Storage:\xa0"}</div>
          <div className={styles.valueText}>{getStorageDisplayName(this.state.targetStorageId)}</div>
          <EditButton className={styles.itemsAddButton} onClick={this.onSelectTargetStoreClicked.bind(this)} />
        </div>
        <ActivityOutcomesList
          className={styles.itemsFoundList}
          outcomes={this.state.itemOutcomes}
          canEdit={true}
          onEditRowClicked={this.onItemOutcomeEditClicked.bind(this)}
          onDeleteRowClicked={this.onItemOutcomeDeleteClicked.bind(this)}
        />
        <div className={styles.applyButton} onClick={this.onApplyOutcomesClick.bind(this)}>
          {"Apply Outcomes and Adjust Participants"}
        </div>
        <ExportButton className={styles.exportButton} onClick={this.onExportClick.bind(this)} />
        {this.state.isSaving ? (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>{"Saving..."}</div>
          </div>
        ) : null}

        <SubPanelCloseButton />
      </div>
    );
  }

  private onSelectTargetStoreClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "selectTargetStorage",
        content: () => {
          return (
            <SelectStorageDialog
              preselectedStorageId={this.state.targetStorageId}
              onSelectionConfirmed={async (targetStorageId: number) => {
                this.setState({ targetStorageId });
              }}
            />
          );
        },
        escapable: true,
      })
    );
  }

  private onItemOutcomeAddClicked(): void {
    const defaultOutcome: ActivityOutcomeData_GrantItems = {
      id: 0,
      type: ActivityOutcomeType.GrantItems,
      activity_id: 0,
      items: [],
      storageId: this.state.targetStorageId,
    };
    this.props.dispatch?.(
      showModal({
        id: "ItemOutcomeAdd",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.state.activity}
              initialValues={defaultOutcome}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                const newOutcomes = [...this.state.itemOutcomes, outcome as ActivityOutcomeData_GrantItems];
                this.setState({ itemOutcomes: newOutcomes });
              }}
              allowedTypes={[ActivityOutcomeType.GrantItems]}
            />
          );
        },
        escapable: true,
      })
    );
  }

  private onItemOutcomeEditClicked(data: ActivityOutcomeData, index: number): void {
    this.props.dispatch?.(
      showModal({
        id: "EditExpectedOutcome",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.state.activity}
              initialValues={data}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                const newOutcomes = [...this.state.itemOutcomes];
                newOutcomes[index] = outcome as ActivityOutcomeData_GrantItems;
                this.setState({ itemOutcomes: newOutcomes });
              }}
            />
          );
        },
      })
    );
  }

  private onItemOutcomeDeleteClicked(data: ActivityOutcomeData, index: number): void {
    this.setState({ itemOutcomes: this.state.itemOutcomes.filter((_, findex) => findex !== index) });
  }

  private renderArmyParticipantRows(p: ActivityArmyParticipant, index: number): React.ReactNode {
    const army = this.props.allArmies[p.armyId];
    const sortedTroops = Object.entries(p.troopCounts).sort((a, b) => {
      const defA = this.props.troopDefs[+a[0]];
      const defB = this.props.troopDefs[+b[0]];
      return defA.name.localeCompare(defB.name);
    });

    return (
      <React.Fragment key={`Army${index}`}>
        <div className={styles.participantHeader}>{army.name}</div>
        {sortedTroops.map(this.renderTroopRow.bind(this, army, index))}
      </React.Fragment>
    );
  }

  private getTroopStartPosition(armyIndex: number, troopIndex: number, troopCounts: [string, number][]): number {
    // We presume to start armies/troops one slot past the adventurers.
    let startPosition = this.state.activity.participants.length + 1;

    // Iterate through each army and troop type and increment per full or partial platoon.
    for (let ai = 0; ai <= armyIndex; ++ai) {
      if (ai === armyIndex) {
        // For the specific army and troop, use the sorted troop counts passed in.
        for (let ti = 0; ti < troopIndex; ++ti) {
          const [troopDefId, troopCount] = troopCounts[ti];
          const def = this.props.troopDefs[+troopDefId];
          const numPlatoons = Math.ceil(troopCount / def.platoon_size);
          startPosition += numPlatoons;
        }
      } else {
        // For any previous armies, we don't care what their order was, just their platoon counts.
        const armyParticipant = this.state.activity.army_participants[ai];
        const troopCounts = Object.entries(armyParticipant.troopCounts);
        for (let ti = 0; ti < troopCounts.length; ++ti) {
          const [troopDefId, troopCount] = troopCounts[ti];
          const def = this.props.troopDefs[+troopDefId];
          const numPlatoons = Math.ceil(troopCount / def.platoon_size);
          startPosition += numPlatoons;
        }
      }
    }
    return startPosition;
  }

  private renderTroopRow(
    army: ArmyData,
    armyIndex: number,
    entry: [string, number],
    index: number,
    troopCounts: [string, number][]
  ): React.ReactNode {
    const troopDefId = +entry[0];
    const count = entry[1];
    const def = this.props.troopDefs[troopDefId];
    const startPosition = this.getTroopStartPosition(armyIndex, index, troopCounts);
    const endPosition = Math.max(startPosition, startPosition + Math.ceil(count / def.platoon_size) - 1);

    const injuryCount = this.state.painOutcome.troopInjuriesByArmy[army.id]?.[troopDefId] ?? 0;
    const deathCount = this.state.painOutcome.troopDeathsByArmy[army.id]?.[troopDefId] ?? 0;

    return (
      <div className={styles.listRow} key={`Troop${index}`}>
        <div className={styles.listIndex}>
          {startPosition === endPosition ? startPosition : `${startPosition}-${endPosition}`}
        </div>
        <div className={styles.listCount}>{`${count}×\xa0`}</div>
        <div className={styles.listName}>{def.name}</div>
        <div
          className={`${styles.injuryButton} ${injuryCount > 0 ? styles.injured : ""}`}
          onClick={this.onArmyInjuryClicked.bind(this, army.id, troopDefId, count)}
        />
        <div
          className={`${styles.deathButton} ${deathCount > 0 ? styles.dead : ""}`}
          onClick={this.onArmyDeathClicked.bind(this, army.id, troopDefId, count)}
        />
      </div>
    );
  }

  private renderAdventurerParticipantRow(p: ActivityAdventurerParticipant, index: number): React.ReactNode {
    const adventurer = this.props.allCharacters[p.characterId];
    const isInjured = (this.state.painOutcome.characterInjuries[p.characterId] ?? []).length > 0;
    const isDead = this.state.painOutcome.deadCharacterIds.includes(p.characterId);
    const conBonus = getStatBonusForValue(adventurer.constitution);
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

  private getPlatoonCountForTroop(troopDefId: number, unitCount: number): number {
    const def = this.props.troopDefs[troopDefId];
    return Math.ceil(unitCount / def.platoon_size);
  }

  private getTotalParticipantCount(): number {
    const armyPlatoonCount = this.state.activity.army_participants.reduce<number>((total, ap) => {
      const troopPlatoonCount = Object.entries(ap.troopCounts).reduce<number>(
        (troopTotal, [troopDefId, troopCount]) => {
          return troopTotal + this.getPlatoonCountForTroop(+troopDefId, troopCount);
        },
        0
      );
      return total + troopPlatoonCount;
    }, 0);
    return this.state.activity.participants.length + armyPlatoonCount;
  }

  private getHealthyParticipantCount(): number {
    let healthyCount = 0;

    Object.values(this.state.activity.participants).forEach((ap) => {
      const isInjured = (this.state.painOutcome.characterInjuries[ap.characterId] ?? []).length > 0;
      const isDead = this.state.painOutcome.deadCharacterIds.includes(ap.characterId);
      if (!isInjured && !isDead) {
        healthyCount++;
      }
    });

    const healthyArmyPlatoonCount = this.state.activity.army_participants.reduce<number>((total, ap) => {
      const troopPlatoonCount = Object.entries(ap.troopCounts).reduce<number>(
        (troopTotal, [troopDefId, troopCount]) => {
          const troopInjuryCount = this.state.painOutcome.troopInjuriesByArmy[ap.armyId]?.[troopDefId] ?? 0;
          const troopDeathCount = this.state.painOutcome.troopDeathsByArmy[ap.armyId]?.[troopDefId] ?? 0;
          return (
            troopTotal +
            this.getPlatoonCountForTroop(+troopDefId, Math.max(0, troopCount - troopInjuryCount - troopDeathCount))
          );
        },
        0
      );
      return total + troopPlatoonCount;
    }, 0);

    healthyCount += healthyArmyPlatoonCount;

    return healthyCount;
  }

  private async onApplyOutcomesClick(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    this.setState({ isSaving: true });

    const outcomes: ActivityOutcomeData[] = [this.state.painOutcome, this.state.laxOutcome, ...this.state.itemOutcomes];
    const resolution = generateActivityResolution(this.state.activity, outcomes, this.state.activity.end_date);

    const res = await ServerAPI.resolveActivity(this.state.activity, outcomes, resolution);
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
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"An error occurred while attempting to distribute rewards.  State not updated."}
            />
          ),
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
        await refetchContracts(this.props.dispatch);
      }
      // Remove injured and dead characters.
      const remainingAdventurers = this.state.activity.participants.filter((a) => {
        const isInjured = (this.state.painOutcome.characterInjuries[a.characterId] ?? []).length > 0;
        const isDead = this.state.painOutcome.deadCharacterIds.includes(a.characterId);
        return !isInjured && !isDead;
      });
      this.setState({ activity: { ...this.state.activity, participants: remainingAdventurers } });
    }

    this.setState({
      isSaving: false,
      // Clear the outcomes back to nothing.
      laxOutcome: {
        id: 0,
        activity_id: 0,
        type: ActivityOutcomeType.LootAndXP,
        goldWithXP: 0,
        goldWithoutXP: 0,
        combatXP: 0,
        campaignXP: 0,
      },
      painOutcome: {
        id: 0,
        activity_id: 0,
        type: ActivityOutcomeType.InjuriesAndDeaths,
        deadCharacterIds: [],
        characterInjuries: {},
        troopDeathsByArmy: {},
        troopInjuriesByArmy: {},
      },
      itemOutcomes: [],
      goldFoundString: "0",
      xpEarnedString: "0",
    });
  }

  private onAdventurerInjuryClicked(p: ActivityAdventurerParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    this.props.dispatch?.(
      showModal({
        id: "AdventurerInjury",
        content: () => {
          return (
            <SelectAdventurerInjuryDialog
              preselectedInjuryIds={this.state.painOutcome.characterInjuries[p.characterId] ?? []}
              onSelectionConfirmed={async (injuryIds: string[]) => {
                this.setState({
                  painOutcome: {
                    ...this.state.painOutcome,
                    characterInjuries: { ...this.state.painOutcome.characterInjuries, [p.characterId]: injuryIds },
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private onAdventurerDeathClicked(p: ActivityAdventurerParticipant): void {
    if (this.state.isSaving) {
      return;
    }
    this.props.dispatch?.(
      showModal({
        id: "AdventurerDeath",
        content: () => (
          <BasicDialog
            title={"Death"}
            prompt={`Was ${this.props.allCharacters[p.characterId].name} slain?`}
            buttons={[
              {
                text: "Yes",
                onClick: async () => {
                  this.setState({
                    painOutcome: {
                      ...this.state.painOutcome,
                      deadCharacterIds: [...this.state.painOutcome.deadCharacterIds, p.characterId],
                    },
                  });
                  this.props.dispatch?.(hideModal());
                },
              },
              {
                text: "No",
                onClick: async () => {
                  this.setState({
                    painOutcome: {
                      ...this.state.painOutcome,
                      deadCharacterIds: this.state.painOutcome.deadCharacterIds.filter(
                        (dcid) => dcid !== p.characterId
                      ),
                    },
                  });
                  this.props.dispatch?.(hideModal());
                },
              },
            ]}
          />
        ),
      })
    );
  }

  private onArmyInjuryClicked(armyId: number, troopDefId: number, troopCount: number): void {
    const def = this.props.troopDefs[troopDefId];
    const numInjuries = this.state.painOutcome.troopInjuriesByArmy[armyId]?.[troopDefId] ?? 0;

    this.props.dispatch?.(
      showModal({
        id: "ArmyInjury",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${troopCount}× ${def.name}`}
              prompt={`Platoon size: ${def.platoon_size}\n\nHow many injured individuals of this troop type?`}
              initialValue={numInjuries}
              onValueConfirmed={async (count: number) => {
                this.setState({
                  painOutcome: {
                    ...this.state.painOutcome,
                    troopInjuriesByArmy: {
                      ...this.state.painOutcome.troopInjuriesByArmy,
                      [armyId]: {
                        ...(this.state.painOutcome.troopInjuriesByArmy[armyId] ?? {}),
                        [troopDefId]: Math.max(0, Math.min(troopCount, count)),
                      },
                    },
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private onArmyDeathClicked(armyId: number, troopDefId: number, troopCount: number): void {
    const def = this.props.troopDefs[troopDefId];
    const numDeaths = this.state.painOutcome.troopDeathsByArmy[armyId]?.[troopDefId] ?? 0;

    this.props.dispatch?.(
      showModal({
        id: "ArmyDeath",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${troopCount}× ${def.name}`}
              prompt={"How many individuals of this troop type were killed?"}
              initialValue={numDeaths}
              onValueConfirmed={async (count: number) => {
                this.setState({
                  painOutcome: {
                    ...this.state.painOutcome,
                    troopDeathsByArmy: {
                      ...this.state.painOutcome.troopDeathsByArmy,
                      [armyId]: {
                        ...(this.state.painOutcome.troopDeathsByArmy[armyId] ?? {}),
                        [troopDefId]: Math.max(0, Math.min(troopCount, count)),
                      },
                    },
                  },
                });
              }}
            />
          );
        },
      })
    );
  }

  private getAllTroopsHealthyBattleRating(): number {
    let br = 0;

    this.state.activity.army_participants.forEach((p) => {
      Object.entries(p.troopCounts).forEach(([troopDefId, troopCount]) => {
        const troopInjuries = this.state.painOutcome.troopInjuriesByArmy[p.armyId]?.[troopDefId] ?? 0;
        const troopDeaths = this.state.painOutcome.troopDeathsByArmy[p.armyId]?.[troopDefId] ?? 0;
        const healthyCount = troopCount - troopInjuries - troopDeaths;
        if (healthyCount > 0) {
          const troopDef = this.props.troopDefs[troopDefId];
          const fullPlatoons = Math.floor(healthyCount / troopDef.platoon_size);
          const looseUnits = healthyCount % troopDef.platoon_size;

          br += fullPlatoons * troopDef.platoon_br;
          br += looseUnits * troopDef.individual_br;
        }
      });
    });

    return br;
  }

  private getAllTroopsAvailableBattleRating(): number {
    let br = 0;

    const armies: Dictionary<number> = {};
    this.state.activity.army_participants.forEach((p) => {
      armies[p.armyId] = p.armyId;
    });

    Object.values(armies).forEach((armyId) => {
      br += getArmyAvailableBattleRating(armyId, this.state.activity.end_date);
    });

    return br;
  }

  private getAllTroopsTotalBattleRating(): number {
    let br = 0;

    const armies: Dictionary<number> = {};
    this.state.activity.army_participants.forEach((p) => {
      armies[p.armyId] = p.armyId;
    });

    Object.values(armies).forEach((armyId) => {
      br += getArmyTotalBattleRating(armyId);
    });

    return br;
  }

  private getSortedAdventurers(): CharacterData[] {
    const adventurers = this.state.activity.participants.map((p) => {
      return this.props.allCharacters[p.characterId];
    });
    adventurers.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });
    return adventurers;
  }

  private getTotalAdventurerLevel(): number {
    const total = this.state.activity.participants.reduce((levels: number, p: ActivityAdventurerParticipant) => {
      if (p.characterId === this.state.activity.lead_from_behind_id) {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0) / 2;
      } else {
        return levels + (this.props.allCharacters[p.characterId]?.level ?? 0);
      }
    }, 0);
    return total;
  }

  private getHealthyAdventurerLevel(): number {
    const total = this.state.activity.participants.reduce((levels: number, p: ActivityAdventurerParticipant) => {
      // If the participant is dead or injured, don't count their power.
      const isInjured = (this.state.painOutcome.characterInjuries[p.characterId] ?? []).length > 0;
      const isDead = this.state.painOutcome.deadCharacterIds.includes(p.characterId);
      if (isDead || isInjured) {
        return levels;
      }

      if (p.characterId === this.state.activity.lead_from_behind_id) {
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
        content: () => {
          return (
            <SelectAdventurersDialog
              startDateOverride={this.state.activity.end_date}
              preselectedAdventurerIDs={this.state.activity.participants.map((p) => {
                return p.characterId;
              })}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                // If the selected LeadFromBehind adventurer is no longer participating, deselect them.
                if (
                  this.state.activity.lead_from_behind_id &&
                  !adventurerIDs.includes(this.state.activity.lead_from_behind_id)
                ) {
                  this.setState({ activity: { ...this.state.activity, lead_from_behind_id: 0 } });
                }
                this.updateAdventurerParticipants(adventurerIDs);
              }}
            />
          );
        },
      })
    );
  }

  private updateAdventurerParticipants(adventurerIds: number[]): void {
    // Find out who was removed.  We'll need to clean them out of the Injury and Death outcomes.
    const removedAdventurerIds = this.state.activity.participants
      .filter((p) => {
        return !adventurerIds.includes(p.characterId);
      })
      .map((p) => p.characterId);

    const painOutcome: ActivityOutcomeData_InjuriesAndDeaths = {
      ...this.state.painOutcome,
      // They're not here, they're not dying from this.
      deadCharacterIds: this.state.painOutcome.deadCharacterIds.filter((id) => {
        return !removedAdventurerIds.includes(id);
      }),
    };
    removedAdventurerIds.forEach((id) => {
      // They're not here, they're not getting injured.
      delete painOutcome.characterInjuries[id];
    });

    const newParticipants: ActivityAdventurerParticipant[] = adventurerIds.map((characterId) => {
      return createActivityAdventurerParticipant(characterId);
    });

    // And update state with the new set.
    this.setState({ activity: { ...this.state.activity, participants: newParticipants }, painOutcome });
  }

  private onArmiesClick(): void {
    // Show a modal to select / edit the army list.
    this.props.dispatch?.(
      showModal({
        id: "Armies",
        content: () => {
          return (
            <SelectArmiesDialog
              startDateOverride={this.state.activity.end_date}
              preselectedArmyIDs={this.state.activity.army_participants.map((ap) => ap.armyId)}
              onSelectionConfirmed={(armyIDs: number[]) => {
                this.updateArmyParticipants(armyIDs);
              }}
            />
          );
        },
      })
    );
  }

  private updateArmyParticipants(armyIds: number[]): void {
    // Find out who was removed.  We'll need to clean them out of the Injury and Death outcomes.
    const removedArmyIds = this.state.activity.army_participants
      .filter((p) => {
        return !armyIds.includes(p.armyId);
      })
      .map((p) => p.armyId);

    const troopDeathsByArmy = { ...this.state.painOutcome.troopDeathsByArmy };
    const troopInjuriesByArmy = { ...this.state.painOutcome.troopInjuriesByArmy };
    removedArmyIds.forEach((armyId) => {
      delete troopDeathsByArmy[armyId];
      delete troopInjuriesByArmy[armyId];
    });

    const painOutcome: ActivityOutcomeData_InjuriesAndDeaths = {
      ...this.state.painOutcome,
      troopDeathsByArmy,
      troopInjuriesByArmy,
    };

    const newParticipants: ActivityArmyParticipant[] = armyIds.map((armyId) => {
      return createActivityArmyParticipant(armyId, this.state.activity.end_date);
    });

    // And update state with the new set.
    this.setState({ activity: { ...this.state.activity, army_participants: newParticipants }, painOutcome });
  }

  private onExportClick(): void {
    this.props.dispatch?.(
      showModal({
        id: "Export",
        content: () => {
          return <ExportDialog title={"Export Hex Clearing Expedition Data"} json={this.buildExportJSON()} />;
        },
      })
    );
  }

  private buildExportJSON(): string {
    interface CharacterExport {
      unitIndex: number;
      id: number;
      name: string;
      level: number;
      className: string;
      conBonus: number;
      willBonus: number;
      isLeadFromBehind: boolean;
    }

    interface PlatoonExport {
      unitIndex: number;
      armyId: number;
      troopDefId: number;
      troopName: string;
      unitCount: number;
      armyLevel: number;
      battleRating: number;
    }

    interface ExportData {
      expeditionLevel: number;
      participantCount: number;
      speed: number;
      slowestUnitName: string;
      characters: CharacterExport[];
      platoons: PlatoonExport[];
    }

    let unitIndex: number = 1;
    let speed = 9999;
    let slowestUnitName: string = "Unknown";
    let totalCharacterLevel = 0;

    const data: ExportData = {
      characters: this.state.activity.participants.map((ap) => {
        const character: CharacterData = this.props.allCharacters[ap.characterId];
        if (character.id === this.state.activity.lead_from_behind_id) {
          totalCharacterLevel += character.level / 2;
        } else {
          totalCharacterLevel += character.level;
        }

        let conValue = getCharacterStat(character, CharacterStat.Constitution);
        let willValue = getCharacterStat(character, CharacterStat.Will);
        let className = character.class_name;

        const speeds = getCombatSpeedsForCharacter(character.id);
        const speedIndex = getEncumbranceLevelForCharacter(character.id);
        if (speeds[speedIndex] * 3 < speed) {
          speed = speeds[speedIndex] * 3;
          slowestUnitName = character.name;
        }

        if (getCharacterSupportsV2(character)) {
          const activeComponents = getActiveAbilityComponentsForCharacter(character);
          conValue = getCharacterStatv2(character, CharacterStat.Constitution, activeComponents);
          willValue = getCharacterStatv2(character, CharacterStat.Will, activeComponents);
          className = this.props.allCharacterClasses[character.class_id]?.name ?? "Unknown";
          // TODO: v2 speed calculation, once it exists.
        }

        const cData: CharacterExport = {
          unitIndex: unitIndex++,
          id: character.id,
          name: character.name,
          level: character.level,
          className,
          conBonus: getStatBonusForValue(conValue),
          willBonus: getStatBonusForValue(willValue),
          isLeadFromBehind: this.state.activity.lead_from_behind_id === character.id,
        };
        return cData;
      }),
      platoons: this.state.activity.army_participants.reduce<PlatoonExport[]>((plats, ap) => {
        const sortedTroops = Object.entries(ap.troopCounts).sort((a, b) => {
          const defA = this.props.troopDefs[+a[0]];
          const defB = this.props.troopDefs[+b[0]];
          return defA.name.localeCompare(defB.name);
        });
        sortedTroops.forEach(([troopDefIdString, unitCount]) => {
          const troopDef = this.props.troopDefs[+troopDefIdString];
          if (troopDef.move < speed) {
            speed = troopDef.move;
            slowestUnitName = troopDef.name;
          }

          let remainingUnitCount = unitCount;
          while (remainingUnitCount > 0) {
            const platoonUnitCount = Math.min(remainingUnitCount, troopDef.platoon_size);
            remainingUnitCount -= platoonUnitCount;

            const plat: PlatoonExport = {
              unitIndex: unitIndex++,
              armyId: ap.armyId,
              troopDefId: +troopDefIdString,
              troopName: troopDef.name,
              unitCount: platoonUnitCount,
              armyLevel: troopDef.army_level,
              battleRating:
                platoonUnitCount === troopDef.platoon_size
                  ? troopDef.platoon_br
                  : troopDef.individual_br * platoonUnitCount,
            };

            plats.push(plat);
          }
        });
        return plats;
      }, []),
      participantCount: unitIndex - 1,
      speed,
      slowestUnitName,
      expeditionLevel: Math.floor(totalCharacterLevel / 6),
    };

    return JSON.stringify(data);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const allStorages = state.storages.allStorages;
  const { troopsByArmy, armies: allArmies } = state.armies;
  const troopDefs = state.gameDefs.troops;
  const allCharacterClasses = state.gameDefs.characterClasses;

  return {
    ...props,
    allArmies,
    allCharacters,
    allCharacterClasses,
    allStorages,
    troopsByArmy,
    troopDefs,
  };
}

export const ToolsHexClearingSubPanel = connect(mapStateToProps)(AToolsHexClearingSubPanel);
