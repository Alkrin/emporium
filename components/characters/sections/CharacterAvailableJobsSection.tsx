import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterAvailableJobsSection.module.scss";
import { AbilityComponentInstance } from "../../../lib/characterUtils";
import { JobData, JobData_CredentialRequirement } from "../../../pages/api/tables/jobs/types";
import {
  AbilityComponentJobCredential,
  AbilityComponentJobCredentialData,
} from "../../../staticData/abilityComponents/AbilityComponentJobCredential";

interface JobDisplayData {
  title: string;
  wage: number;
}

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  allJobs: Record<number, JobData>;
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

  private isCredentialRequirementSatisfied(
    req: JobData_CredentialRequirement,
    credentials: Record<number, Record<string, number>>,
    outSubtypes: string[]
  ): boolean {
    let isSatisfied: boolean = false;

    // We check all the credentials in case multiple of them work, since we need
    // to collect all the relevant subtypes.
    Object.entries(credentials[req.credential_id] ?? []).forEach((entry) => {
      const subtype: string = entry[0];
      const rank: number = entry[1];
      if ((req.subtype === "" || req.subtype === subtype) && rank >= req.ranks) {
        if (!outSubtypes.includes(subtype)) {
          outSubtypes.push(subtype);
          isSatisfied = true;
        }
      }
    });

    return isSatisfied;
  }

  private buildDisplayData(): JobDisplayData[] {
    const { activeComponents, allJobs } = this.props;

    // Combine all credential ranks by subtype (or lack thereof)
    // Maps credential_id and subtype to rank.
    let credentials: Record<number, Record<string, number>> = {};
    activeComponents[AbilityComponentJobCredential.id]?.forEach((instance: AbilityComponentInstance) => {
      const { credential_id } = instance.data as AbilityComponentJobCredentialData;

      if (!credentials[credential_id]) {
        credentials[credential_id] = {};
      }

      credentials[credential_id][instance.subtype] =
        (credentials[credential_id][instance.subtype] ?? 0) + instance.rank;
    });

    const displayData: JobDisplayData[] = [];

    Object.values(allJobs).forEach((job: JobData) => {
      // Check for all subtypes that sufficiently support this job.

      const matchingSubtypes: string[] = [];
      let allCredentialsMet = true;
      job.credentials.forEach((requiredCredential) => {
        allCredentialsMet =
          allCredentialsMet && this.isCredentialRequirementSatisfied(requiredCredential, credentials, matchingSubtypes);
      });

      job.alternate_credentials.forEach((credentialSet) => {
        if (allCredentialsMet) {
          let setMet = true;
          credentialSet.forEach((requiredCredential) => {
            setMet = setMet && this.isCredentialRequirementSatisfied(requiredCredential, credentials, matchingSubtypes);
          });

          allCredentialsMet = allCredentialsMet && setMet;
        }
      });

      // If every credential met the required rank, add display data for at least one job, or more if the job has subtypes.
      if (allCredentialsMet) {
        if (job.has_subtypes) {
          // One job per subtype.
          matchingSubtypes.forEach((s) => {
            const datum: JobDisplayData = {
              title: `${job.name} (${s})`,
              wage: job.wage,
            };
            displayData.push(datum);
          });
        } else {
          // One job, with no subtype.
          const datum: JobDisplayData = {
            title: job.name,
            wage: job.wage,
          };
          displayData.push(datum);
        }
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
      <div className={styles.listRow} key={`jobRow${index}`}>
        <div className={styles.listName}>{datum.title}</div>
        <div className={styles.valueText}>{`${+datum.wage.toFixed(2)}gp`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  const allJobs = state.gameDefs.jobs;
  return {
    ...props,
    character,
    allJobs,
  };
}

export const CharacterAvailableJobsSection = connect(mapStateToProps)(ACharacterAvailableJobsSection);
