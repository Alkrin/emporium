import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DescribedDefTooltip.module.scss";
import { SearchableDef } from "../SearchableDefList";

export interface DescribedDef extends SearchableDef {
  description: string;
}

interface ReactProps {
  def: DescribedDef;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADescribedDefTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{def.name}</div>
        </div>
        <div className={styles.description}>{def.description}</div>
        <div className={styles.defId}>{`#${def.id}`}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const DescribedDefTooltip = connect(mapStateToProps)(ADescribedDefTooltip);
