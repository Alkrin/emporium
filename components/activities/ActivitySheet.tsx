import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import {
  ActivityAdventurerParticipant,
  ActivityArmyParticipant,
  ActivityData,
  ActivityOutcomeData,
  ArmyData,
  CharacterData,
  TroopDefData,
} from "../../serverAPI";
import styles from "./ActivitySheet.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { ActivityPreparednessDisplay } from "./ActivityPreparednessDisplay";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { ActivityResolutionSubPanel } from "./ActivityResolutionSubPanel";
import { ActivityOutcomesList } from "./ActivityOutcomeList";
import { CreateActivitySubPanel } from "./CreateActivitySubPanel";
import { SheetRoot } from "../SheetRoot";
import { getBattleRatingForTroopDefAndCount } from "../../lib/armyUtils";
import { getCombatSpeedsForCharacter, getEncumbranceLevelForCharacter } from "../../lib/characterUtils";
import { sortActivityOutcomes } from "../../lib/activityUtils";

interface ReactProps {
  activityId: number;
  exiting: boolean;
}

interface InjectedProps {
  allActivities: Dictionary<ActivityData>;
  allArmies: Dictionary<ArmyData>;
  allCharacters: Dictionary<CharacterData>;
  activity?: ActivityData;
  outcomes: ActivityOutcomeData[];
  expectedOutcomes: ActivityOutcomeData[];
  troopDefs: Dictionary<TroopDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivitySheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    if (this.props.activity) {
      // Dates are stored in UTC, so we have to pretend we are in a UTC time zone, else display is wrong.
      const localStartDate = new Date(this.props.activity.start_date);
      let localStartDateTime = localStartDate.getTime() + localStartDate.getTimezoneOffset() * 60000;
      const localEndDate = new Date(this.props.activity.end_date);
      let localEndDateTime = localEndDate.getTime() + localEndDate.getTimezoneOffset() * 60000;
      return (
        <SheetRoot className={`${styles.root} ${animationClass}`}>
          <div className={styles.nameLabel}>{`#${this.props.activity.id}: ${this.props.activity.name}`}</div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>{"Start:"}</div>
            <div className={styles.dateValue}>{dateFormat(localStartDateTime, "d. mmm yyyy")}</div>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>{"Exploration Level:"}</div>
              <div className={styles.summaryValue}>{this.getExplorationLevelText()}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>{"End:"}</div>
            <div className={styles.dateValue}>{dateFormat(localEndDateTime, "d. mmm yyyy")}</div>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>{"Delve Level:"}</div>
              <div className={styles.summaryValue}>{this.getDelveLevelText()}</div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.dateLabel}>{"Move:"}</div>
            <div className={styles.dateValue}>{this.getTravelSpeedText()}</div>
            <div className={styles.row}>
              <div className={styles.summaryLabel}>{"Battle Rating:"}</div>
              <div className={styles.summaryValue}>{this.getBattleRatingText()}</div>
            </div>
          </div>
          <textarea
            className={styles.descriptionTextField}
            value={this.props.activity.description}
            disabled
            spellCheck={false}
          />
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={styles.headerLabel}>{`Adventurers: ${this.props.activity.participants.length}`}</div>
              <div className={styles.participantsList}>
                {this.getSortedAdventurerParticipants().map(this.renderAdventurerParticipantRow.bind(this))}
              </div>
              <div className={styles.row}>
                <div className={styles.normalText}>{"Lead from Behind?\xa0"}</div>
                <div className={styles.valueText}>
                  {this.props.activity?.lead_from_behind_id
                    ? this.props.allCharacters[this.props.activity.lead_from_behind_id].name
                    : "---"}
                </div>
              </div>
            </div>
            <div className={styles.column} style={{ marginLeft: "1vmin" }}>
              <div className={styles.headerLabel}>{"Armies"}</div>
              <div className={styles.participantsList}>
                {this.getSortedArmyParticipants().map(this.renderArmyParticipantRows.bind(this))}
              </div>
            </div>
          </div>
          <div className={styles.preparednessContainer}>
            <ActivityPreparednessDisplay participants={this.props.activity.participants} cellSizeVmin={5} />
          </div>

          <div className={styles.outcomesContainer}>
            <div className={styles.normalText}>{this.props.outcomes.length > 0 ? "Outcomes" : "Expected Outcomes"}</div>
            <ActivityOutcomesList
              className={styles.outcomesList}
              outcomes={
                this.props.outcomes.length > 0
                  ? [...this.props.outcomes].sort(sortActivityOutcomes)
                  : [...this.props.expectedOutcomes].sort(sortActivityOutcomes)
              }
              canEdit={false}
            />
          </div>

          <div className={styles.buttonRow}>
            <div className={styles.actionButton} onClick={this.onResolveClicked.bind(this)}>
              {this.props.outcomes.length > 0 ? "Clone Activity" : "Resolve Activity"}
            </div>
          </div>
        </SheetRoot>
      );
    } else {
      return (
        <SheetRoot className={`${styles.root} ${animationClass}`}>
          <div className={styles.placeholder} />
        </SheetRoot>
      );
    }
  }

  private onResolveClicked(): void {
    if (this.props.activity) {
      if (this.props.outcomes.length > 0) {
        // Open the activityCreator in edit mode.
        this.props.dispatch?.(
          showSubPanel({
            id: "CloneActivity",
            content: () => {
              return <CreateActivitySubPanel isClone />;
            },
            escapable: true,
          })
        );
      } else {
        this.props.dispatch?.(
          showSubPanel({
            id: "ActivityResolution",
            content: () => {
              return <ActivityResolutionSubPanel />;
            },
          })
        );
      }
    }
  }

  private getExplorationLevelText(): string {
    if (!this.props.activity) {
      return "";
    } else {
      const totalLevel: number = this.props.activity.participants.reduce((subtotal, p) => {
        if (p.characterId === this.props.activity?.lead_from_behind_id) {
          return subtotal + p.characterLevel / 2;
        } else {
          return subtotal + p.characterLevel;
        }
      }, 0);

      return `${totalLevel} / 6 ≈ ${(totalLevel / 6).toFixed(2)} = ${Math.floor(totalLevel / 6)}`;
    }
  }

  private getDelveLevelText(): string {
    if (!this.props.activity) {
      return "";
    } else {
      const numParticipants = this.props.activity.participants.length;
      const totalLevel: number = this.props.activity.participants.reduce((subtotal, p) => {
        if (p.characterId === this.props.activity?.lead_from_behind_id) {
          return subtotal + p.characterLevel / 2;
        } else {
          return subtotal + p.characterLevel;
        }
      }, 0);

      return `${totalLevel} / ${Math.max(numParticipants, 4)} ≈ ${(totalLevel / Math.max(numParticipants, 4)).toFixed(
        2
      )} = ${Math.round(totalLevel / Math.max(numParticipants, 4))}`;
    }
  }

  private getBattleRatingText(): string {
    if (this.props.activity) {
      const totalBR = this.props.activity.army_participants.reduce<number>(
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
    } else {
      return "";
    }
  }

  private getTravelSpeedText(): string {
    if (this.props.activity) {
      let slowestAdventurerSpeed = this.props.activity.participants.reduce<number>(
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

      const armySpeeds = this.props.activity.army_participants.map((armyParticipant) => {
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
      if (this.props.activity.participants.length === 0) {
        slowestSpeed = slowestArmySpeed;
      }
      if (this.props.activity.army_participants.length === 0) {
        slowestSpeed = slowestAdventurerSpeed;
      }

      // Exploration speed is 3x combat speed.
      // Overland hex speed is 1/10th of combat speed.

      return `${3 * slowestSpeed}' or ${slowestSpeed / 10} hex/day`;
    } else {
      return "";
    }
  }

  private getSortedAdventurerParticipants(): ActivityAdventurerParticipant[] {
    const participants = [...(this.props.activity?.participants ?? [])];
    const sorted = participants.sort((a, b) => {
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
    const sorted = [...(this.props.activity?.army_participants ?? [])].sort((a, b) => {
      const armyAName = this.props.allArmies[a.armyId]?.name ?? "Disbanded Army";
      const armyBName = this.props.allArmies[b.armyId]?.name ?? "Disbanded Army";
      return armyAName.localeCompare(armyBName);
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
          <div className={styles.listArmyName}>{army?.name ?? "Disbanded Army"}</div>
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
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities: allActivities } = state.activities;
  const activity = allActivities[props.activityId] ?? null;
  const allCharacters = state.characters.characters;
  const outcomes = state.activities.outcomesByActivity[props.activityId] ?? [];
  const expectedOutcomes = state.activities.expectedOutcomesByActivity[props.activityId] ?? [];
  const troopDefs = state.gameDefs.troops;
  const allArmies = state.armies.armies;
  return {
    ...props,
    allActivities,
    allArmies,
    activity,
    allCharacters,
    outcomes,
    expectedOutcomes,
    troopDefs,
  };
}

export const ActivitySheet = connect(mapStateToProps)(AActivitySheet);
