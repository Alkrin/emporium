import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { ActivityData, ActivityParticipant, CharacterData, UserData } from "../../serverAPI";
import styles from "./CreateActivitySubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { refetchActivities } from "../../dataSources/ActivitiesDataSource";
import { deleteActivity, deleteOutcomesForActivity, setActiveActivityId } from "../../redux/activitiesSlice";
import dateFormat from "dateformat";
import { UserRole } from "../../redux/userSlice";
import { AbilityDisplayData } from "../characters/EditProficienciesSubPanel";
import { AllProficiencies } from "../../staticData/proficiencies/AllProficiencies";
import { AbilityOrProficiency } from "../../staticData/types/abilitiesAndProficiencies";
import {
  canCharacterFindTraps,
  canCharacterSneak,
  canCharacterTurnUndead,
  doesCharacterHaveMagicWeapons,
  doesCharacterHaveSilverWeapons,
  isCharacterArcane,
  isCharacterDivine,
  isProficiencyUnlockedForCharacter,
} from "../../lib/characterUtils";
import { ActivityPreparednessDisplay } from "./ActivityPreparednessDisplay";

interface State {
  activity: ActivityData;
  filterOwnerId: number;
  filterLocationId: number;
  filterStatus: string;
  filterProficiencyId: string;
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
            resolution_text: a.resolution_text,
          },
          filterOwnerId: -1,
          filterLocationId: -1,
          filterStatus: "Available",
          filterProficiencyId: "",
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
          resolution_text: "",
        },
        filterOwnerId: -1,
        filterLocationId: -1,
        filterStatus: "Available",
        filterProficiencyId: "",
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
            <div className={styles.participantsHeader}>Participants</div>
            <div className={styles.participantsListContainer}>
              {this.getSortedParticipants().map(this.renderParticipantRow.bind(this))}
            </div>
          </div>
          <div className={styles.participantsContainer}>
            <div className={styles.participantsHeader}>Adventurers</div>
            <div className={styles.filtersContainer}>
              <div className={styles.row}>
                <div className={styles.filterText}>Status</div>
                <select
                  className={styles.filterSelector}
                  value={this.state.filterStatus}
                  onChange={(e) => {
                    this.setState({ filterStatus: e.target.value });
                  }}
                >
                  <option value={"Available"}>Available</option>
                  <option value={"Busy"}>Busy</option>
                </select>
              </div>
              <div className={styles.row}>
                <div className={styles.filterText}>Owner</div>
                <select
                  className={styles.filterSelector}
                  value={this.state.filterOwnerId}
                  onChange={(e) => {
                    this.setState({ filterOwnerId: +e.target.value });
                  }}
                >
                  <option value={-1}>Any</option>
                  {this.sortPermittedUsers().map(({ id, name }) => {
                    return (
                      <option value={id} key={`user${name}`}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={styles.row}>
                <div className={styles.filterText}>Location</div>
                <select
                  className={styles.filterSelector}
                  value={this.state.filterLocationId}
                  onChange={(e) => {
                    this.setState({ filterLocationId: +e.target.value });
                  }}
                >
                  <option value={-1}>Any</option>
                </select>
              </div>
              <div className={styles.row}>
                <div className={styles.filterText}>Proficiency</div>
                <select
                  className={styles.filterSelector}
                  value={this.state.filterProficiencyId}
                  onChange={(e) => {
                    this.setState({ filterProficiencyId: e.target.value });
                  }}
                >
                  <option value={""}>Any</option>
                  {this.getSortedProficiencies().map((prof) => {
                    return (
                      <option value={prof.name} key={`prof${prof.name}`}>
                        {prof.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className={styles.adventurersListContainer}>
              {this.getSortedAdventurers().map(this.renderAdventurerRow.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.summarySection}>
          <div className={styles.summaryColumn}>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>Exploration Level:</div>
              <div className={styles.summaryValue}>{this.getExplorationLevelText()}</div>
            </div>
          </div>
          <div className={styles.summaryColumn}>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>Delve Level:</div>
              <div className={styles.summaryValue}>{this.getDelveLevelText()}</div>
            </div>
          </div>
        </div>

        <div className={styles.preparednessContainer}>
          <ActivityPreparednessDisplay participants={this.state.activity.participants} cellSizeVmin={7} />
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

  private getExplorationLevelText(): string {
    const totalLevel: number = this.state.activity.participants.reduce((subtotal, p) => {
      return subtotal + p.characterLevel;
    }, 0);

    return `${totalLevel} / 6 ≈ ${(totalLevel / 6).toFixed(2)} = ${Math.floor(totalLevel / 6)}`;
  }

  private getDelveLevelText(): string {
    const numParticipants = this.state.activity.participants.length;
    const totalLevel: number = this.state.activity.participants.reduce((subtotal, p) => {
      return subtotal + p.characterLevel;
    }, 0);

    return `${totalLevel} / ${Math.max(numParticipants, 4)} ≈ ${(totalLevel / Math.max(numParticipants, 4)).toFixed(
      2
    )} = ${Math.round(totalLevel / Math.max(numParticipants, 4))}`;
  }

  private getSortedParticipants(): CharacterData[] {
    const p: CharacterData[] = this.state.activity.participants.map((p) => {
      return this.props.allCharacters[p.characterId];
    });

    // Sort by level, then by name.
    p.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return p;
  }

  private getSortedAdventurers(): CharacterData[] {
    const p: CharacterData[] = Object.values(this.props.allCharacters).filter((character) => {
      // Exclude the dead.
      if (character.dead) {
        return false;
      }
      // Exclude characters that are already participants.
      if (
        !!this.state.activity.participants.find((p) => {
          return character.id === p.characterId;
        })
      ) {
        return false;
      }

      // Apply Owner filter.
      if (this.state.filterOwnerId > -1 && character.user_id !== this.state.filterOwnerId) {
        return false;
      }

      // TODO: Apply Location filter.

      // Apply Status filter.
      const conflictingActivity = Object.values(this.props.activities).find((activity) => {
        // Look at other activities this character is/was part of.
        if (
          !activity.participants.find((p) => {
            return character.id === p.characterId;
          })
        ) {
          return false;
        }
        // Would any of those overlap with this new activity?
        return (
          Math.max(new Date(activity.start_date).getTime(), new Date(this.state.activity.start_date).getTime()) <=
          Math.min(new Date(activity.end_date).getTime(), new Date(this.state.activity.end_date).getTime())
        );
      });
      if (this.state.filterStatus === "Busy" && !conflictingActivity) {
        return false;
      }
      if (this.state.filterStatus === "Available" && !!conflictingActivity) {
        return false;
      }

      // Apply Proficiency filter.
      if (this.state.filterProficiencyId.length > 0) {
        let subtype: string | undefined = undefined;
        const subtypeMatch = this.state.filterProficiencyId.match(/\(([^)]+)\)/);
        if (subtypeMatch) {
          subtype = subtypeMatch[1];
        }

        let profId: string = "";
        if ((subtype?.length ?? 0) > 0) {
          profId = this.state.filterProficiencyId.slice(0, this.state.filterProficiencyId.indexOf("(")).trim();
        } else {
          profId = this.state.filterProficiencyId;
        }

        if (!isProficiencyUnlockedForCharacter(character.id, profId, subtype)) {
          return false;
        }
      }

      return true;
    });

    // Sort by level, then by name.
    p.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return a.name.localeCompare(b.name);
    });

    return p;
  }

  private renderParticipantRow(character: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`participantRow${index}`}>
        <div className={styles.listLevel}>L{character.level}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.listName}>{character.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onRemoveParticipant.bind(this, character)}>
          -
        </div>
      </div>
    );
  }

  private renderAdventurerRow(character: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`adventurerRow${index}`}>
        <div className={styles.listLevel}>L{character.level}</div>
        <div className={styles.listClass}>{character.class_name}</div>
        <div className={styles.listName}>{character.name}</div>
        <div className={styles.plusMinusButton} onClick={this.onAddParticipant.bind(this, character)}>
          +
        </div>
      </div>
    );
  }

  private onAddParticipant(character: CharacterData): void {
    const newParticipant: ActivityParticipant = {
      characterId: character.id,
      characterLevel: character.level,
      isArcane: isCharacterArcane(character.id),
      isDivine: isCharacterDivine(character.id),
      canTurnUndead: canCharacterTurnUndead(character.id),
      canSneak: canCharacterSneak(character.id),
      canFindTraps: canCharacterFindTraps(character.id),
      hasMagicWeapons: doesCharacterHaveMagicWeapons(character.id),
      hasSilverWeapons: doesCharacterHaveSilverWeapons(character.id),
    };
    const participants = [...this.state.activity.participants, newParticipant];
    const activity: ActivityData = {
      ...this.state.activity,
      participants,
    };
    this.setState({ activity });
  }

  private onRemoveParticipant(character: CharacterData): void {
    const participants = this.state.activity.participants.filter((p) => {
      return p.characterId !== character.id;
    });
    const activity: ActivityData = {
      ...this.state.activity,
      participants,
    };
    this.setState({ activity });
  }

  private sortPermittedUsers(): UserData[] {
    const permittedUsers = Object.values(this.props.users)
      .filter((user) => {
        if (this.props.activeRole !== "player") {
          return true;
        } else {
          return user.id === this.props.currentUserId;
        }
      })
      .sort();

    return permittedUsers;
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

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
      this.setState({ isSaving: false });
      return;
    }

    if (this.props.isEditMode) {
      // Edit the activity.
      const res = await ServerAPI.editActivity(this.state.activity);
    } else {
      // Send it to the server!
      const res = await ServerAPI.createActivity(this.state.activity);
      // Select the newly created activity.
      if ("insertId" in res) {
        this.props.dispatch?.(setActiveActivityId(res.insertId));
      }
    }
    this.setState({ isSaving: false });
    // Refetch activities.
    if (this.props.dispatch) {
      await refetchActivities(this.props.dispatch);
    }

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

  private getSortedProficiencies(): AbilityDisplayData[] {
    const data: AbilityDisplayData[] = [];

    Object.values(AllProficiencies).forEach((def) => {
      // If the filter lists subtypes, iterate those.
      // If the filter doesn't list subtypes but the def does, iterate those.
      // If the def has no subtypes, just make a single displayData.
      let subtypesToIterate: string[] = def.subTypes ?? [];

      if (subtypesToIterate.length === 0) {
        // Single standard proficiency, no subtypes.
        data.push(this.buildDisplayDataForProficiency(def));
      } else {
        // Has subtype(s).  One entry for each.
        subtypesToIterate.forEach((subtype) => {
          data.push(this.buildDisplayDataForProficiency(def, subtype));
        });
      }
    });

    // Sort the proficiencies by name.
    data.sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return data;
  }

  private buildDisplayDataForProficiency(def: AbilityOrProficiency, subtype?: string): AbilityDisplayData {
    let displayName: string = def.name;
    if (subtype && subtype.length > 0) {
      displayName = `${def.name} (${subtype})`;
    }

    const data: AbilityDisplayData = {
      name: displayName,
      def,
      rank: 1,
      subtype,
    };
    return data;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities, activeActivityId } = state.activities;
  const allCharacters = state.characters.characters;
  const { activeRole } = state.hud;
  const { users } = state.user;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    activities,
    activeActivityId,
    allCharacters,
    activeRole,
    users,
  };
}

export const CreateActivitySubPanel = connect(mapStateToProps)(ACreateActivitySubPanel);
