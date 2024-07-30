import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  ActivityData,
  ActivityAdventurerParticipant,
  CharacterData,
  LocationData,
  UserData,
  ArmyData,
  TroopDefData,
  ActivityArmyParticipant,
  ActivityOutcomeData,
  ActivityOutcomeType,
} from "../../serverAPI";
import styles from "./CreateActivitySubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { refetchActivities, refetchExpectedOutcomes } from "../../dataSources/ActivitiesDataSource";
import { deleteActivity, deleteOutcomesForActivity, setActiveActivityId } from "../../redux/activitiesSlice";
import dateFormat from "dateformat";
import { UserRole } from "../../redux/userSlice";
import { AbilityDisplayData } from "../characters/EditProficienciesSubPanel";
import { AbilityOrProficiency } from "../../staticData/types/abilitiesAndProficiencies";
import { ActivityPreparednessDisplay } from "./ActivityPreparednessDisplay";
import { FilterType, FilterValueAny, FilterValueBusyStatus, FilterValues } from "../FilterDropdowns";
import { EditButton } from "../EditButton";
import { SelectAdventurersDialog } from "../dialogs/SelectAdventurersDialog";
import {
  convertActivityOutcomeForServer,
  createActivityAdventurerParticipant,
  createActivityArmyParticipant,
  getDisallowedTypesFromOutcomes,
  sortActivityOutcomes,
} from "../../lib/activityUtils";
import { SelectArmiesDialog } from "../dialogs/SelectArmiesDialog";
import { getBattleRatingForTroopDefAndCount } from "../../lib/armyUtils";
import { getCombatSpeedsForCharacter, getEncumbranceLevelForCharacter } from "../../lib/characterUtils";
import { CreateActivityOutcomeDialog } from "./CreateActivityOutcomeDialog";
import { ActivityOutcomesList } from "./ActivityOutcomeList";

interface State {
  activity: ActivityData;
  expectedOutcomes: ActivityOutcomeData[];
  filters: FilterValues;
  isSaving: boolean;
}

interface ReactProps {
  isEditMode?: boolean;
  isClone?: boolean;
}

interface InjectedProps {
  currentUserId: number;
  activeActivityId: number;
  activities: Dictionary<ActivityData>;
  allCharacters: Dictionary<CharacterData>;
  activeRole: UserRole;
  users: Dictionary<UserData>;
  allLocations: Dictionary<LocationData>;
  allArmies: Dictionary<ArmyData>;
  troopDefs: Dictionary<TroopDefData>;
  expectedOutcomesByActivity: Dictionary<ActivityOutcomeData[]>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateActivitySubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.isEditMode || props.isClone) {
      if (props.activeActivityId > 0) {
        // Load the selected activity.
        const a = props.activities[props.activeActivityId];
        this.state = {
          activity: {
            // When cloning, we copy everything except the id.
            id: props.isClone ? -1 : a.id,
            user_id: a.user_id,
            name: a.name,
            description: a.description,
            start_date: a.start_date,
            end_date: a.end_date,
            participants: [...a.participants],
            army_participants: [...a.army_participants],
            lead_from_behind_id: a.lead_from_behind_id,
          },
          expectedOutcomes: (props.expectedOutcomesByActivity[props.activeActivityId] ?? [])
            .map((eo) => {
              // Copy so we don't directly alter the originals.
              const outcome: ActivityOutcomeData = { ...eo };
              return outcome;
            })
            .sort(sortActivityOutcomes),
          filters: {
            [FilterType.Owner]: FilterValueAny,
            [FilterType.Location]: FilterValueAny,
            [FilterType.BusyStatus]: FilterValueBusyStatus.Available,
            [FilterType.Proficiency]: FilterValueAny,
          },
          isSaving: false,
        };
      }
    } else {
      // Start with blank activity data.
      this.state = {
        activity: {
          id: -1,
          user_id: props.currentUserId,
          name: "",
          description: "",
          start_date: dateFormat(new Date(), "yyyy-mm-dd"),
          end_date: dateFormat(new Date(), "yyyy-mm-dd"),
          participants: [],
          army_participants: [],
          lead_from_behind_id: 0,
        },
        expectedOutcomes: [],
        filters: {
          [FilterType.Owner]: FilterValueAny,
          [FilterType.Location]: FilterValueAny,
          [FilterType.BusyStatus]: FilterValueBusyStatus.Available,
          [FilterType.Proficiency]: FilterValueAny,
        },
        isSaving: false,
      };
    }
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;
    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>
          {this.props.isEditMode
            ? `Editing Activity #${this.props.activeActivityId}: ${
                this.props.activities[this.props.activeActivityId].name
              }`
            : "Create New Activity"}
        </div>
        <div className={styles.contentRow}>
          <div className={styles.label}>Name</div>
        </div>
        <input
          className={styles.nameTextField}
          type={"text"}
          value={this.state.activity.name}
          onChange={(e) => {
            const activity: ActivityData = { ...this.state.activity, name: e.target.value };
            this.setState({ activity });
          }}
          tabIndex={nextTabIndex++}
          spellCheck={false}
          autoFocus={true}
        />

        <div className={styles.contentRow}>
          <div className={styles.label}>Description</div>
        </div>

        <textarea
          className={styles.descriptionTextField}
          value={this.state.activity.description}
          onChange={(e) => {
            const activity: ActivityData = { ...this.state.activity, description: e.target.value };
            this.setState({ activity });
          }}
          tabIndex={nextTabIndex++}
          spellCheck={false}
        />

        <div className={styles.dateRow}>
          <div className={styles.label}>Start Date</div>
          <input
            type={"date"}
            value={this.state.activity.start_date}
            onChange={(e) => {
              const activity: ActivityData = {
                ...this.state.activity,
                start_date: e.target.value,
              };
              this.setState({ activity });
            }}
          />
          <div className={styles.label}>End Date</div>
          <input
            type={"date"}
            value={this.state.activity.end_date}
            onChange={(e) => {
              const activity: ActivityData = {
                ...this.state.activity,
                end_date: e.target.value,
              };
              this.setState({ activity });
            }}
          />
        </div>

        <div className={styles.participantsSection}>
          <div className={styles.participantsContainer}>
            <div className={styles.participantsHeader}>
              <div
                className={styles.participantsHeaderLabel}
              >{`Adventurers: ${this.state.activity.participants.length}`}</div>
              <EditButton className={styles.editButton} onClick={this.onEditAdventurersClicked.bind(this)} />
            </div>
            <div className={styles.participantsListContainer}>
              {this.getSortedAdventurerParticipants().map(this.renderAdventurerParticipantRow.bind(this))}
            </div>
            <div className={styles.row}>
              <div className={styles.firstLabel}>{"Lead from Behind?"}</div>
              <select
                className={styles.leadFromBehindSelector}
                value={this.state.activity.lead_from_behind_id}
                onChange={(e) => {
                  this.setState({
                    activity: {
                      ...this.state.activity,
                      lead_from_behind_id: +e.target.value,
                    },
                  });
                }}
              >
                <option value={0}>---</option>
                {this.getSortedAdventurerParticipants().map(({ characterId }) => {
                  const character = this.props.allCharacters[characterId];
                  return (
                    <option value={characterId} key={`user${character?.name}`}>
                      {character?.name ?? "Unknown"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className={styles.participantsContainer}>
            <div className={styles.participantsHeader}>
              <div className={styles.participantsHeaderLabel}>{"Armies"}</div>
              <EditButton className={styles.editButton} onClick={this.onEditArmiesClicked.bind(this)} />
            </div>
            <div className={styles.adventurersListContainer}>
              {this.getSortedArmyParticipants().map(this.renderArmyParticipantRows.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.summarySection}>
          <div className={styles.summaryColumn}>
            <div className={styles.row}>
              <div className={styles.characterSummaryLabel}>{"Exploration Level:"}</div>
              <div className={styles.summaryValue}>{this.getExplorationLevelText()}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.characterSummaryLabel}>{"Delve Level:"}</div>
              <div className={styles.summaryValue}>{this.getDelveLevelText()}</div>
            </div>
          </div>
          <div className={styles.summaryColumn}>
            <div className={styles.row}>
              <div className={styles.characterSummaryLabel}>{"Battle Rating:"}</div>
              <div className={styles.summaryValue}>{this.getBattleRatingText()}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.characterSummaryLabel}>{"Exploration Speed:"}</div>
              <div className={styles.summaryValue}>{this.getTravelSpeedText()}</div>
            </div>
          </div>
        </div>

        <div className={styles.preparednessContainer}>
          <ActivityPreparednessDisplay participants={this.state.activity.participants} cellSizeVmin={6} />
        </div>

        <div className={styles.expectedOutcomesPanel}>
          <div className={styles.expectedOutcomesExplanationPanel}>
            <div className={styles.expectedOutcomesHeader}>{"Expected Outcomes"}</div>
            <EditButton
              className={styles.expectedOutcomesAddButton}
              onClick={this.onAddExpectedOutcomeClicked.bind(this)}
            />
            <div className={styles.expectedOutcomesDescription}>
              {"If there are any expected outcomes for this activity, they can be prepared in advance.  " +
                "As much data as is entered will be used to pre-populate the actual outcomes during activity resolution."}
            </div>
          </div>
          <ActivityOutcomesList
            className={styles.expectedOutcomesListContainer}
            outcomes={this.state.expectedOutcomes}
            canEdit={true}
            onEditRowClicked={this.onEditExpectedOutcomeClicked.bind(this)}
            onDeleteRowClicked={this.onDeleteExpectedOutcomeClicked.bind(this)}
          />
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
            {this.props.isEditMode ? "Save Changes" : "Save Activity"}
          </div>

          {this.props.isEditMode && (
            <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
              Delete
            </div>
          )}
        </div>

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private onDeleteExpectedOutcomeClicked(data: ActivityOutcomeData, index: number): void {
    this.setState({ expectedOutcomes: this.state.expectedOutcomes.filter((_, findex) => findex !== index) });
  }

  private onEditExpectedOutcomeClicked(data: ActivityOutcomeData, index: number): void {
    this.props.dispatch?.(
      showModal({
        id: "EditExpectedOutcome",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.state.activity}
              initialValues={data}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                const newOutcomes = [...this.state.expectedOutcomes];
                newOutcomes[index] = outcome;
                this.setState({ expectedOutcomes: newOutcomes.sort(sortActivityOutcomes) });
              }}
            />
          );
        },
      })
    );
  }

  private onAddExpectedOutcomeClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "AddExpectedOutcome",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.state.activity}
              disallowedTypes={getDisallowedTypesFromOutcomes(this.state.expectedOutcomes)}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                this.setState({
                  expectedOutcomes: [...this.state.expectedOutcomes, outcome].sort(sortActivityOutcomes),
                });
              }}
            />
          );
        },
      })
    );
  }

  private onEditAdventurersClicked(): void {
    // Show a modal to select / edit the adventurer list.
    this.props.dispatch?.(
      showModal({
        id: "Adventurers",
        widthVmin: 60,
        content: () => {
          return (
            <SelectAdventurersDialog
              startDateOverride={this.state.activity.start_date}
              endDateOverride={this.state.activity.end_date}
              preselectedAdventurerIDs={this.state.activity.participants.map((p) => {
                return p.characterId;
              })}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                // If the leadFromBehind character is no longer participating, clear them from the leadFromBehind slot.
                if (!adventurerIDs.includes(this.state.activity.lead_from_behind_id)) {
                  this.setState({ activity: { ...this.state.activity, lead_from_behind_id: 0 } });
                }
                // And change the participant list itself, of course.
                this.updateAdventurerParticipants(adventurerIDs);
              }}
            />
          );
        },
      })
    );
  }

  private onEditArmiesClicked(): void {
    // Show a modal to select / edit the army list.
    this.props.dispatch?.(
      showModal({
        id: "Armies",
        widthVmin: 60,
        content: () => {
          const armyIDs: Dictionary<number> = {};
          this.state.activity.army_participants.forEach((p) => {
            armyIDs[p.armyId] = p.armyId;
          });
          return (
            <SelectArmiesDialog
              startDateOverride={this.state.activity.start_date}
              endDateOverride={this.state.activity.end_date}
              preselectedArmyIDs={Object.values(armyIDs)}
              onSelectionConfirmed={(armyIDs: number[]) => {
                this.updateArmyParticipants(armyIDs);
              }}
            />
          );
        },
      })
    );
  }

  private updateAdventurerParticipants(adventurerIDs: number[]): void {
    const participants = adventurerIDs.map((aid) => createActivityAdventurerParticipant(aid));
    const activity: ActivityData = {
      ...this.state.activity,
      participants,
    };
    this.setState({ activity });
  }

  private updateArmyParticipants(armyIDs: number[]): void {
    const army_participants = armyIDs.map((aid) => createActivityArmyParticipant(aid, this.state.activity.start_date));
    const activity: ActivityData = {
      ...this.state.activity,
      army_participants,
    };
    this.setState({ activity });
  }

  private getExplorationLevelText(): string {
    const totalLevel: number = this.state.activity.participants.reduce((subtotal, p) => {
      if (p.characterId === this.state.activity.lead_from_behind_id) {
        return subtotal + p.characterLevel / 2;
      } else {
        return subtotal + p.characterLevel;
      }
    }, 0);

    return `${totalLevel} / 6 ≈ ${(totalLevel / 6).toFixed(2)} = ${Math.floor(totalLevel / 6)}`;
  }

  private getDelveLevelText(): string {
    const numParticipants = this.state.activity.participants.length;
    const totalLevel: number = this.state.activity.participants.reduce((subtotal, p) => {
      if (p.characterId === this.state.activity.lead_from_behind_id) {
        return subtotal + p.characterLevel / 2;
      } else {
        return subtotal + p.characterLevel;
      }
    }, 0);

    return `${totalLevel} / ${Math.max(numParticipants, 4)} ≈ ${(totalLevel / Math.max(numParticipants, 4)).toFixed(
      2
    )} = ${Math.round(totalLevel / Math.max(numParticipants, 4))}`;
  }

  private getBattleRatingText(): string {
    const totalBR = this.state.activity.army_participants.reduce<number>(
      (totalBRSoFar: number, armyParticipant: ActivityArmyParticipant, armyIndex: number) => {
        const participantBR = Object.entries(armyParticipant.troopCounts).reduce<number>(
          (armyBRSoFar: number, entry: [string, number], troopIndex) => {
            const defId = +entry[0];
            const count = entry[1];
            return armyBRSoFar + getBattleRatingForTroopDefAndCount(defId, count);
          },
          0
        );
        return totalBRSoFar + participantBR;
      },
      0
    );

    return totalBR.toFixed(2);
  }

  private getTravelSpeedText(): string {
    let slowestAdventurerSpeed = this.state.activity.participants.reduce<number>(
      (slowestSoFar: number, participant: ActivityAdventurerParticipant) => {
        const speeds = getCombatSpeedsForCharacter(participant.characterId);
        const speedIndex = getEncumbranceLevelForCharacter(participant.characterId);
        const currentSpeed = speeds[speedIndex];

        if (slowestSoFar === 0) {
          return currentSpeed;
        } else {
          return Math.min(slowestSoFar, currentSpeed);
        }
      },
      0
    );

    const armySpeeds = this.state.activity.army_participants.map((armyParticipant) => {
      const speed = Object.keys(armyParticipant.troopCounts).reduce<number>(
        (lowestSpeed: number, troopDefIdString: string) => {
          const def = this.props.troopDefs[+troopDefIdString];
          if (lowestSpeed === 0) {
            return def.move;
          } else {
            return Math.min(def.move, lowestSpeed);
          }
        },
        0
      );
      return speed;
    });
    const slowestArmySpeed =
      armySpeeds.reduce((slowest: number, currentSpeed: number) => {
        if (slowest === 0) {
          return currentSpeed;
        } else {
          return Math.min(slowest, currentSpeed);
        }
        // Have to divide by 3 because troopDefs list the exploration speed, while adventurers give a combat speed.
      }, 0) / 3;

    let slowestSpeed = Math.min(slowestAdventurerSpeed, slowestArmySpeed);
    if (this.state.activity.participants.length === 0) {
      slowestSpeed = slowestArmySpeed;
    }
    if (this.state.activity.army_participants.length === 0) {
      slowestSpeed = slowestAdventurerSpeed;
    }

    // Exploration speed is 3x combat speed.
    // Overland hex speed is 1/10th of combat speed.

    return `${3 * slowestSpeed}' or ${slowestSpeed / 10} hex/day`;
  }

  private getSortedAdventurerParticipants(): ActivityAdventurerParticipant[] {
    const sorted = [...this.state.activity.participants].sort((a, b) => {
      const characterA = this.props.allCharacters[a.characterId];
      const characterB = this.props.allCharacters[b.characterId];

      // Sort by level first.  Highest levels at the top.
      if (characterA.level !== characterB.level) {
        return characterB.level - characterA.level;
      }
      return characterA.name.localeCompare(characterB.name);
    });

    return sorted;
  }

  private getSortedArmyParticipants(): ActivityArmyParticipant[] {
    const sorted = [...this.state.activity.army_participants].sort((a, b) => {
      const armyA = this.props.allArmies[a.armyId];
      const armyB = this.props.allArmies[b.armyId];
      return armyA.name.localeCompare(armyB.name);
    });

    return sorted;
  }

  private renderAdventurerParticipantRow(participant: ActivityAdventurerParticipant, index: number): React.ReactNode {
    const character = this.props.allCharacters[participant.characterId];
    return (
      <div className={styles.listRow} key={`adventurerParticipantRow${index}`}>
        <div className={styles.listLevel}>{`L${character.level}`}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.listName}>{character.name}</div>
      </div>
    );
  }

  private renderArmyParticipantRows(participant: ActivityArmyParticipant, index: number): React.ReactNode {
    const army = this.props.allArmies[participant.armyId];
    const sortedTroops = Object.entries(participant.troopCounts).sort((a, b) => {
      const defA = this.props.troopDefs[+a[0]];
      const defB = this.props.troopDefs[+b[0]];
      return defA.name.localeCompare(defB.name);
    });
    const totalBR: number = sortedTroops.reduce<number>((brSoFar: number, entry: [string, number]) => {
      const defId = +entry[0];
      const count = entry[1];
      return brSoFar + getBattleRatingForTroopDefAndCount(defId, count);
    }, 0);
    return (
      <div className={styles.armyListSection} key={`army${index}`}>
        <div className={styles.armyListRow} key={`armyParticipantRow${index}`}>
          <div className={styles.listBattleRating}>{`BR: ${totalBR.toFixed(2)}`}</div>
          <div className={styles.listArmyName}>{army.name}</div>
        </div>
        {sortedTroops.map(([defIdString, count], troopIndex) => {
          const troopDef = this.props.troopDefs[+defIdString];
          return (
            <div className={styles.armyTroopRow} key={`troop${troopIndex}`}>
              <div className={styles.listTroopCount}>{`${count}×\xa0`}</div>
              <div className={styles.listName}>{troopDef.name}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // Valid name?
    if (this.state.activity.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: {
            title: "Error!",
            message: "Please enter a Name for this activity!",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    if (this.props.isEditMode) {
      // Edit the activity.
      const res = await ServerAPI.editActivity(
        this.state.activity,
        this.state.expectedOutcomes.map(convertActivityOutcomeForServer)
      );
    } else {
      // Send it to the server!
      const res = await ServerAPI.createActivity(
        this.state.activity,
        this.state.expectedOutcomes.map(convertActivityOutcomeForServer)
      );
      // Select the newly created activity.
      if (Array.isArray(res) && "insertId" in res[0]) {
        this.props.dispatch?.(setActiveActivityId(res[0].insertId));
      }
    }

    // Refetch activities.
    if (this.props.dispatch) {
      await refetchActivities(this.props.dispatch);
      await refetchExpectedOutcomes(this.props.dispatch);
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Confirmation dialog.
    this.props.dispatch?.(
      showModal({
        id: "DeleteActivityConfirmation",
        content: {
          title: "Delete Activity",
          message: `Are you sure you wish to delete #${this.state.activity.id}: ${this.state.activity.name}?  This will also destroy associated outcome records.  Deletion cannot be undone.`,
          buttonText: "Delete",
          onButtonClick: async () => {
            // Guaranteed true, but have to check to make intellisense shut up.
            if (this.props.activeActivityId) {
              const res = await ServerAPI.deleteActivity(this.props.activeActivityId);

              // Get rid of the confirmation modal.
              this.props.dispatch?.(hideModal());
              if ("error" in res) {
                // Error modal.
                this.props.dispatch?.(
                  showModal({
                    id: "DeleteActivityError",
                    content: { title: "Error", message: "An Error occurred during activity deletion." },
                  })
                );
              } else {
                // Close the subPanel.
                this.props.dispatch?.(hideSubPanel());
                // Delay so the subpanel is fully gone before we clear out the local character data.
                setTimeout(() => {
                  // Guaranteed true, but have to check to make intellisense shut up.
                  if (this.props.activeActivityId) {
                    // Deselect the character.
                    this.props.dispatch?.(setActiveActivityId(0));

                    // Update all local data.
                    // Outcomes
                    this.props.dispatch?.(deleteOutcomesForActivity(this.props.activeActivityId));
                    // The activity itself.
                    this.props.dispatch?.(deleteActivity(this.props.activeActivityId));
                  }
                }, 300);
              }
              this.setState({ isSaving: false });
            }
          },
          extraButtons: [
            {
              text: "Cancel",
              onClick: () => {
                this.props.dispatch?.(hideModal());
                this.setState({ isSaving: false });
              },
            },
          ],
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities, activeActivityId, expectedOutcomesByActivity } = state.activities;
  const allCharacters = state.characters.characters;
  const { activeRole } = state.hud;
  const { users } = state.user;
  const allLocations = state.locations.locations;
  const allArmies = state.armies.armies;
  const troopDefs = state.gameDefs.troops;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    activities,
    activeActivityId,
    allCharacters,
    activeRole,
    users,
    allLocations,
    allArmies,
    troopDefs,
    expectedOutcomesByActivity,
  };
}

export const CreateActivitySubPanel = connect(mapStateToProps)(ACreateActivitySubPanel);
