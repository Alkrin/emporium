import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./AbilityComponentTooltip.module.scss";
import { AllAbilityComponents } from "../../../staticData/abilityComponents/abilityComponent";

interface ReactProps {
  componentId: string;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AAbilityComponentTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const def = AllAbilityComponents[this.props.componentId];
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.name}>{def.name}</div>
        </div>
        <div className={styles.description}>{def.description}</div>
        <div className={styles.componentId}>{`#${def.id}`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const AbilityComponentTooltip = connect(mapStateToProps)(AAbilityComponentTooltip);
