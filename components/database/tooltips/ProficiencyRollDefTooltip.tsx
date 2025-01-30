import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { ProficiencyRollData } from "../../../serverAPI";
import styles from "./ProficiencyRollDefTooltip.module.scss";

interface ReactProps {
  defId: number;
}

interface InjectedProps {
  proficiencyRollDef?: ProficiencyRollData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AProficiencyRollDefTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const { proficiencyRollDef } = this.props;
    if (!proficiencyRollDef) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{proficiencyRollDef.name}</div>
        </div>
        <div className={styles.description}>{proficiencyRollDef.description}</div>
        <div className={styles.defId}>{`#${this.props.defId}`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const proficiencyRollDef = state.gameDefs.proficiencyRolls[props.defId];

  return {
    ...props,
    proficiencyRollDef,
  };
}

export const ProficiencyRollDefTooltip = connect(mapStateToProps)(AProficiencyRollDefTooltip);
