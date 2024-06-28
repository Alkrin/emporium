import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { ActivityOutcomeData, CharacterData } from "../../serverAPI";
import styles from "./ActivityOutcomeList.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { getDisplayTextForExpectedOutcome } from "../../lib/activityUtils";
import { EditButton } from "../EditButton";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  outcomes: ActivityOutcomeData[];
  canEdit?: boolean;
  onEditRowClicked?: (data: ActivityOutcomeData, index: number) => void;
  onDeleteRowClicked?: (data: ActivityOutcomeData, index: number) => void;
}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AActivityOutcomeList extends React.Component<Props> {
  render(): React.ReactNode {
    const {
      outcomes,
      canEdit,
      onEditRowClicked,
      onDeleteRowClicked,
      allCharacters,
      dispatch,
      className,
      ...otherProps
    } = this.props;

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {this.props.outcomes.map(this.renderOutcomeRow.bind(this))}
      </div>
    );
  }

  private renderOutcomeRow(data: ActivityOutcomeData, index: number): React.ReactNode {
    return (
      <div className={styles.outcomeRow} key={index}>
        <div className={styles.outcomeText}>{getDisplayTextForExpectedOutcome(data)}</div>
        {this.props.canEdit && (
          <>
            <EditButton className={styles.outcomeEditButton} onClick={this.onEditRowClicked.bind(this, data, index)} />
            <div className={styles.outcomeDeleteButton} onClick={this.onDeleteRowClicked.bind(this, data, index)}>
              {"-"}
            </div>
          </>
        )}
      </div>
    );
  }

  private onEditRowClicked(data: ActivityOutcomeData, index: number): void {
    this.props.onEditRowClicked?.(data, index);
  }

  private onDeleteRowClicked(data: ActivityOutcomeData, index: number): void {
    this.props.onDeleteRowClicked?.(data, index);
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
