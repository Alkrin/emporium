import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterAvailableJobsSection.module.scss";
import { AbilityComponentInstance, getAbilityComponentInstanceSourceName } from "../../../lib/characterUtils";
import {
  AbilityComponentAvailableJob,
  AbilityComponentAvailableJobData,
  AvailableJobEntry,
} from "../../../staticData/abilityComponents/AbilityComponentAvailableJob";

interface JobDisplayData extends AvailableJobEntry {
  source: string;
}

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterAvailableJobsSection extends React.Component<Props> {
  render(): React.ReactNode {
    const displayData = this.buildDisplayData();

    if (Object.keys(displayData).length > 0) {
      return (
        <div className={styles.root}>
          <div className={styles.titleRow}>
            <div className={styles.title}>{"Available Jobs"}</div>
            <div className={styles.fixedWidthHeader}>{"Wage"}</div>
          </div>
          <div className={styles.horizontalLine} />
          {displayData.map(this.renderAvailableJobRow.bind(this))}
        </div>
      );
    } else {
      return null;
    }
  }

  private buildDisplayData(): JobDisplayData[] {
    const { activeComponents } = this.props;

    const displayData: JobDisplayData[] = [];

    activeComponents[AbilityComponentAvailableJob.id]?.forEach((instance) => {
      const source = getAbilityComponentInstanceSourceName(instance);
      const { jobs } = instance.data as AbilityComponentAvailableJobData;
      const job = jobs[Math.min(instance.rank - 1, jobs.length - 1)];
      // Only include jobs that pay a wage.  This allows us to do things like only let you work
      // as an Alchemist once you have three ranks of Alchemy by setting a zero wage for ranks
      // one and two.
      if (job && job.wage > 0) {
        displayData.push({ ...job, source });
      }
    });

    const sortedDisplayData = Object.values(displayData).sort((a, b) => {
      // Sort by name.
      return a.title.localeCompare(b.title);
    });
    return sortedDisplayData;
  }

  private renderAvailableJobRow(datum: JobDisplayData, index: number): React.ReactNode {
    return (
      <TooltipSource
        className={styles.listRow}
        key={`jobRow${index}`}
        tooltipParams={{
          id: datum.title,
          content: this.renderJobTooltip.bind(this, datum),
        }}
      >
        <div className={styles.listName}>{datum.title}</div>
        <div className={styles.valueText}>{`${+datum.wage.toFixed(2)}gp`}</div>
      </TooltipSource>
    );
  }

  private renderJobTooltip(datum: JobDisplayData): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipHeader}>
          <div className={styles.tooltipTitle}>{datum.title}</div>
        </div>
        <div className={styles.tooltipSubtext}>{`Source: ${datum.source}`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  return {
    ...props,
    character,
  };
}

export const CharacterAvailableJobsSection = connect(mapStateToProps)(ACharacterAvailableJobsSection);
