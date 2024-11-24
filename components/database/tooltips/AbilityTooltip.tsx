import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./AbilityTooltip.module.scss";
import { AbilityDefData } from "../../../serverAPI";
import { Dictionary } from "../../../lib/dictionary";

interface ReactProps {
  defId: number;
}

interface InjectedProps {
  abilityDefs: Dictionary<AbilityDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AAbilityTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const def = this.props.abilityDefs[this.props.defId];
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.name}>{def.name}</div>
        </div>
        <div className={styles.description}>{def.descriptions[0]}</div>
        {def.subtypes.length > 0 && <div className={styles.subtypes}>{def.subtypes.join(", ")}</div>}
        <div className={styles.componentId}>{`#${def.id}`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const abilityDefs = state.gameDefs.abilities;
  return {
    ...props,
    abilityDefs,
  };
}

export const AbilityTooltip = connect(mapStateToProps)(AAbilityTooltip);
