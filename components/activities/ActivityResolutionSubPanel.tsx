import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { ActivityData, ActivityOutcomeData, ActivityOutcomeType, CharacterData } from "../../serverAPI";
import styles from "./ActivityResolutionSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { refetchActivities, refetchActivityOutcomes } from "../../dataSources/ActivitiesDataSource";
import { getCampaignXPDeductibleCapForLevel, getCharacterXPMultiplier } from "../../lib/characterUtils";
import { ActivityOutcomesList } from "./ActivityOutcomeList";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchItems } from "../../dataSources/ItemsDataSource";

enum Distro {
  // Even distribution to all participants.  Henchman hierarchy is ignored, and only local participants get a share.
  Equal = "equal",
  // For xp, if your henchmaster is in the group, you get 1 share.  If you not, you get 2 shares.
  // For gold, participants start from equal shares, then give half of their loot to their henchmaster, recursively.
  Hench = "hench",
}

interface State {
  pageIndex: number;
  // ResolutionPage state
  resolutionText: string;
  // MonsterXPPage state
  mxp: number;
  xpDistro: Distro;
  // GoldPage state
  gpWithXp: number;
  gpWithoutXp: number;
  gpDistro: Distro;

  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  activeActivityId: number;
  activities: Dictionary<ActivityData>;
  allCharacters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivityResolutionSubPanel extends React.Component<Props, State> {
  private pages = [
    () => {
      return this.renderResolutionPage();
    },
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      pageIndex: 0,
      resolutionText: "",
      mxp: 0,
      xpDistro: Distro.Equal,
      gpWithXp: 0,
      gpWithoutXp: 0,
      gpDistro: Distro.Hench,
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const activity = this.props.activities[this.props.activeActivityId];
    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{"Resolving Activity"}</div>
        <div className={styles.subtitleLabel}>{`#${activity.id}: ${activity.name}`}</div>

        {this.pages[this.state.pageIndex]()}

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderResolutionPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>Describe the outcome of the event.</div>
        <textarea
          className={styles.resolutionTextField}
          value={this.state.resolutionText}
          onChange={(e) => {
            this.setState({ resolutionText: e.target.value });
          }}
          spellCheck={false}
        />
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onResolutionPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onResolutionPageNextClick(): void {
    // Valid data?
    if (this.state.resolutionText.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoResolutionError",
          content: {
            title: "Error!",
            message: "Please enter a Resolution description for this activity!",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderMonsterXPPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderMonsterXPPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>
          {"How much total combat XP was gained by the party? (usually by killing monsters)"}
        </div>
        <input
          className={styles.numberField}
          type={"number"}
          value={this.state.mxp}
          onChange={(e) => {
            if (e.target.value.trim().length === 0) {
              this.setState({ mxp: undefined as any });
            } else {
              this.setState({ mxp: +e.target.value });
            }
          }}
        />
        <div className={styles.centerLabel}>{"If any, how should that XP be distributed?"}</div>
        <div className={styles.radioGroup}>
          <div className={styles.row}>
            <input
              className={styles.radioButton}
              type="radio"
              value={Distro.Equal}
              name="xpDistro"
              checked={this.state.xpDistro === Distro.Equal}
              onChange={(e) => {
                this.setState({ xpDistro: e.target.value as Distro });
              }}
            />
            <span className={styles.radioLabel}>Equally to all participants</span>
          </div>
          <div className={styles.row}>
            <input
              className={styles.radioButton}
              type="radio"
              value={Distro.Hench}
              name="xpDistro"
              checked={this.state.xpDistro === Distro.Hench}
              onChange={(e) => {
                this.setState({ xpDistro: e.target.value as Distro });
              }}
            />
            <span className={styles.radioLabel}>Henchmasters get two shares, henchmen get one</span>
          </div>
        </div>
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onMonsterXPPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onMonsterXPPageNextClick(): void {
    // Valid data?
    if (this.state.mxp < 0) {
      this.props.dispatch?.(
        showModal({
          id: "NegativeXPError",
          content: {
            title: "Error!",
            message: "XP earned cannot be negative.",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderGoldPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderGoldPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>{"How much GP that grants XP was gained?"}</div>
        <input
          className={styles.numberField}
          type={"number"}
          value={this.state.gpWithXp}
          onChange={(e) => {
            if (e.target.value.trim().length === 0) {
              this.setState({ gpWithXp: undefined as any });
            } else {
              this.setState({ gpWithXp: +e.target.value });
            }
          }}
        />
        <div className={styles.centerLabel}>{"How much non-XP GP was gained?"}</div>
        <input
          className={styles.numberField}
          type={"number"}
          value={this.state.gpWithoutXp}
          onChange={(e) => {
            if (e.target.value.trim().length === 0) {
              this.setState({ gpWithoutXp: undefined as any });
            } else {
              this.setState({ gpWithoutXp: +e.target.value });
            }
          }}
        />
        <div className={styles.centerLabel}>{"If any, how should that GP be distributed?"}</div>
        <div className={styles.radioGroup}>
          <div className={styles.row}>
            <input
              className={styles.radioButton}
              type="radio"
              value={Distro.Hench}
              name="xpDistro"
              checked={this.state.gpDistro === Distro.Hench}
              onChange={(e) => {
                this.setState({ gpDistro: e.target.value as Distro });
              }}
            />
            <span className={styles.radioLabel}>Equally, then half goes to henchmasters</span>
          </div>
          <div className={styles.row}>
            <input
              className={styles.radioButton}
              type="radio"
              value={Distro.Equal}
              name="xpDistro"
              checked={this.state.gpDistro === Distro.Equal}
              onChange={(e) => {
                this.setState({ gpDistro: e.target.value as Distro });
              }}
            />
            <span className={styles.radioLabel}>Equally, to participants only</span>
          </div>
        </div>
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onGoldPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onGoldPageNextClick(): void {
    // Valid data?
    if (this.state.gpWithXp < 0 || this.state.gpWithoutXp < 0) {
      this.props.dispatch?.(
        showModal({
          id: "NegativeGoldError",
          content: {
            title: "Error!",
            message: "GP earned cannot be negative.",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderItemsPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderItemsPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>TODO: Items Found?</div>
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onItemsPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onItemsPageNextClick(): void {
    // TODO: Valid data?

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderInjuriesPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderInjuriesPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>TODO: Injuries?</div>
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onInjuriesPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onInjuriesPageNextClick(): void {
    // TODO: Valid data?

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderDeathsPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderDeathsPage(): React.ReactNode {
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>TODO: Deaths?</div>
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onDeathsPageNextClick.bind(this)}>
            {"Next"}
          </div>
        </div>
      </div>
    );
  }

  private onDeathsPageNextClick(): void {
    // TODO: Valid data?

    // As the data is valid, move on to the next page.
    this.pages.push(() => {
      return this.renderOutcomesConfirmationPage();
    });
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  }

  private renderOutcomesConfirmationPage(): React.ReactNode {
    const outcomes = this.buildOutcomes();
    return (
      <div className={styles.contentColumn}>
        <div className={styles.centerLabel}>Confirm Outcomes</div>
        <ActivityOutcomesList className={styles.outcomesListContainer} outcomes={outcomes} />
        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onPrevPageClick.bind(this)}>
            {"Prev"}
          </div>
          <div className={styles.actionButton} onClick={this.onSaveClicked.bind(this)}>
            {"Apply Outcomes"}
          </div>
        </div>
      </div>
    );
  }

  private buildOutcomes(): ActivityOutcomeData[] {
    const activity = this.props.activities[this.props.activeActivityId];
    const outcomes: ActivityOutcomeData[] = [];
    const allCharacters = this.props.allCharacters;
    const { gpDistro } = this.state;

    // Only surviving participants get stuff.
    const survivingParticipants = [...activity.participants];

    // TODO: Deaths.
    const deadCharacterIds: number[] = [];
    // TODO: Create "death" outcomes for the dead.
    // TODO: Remove the dead from the list of survivingParticipants.

    // Gold and XP distribution.
    interface RecipientData {
      characterId: number;
      gold: number;
      campaignGold: number; // Henchmaster's share from their henchmen.
      campaignDeductiblePayment: number;
      xpShares: number;
      xpMultiplier: number;
      xp: number;
    }
    const recipients: Dictionary<RecipientData> = {};
    survivingParticipants.forEach((p) => {
      const participant = allCharacters[p.characterId];
      recipients[p.characterId] = {
        characterId: p.characterId,
        gold: 0,
        campaignGold: 0,
        campaignDeductiblePayment: 0,
        xpShares: 0,
        xpMultiplier: getCharacterXPMultiplier(participant),
        xp: 0,
      };
    });
    function distributeGoldThroughHenchChain(remainingGold: number, henchmasterId: number): void {
      const henchmaster = allCharacters[henchmasterId];

      // Make sure a recipient entry exists.
      if (!recipients[henchmasterId]) {
        recipients[henchmasterId] = {
          characterId: henchmasterId,
          gold: 0,
          campaignGold: 0,
          campaignDeductiblePayment: 0,
          xpShares: 0,
          xpMultiplier: getCharacterXPMultiplier(henchmaster),
          xp: 0,
        };
      }

      const shouldGiveGoldToHenchmaster =
        gpDistro === Distro.Hench && // Hench mode?
        henchmaster.henchmaster_id > 0 && // Has a henchmaster?
        !deadCharacterIds.includes(henchmaster.henchmaster_id); // Henchmaster is still alive?

      if (shouldGiveGoldToHenchmaster) {
        recipients[henchmasterId].campaignGold += remainingGold / 2;
        // Everybody passes half of their share up the chain as campaign gold.
        distributeGoldThroughHenchChain(remainingGold / 2, henchmaster.henchmaster_id);
      } else {
        recipients[henchmasterId].campaignGold += remainingGold;
      }
    }
    // All surviving participants are included as recipients.
    let totalXPShares: number = 0;
    survivingParticipants.forEach((p) => {
      const participant = this.props.allCharacters[p.characterId];
      const xpMultiplier = getCharacterXPMultiplier(participant);
      let xpShares: number = 2;
      // If your henchmaster is in the group, you get half a share.
      if (
        this.state.xpDistro === Distro.Hench &&
        !!survivingParticipants.find((p2) => {
          return p2.characterId === participant.henchmaster_id;
        })
      ) {
        xpShares = 1;
      }
      totalXPShares += xpShares;

      let nonXPGoldPerShare = this.state.gpWithoutXp / survivingParticipants.length;
      let xpGoldPerShare = this.state.gpWithXp / survivingParticipants.length;
      let gold = nonXPGoldPerShare + xpGoldPerShare;
      let gxp = xpGoldPerShare * xpMultiplier;

      const shouldGiveGoldToHenchmaster =
        gpDistro === Distro.Hench && // Hench mode?
        participant.henchmaster_id > 0 && // Has a henchmaster?
        !deadCharacterIds.includes(participant.henchmaster_id); // Henchmaster is still alive?
      if (shouldGiveGoldToHenchmaster) {
        gold /= 2;
        gxp /= 2;
        distributeGoldThroughHenchChain(gold, participant.henchmaster_id);
      }

      // A few pre-calculated values.
      recipients[p.characterId].xpShares = xpShares;
      recipients[p.characterId].xpMultiplier = xpMultiplier;
      // Add the calculated earnings.
      recipients[p.characterId].gold += gold;
      recipients[p.characterId].xp = Math.ceil(recipients[p.characterId].xp + gxp);
    });
    const mxpPerShare = this.state.mxp / totalXPShares;
    Object.values(recipients).forEach((r) => {
      const mxp = Math.ceil(mxpPerShare * r.xpShares * r.xpMultiplier);
      r.xp += Math.ceil(r.xp + mxp);
    });

    // In theory, we have now distributed XP and GP into recipient structs.  Next we should look at campaignGold
    // and apply it against the monthly deductible so we can know how much of it counts to grant xp.
    Object.values(recipients).forEach((r) => {
      if (r.campaignGold > 0) {
        const recipient = allCharacters[r.characterId];

        // See how much is left on the monthly CXP deductible.  Reset it if needed.
        let remainingDeductible = recipient.remaining_cxp_deductible;
        if (
          // Never had a deductible before.
          recipient.cxp_deductible_date.length === 0 ||
          // Or we've rolled into a new month.
          new Date(recipient.cxp_deductible_date).getTime() <= new Date().getTime()
        ) {
          remainingDeductible = getCampaignXPDeductibleCapForLevel(recipient.level);
          const o: ActivityOutcomeData = {
            id: 0, // Will be overwritten by the server.
            activity_id: activity.id,
            target_id: r.characterId,
            type: ActivityOutcomeType.CXPDeductibleReset,
            quantity: remainingDeductible,
          };
          outcomes.push(o);
        }

        // Apply CGP against the deductible first.
        r.campaignDeductiblePayment = Math.min(remainingDeductible, r.campaignGold);
        // Apply remaining CGP as CXP.
        const cgpAfterDeductible = r.campaignGold - r.campaignDeductiblePayment;
        r.xp += cgpAfterDeductible * r.xpMultiplier;
      }
    });

    // Turn "recipients" into Outcomes.
    Object.values(recipients).forEach((r) => {
      // If there is GP gained, add a GP outcome.
      if (r.gold + r.campaignGold > 0) {
        const o: ActivityOutcomeData = {
          id: 0, // Will be overwritten by the server.
          activity_id: activity.id,
          target_id: r.characterId,
          type: ActivityOutcomeType.Gold,
          quantity: r.gold + r.campaignGold,
        };
        outcomes.push(o);
      }
      // If there is XP gained, add an XP outcome.
      if (r.xp > 0) {
        const o: ActivityOutcomeData = {
          id: 0, // Will be overwritten by the server.
          activity_id: activity.id,
          target_id: r.characterId,
          type: ActivityOutcomeType.XP,
          quantity: r.xp,
        };
        outcomes.push(o);
      }
      // If the CXP deductible changed, add a deductible outcome.
      if (r.campaignDeductiblePayment > 0) {
        const o: ActivityOutcomeData = {
          id: 0, // Will be overwritten by the server.
          activity_id: activity.id,
          target_id: r.characterId,
          type: ActivityOutcomeType.CXPDeductible,
          quantity: r.campaignDeductiblePayment,
        };
        outcomes.push(o);
      }
    });

    // TODO: Item distribution.
    // TODO: Injuries.

    return outcomes;
  }

  private onPrevPageClick(): void {
    this.setState({ pageIndex: this.state.pageIndex - 1 });
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Send it to the server!
    const outcomes = this.buildOutcomes();
    const res = await ServerAPI.resolveActivity(this.props.activeActivityId, this.state.resolutionText, outcomes);

    this.setState({ isSaving: false });
    // Refetch anything that might be altered by an activity resolution.  So... almost everything.
    if (this.props.dispatch) {
      await refetchCharacters(this.props.dispatch);
      await refetchActivities(this.props.dispatch);
      await refetchActivityOutcomes(this.props.dispatch);
      await refetchItems(this.props.dispatch);
    }
    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activities, activeActivityId } = state.activities;
  const allCharacters = state.characters.characters;
  return {
    ...props,
    activities,
    activeActivityId,
    allCharacters,
  };
}

export const ActivityResolutionSubPanel = connect(mapStateToProps)(AActivityResolutionSubPanel);
