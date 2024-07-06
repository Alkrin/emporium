import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  ActivityData,
  ActivityOutcomeData,
  ActivityOutcomeData_Description,
  ActivityOutcomeType,
  CharacterData,
} from "../../serverAPI";
import styles from "./ActivityResolutionSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { refetchActivities, refetchActivityOutcomes } from "../../dataSources/ActivitiesDataSource";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { refetchArmies, refetchTroopInjuries, refetchTroops } from "../../dataSources/ArmiesDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { SavingVeil } from "../SavingVeil";
import { ActivityOutcomesList } from "./ActivityOutcomeList";
import { showModal } from "../../redux/modalsSlice";
import { CreateActivityOutcomeDialog } from "./CreateActivityOutcomeDialog";
import { showToaster } from "../../redux/toastersSlice";
import { EditButton } from "../EditButton";
import {
  generateActivityResolution,
  getDisallowedTypesFromOutcomes,
  sortActivityOutcomes,
} from "../../lib/activityUtils";
import { refetchContracts } from "../../dataSources/ContractsDataSource";

interface State {
  outcomes: ActivityOutcomeData[];
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  activity: ActivityData;
  allCharacters: Dictionary<CharacterData>;
  expectedOutcomes: ActivityOutcomeData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivityResolutionSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const outcomes = props.expectedOutcomes
      .map((eo) => {
        // Copy so we don't directly alter the originals.
        const outcome: ActivityOutcomeData = { ...eo };
        return outcome;
      })
      .sort(sortActivityOutcomes);

    this.state = {
      isSaving: false,
      outcomes,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{"Resolving Activity"}</div>
        <div className={styles.subtitleLabel}>{`#${this.props.activity.id}: ${this.props.activity.name}`}</div>

        <div className={styles.outcomesHeaderRow}>
          <div className={styles.outcomesHeaderLabel}>{"Pending Outcomes"}</div>
          <EditButton className={styles.editButton} onClick={this.onAddOutcomeClicked.bind(this)} />
        </div>

        <ActivityOutcomesList
          className={styles.outcomesList}
          outcomes={this.state.outcomes}
          canEdit={true}
          onEditRowClicked={this.onEditOutcomeClicked.bind(this)}
          onDeleteRowClicked={this.onDeleteOutcomeClicked.bind(this)}
        />

        <div className={styles.buttonRow}>
          <div className={styles.actionButton} onClick={this.onSaveClicked.bind(this)}>
            {"Apply Outcomes"}
          </div>
        </div>

        <SavingVeil show={this.state.isSaving} />

        <SubPanelCloseButton />
      </div>
    );
  }

  private onAddOutcomeClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "AddExpectedOutcome",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.props.activity}
              disallowedTypes={getDisallowedTypesFromOutcomes(this.state.outcomes)}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                this.setState({ outcomes: [...this.state.outcomes, outcome].sort(sortActivityOutcomes) });
              }}
            />
          );
        },
      })
    );
  }

  private onDeleteOutcomeClicked(data: ActivityOutcomeData, index: number): void {
    this.setState({ outcomes: this.state.outcomes.filter((_, findex) => findex !== index) });
  }

  private onEditOutcomeClicked(data: ActivityOutcomeData, index: number): void {
    this.props.dispatch?.(
      showModal({
        id: "EditOutcome",
        content: () => {
          return (
            <CreateActivityOutcomeDialog
              activity={this.props.activity}
              initialValues={data}
              onValuesConfirmed={async (outcome: ActivityOutcomeData) => {
                const newOutcomes = [...this.state.outcomes];
                newOutcomes[index] = outcome;
                this.setState({ outcomes: newOutcomes.sort(sortActivityOutcomes) });
              }}
            />
          );
        },
      })
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // A valid Description outcome is mandatory.
    const description = this.state.outcomes.find((o) => {
      if (o.type === ActivityOutcomeType.Description) {
        const od = o as ActivityOutcomeData_Description;
        return od.description.length > 0;
      } else {
        return false;
      }
    });

    if (!description) {
      this.props.dispatch?.(
        showToaster({
          id: "InvalidDescription",
          content: {
            title: "Invalid Description",
            message: `A non-empty Description is required.`,
          },
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    const resolution = generateActivityResolution(
      this.props.activity,
      this.state.outcomes,
      this.props.activity.end_date
    );

    // Send it to the server!
    const res = await ServerAPI.resolveActivity(this.props.activity, this.state.outcomes, resolution);

    // Refetch anything that might be altered by an activity resolution.  So... almost everything.
    if (this.props.dispatch) {
      await refetchCharacters(this.props.dispatch);
      await refetchStorages(this.props.dispatch);
      await refetchActivities(this.props.dispatch);
      await refetchActivityOutcomes(this.props.dispatch);
      await refetchItems(this.props.dispatch);
      await refetchArmies(this.props.dispatch);
      await refetchTroops(this.props.dispatch);
      await refetchTroopInjuries(this.props.dispatch);
      await refetchContracts(this.props.dispatch);
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const activity = state.activities.activities[state.activities.activeActivityId];
  const expectedOutcomes = state.activities.expectedOutcomesByActivity[state.activities.activeActivityId] ?? [];
  const allCharacters = state.characters.characters;
  return {
    ...props,
    activity,
    allCharacters,
    expectedOutcomes,
  };
}

export const ActivityResolutionSubPanel = connect(mapStateToProps)(AActivityResolutionSubPanel);
