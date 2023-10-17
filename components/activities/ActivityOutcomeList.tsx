import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { ActivityOutcomeData, ActivityOutcomeType, CharacterData } from "../../serverAPI";
import styles from "./ActivityOutcomeList.module.scss";
import { Dictionary } from "../../lib/dictionary";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  outcomes: ActivityOutcomeData[];
}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivityOutcomeList extends React.Component<Props> {
  render(): React.ReactNode {
    const { outcomes, allCharacters, dispatch, className, ...otherProps } = this.props;
    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {this.props.outcomes.map(this.renderOutcomeRow.bind(this))}
      </div>
    );
  }

  private renderOutcomeRow(outcome: ActivityOutcomeData, index: number): React.ReactNode {
    let outcomeText = `${outcome.type} ${outcome.target_id} ${outcome.quantity}`;
    const recipient = this.props.allCharacters[outcome.target_id];
    switch (outcome.type) {
      case ActivityOutcomeType.Gold: {
        outcomeText = `${recipient.name} got ${outcome.quantity.toFixed(2)}gp`;
        break;
      }
      case ActivityOutcomeType.XP: {
        outcomeText = `${recipient.name} got ${outcome.quantity.toFixed(0)}xp`;
        break;
      }
      case ActivityOutcomeType.CXPDeductible: {
        outcomeText = `${recipient.name} paid ${outcome.quantity.toFixed(2)}gp into their CXP deductible`;
        break;
      }
      // Some outcomes don't need to be rendered.
      case ActivityOutcomeType.Invalid:
      case ActivityOutcomeType.CXPDeductibleReset: {
        return null;
      }
    }
    return (
      <div className={styles.outcomeRow} key={index}>
        {outcomeText}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  return {
    ...props,
    allCharacters,
  };
}

export const ActivityOutcomesList = connect(mapStateToProps)(AActivityOutcomeList);
