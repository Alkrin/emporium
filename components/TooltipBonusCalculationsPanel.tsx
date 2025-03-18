/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { BonusCalculations, getBonusString } from "../lib/characterUtils";
import styles from "./TooltipBonusCalculationsPanel.module.scss";

interface ReactProps {
  calc: BonusCalculations;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ATooltipBonusCalculationsPanel extends React.Component<Props> {
  public render(): React.ReactNode {
    const { calc } = this.props;
    return (
      <div className={styles.root}>
        {calc.sources.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>{"Bonuses"}</div>
            <div className={styles.tooltipDivider} />
            {calc.sources.map(({ name, value }) => {
              return (
                <div className={styles.tooltipSourceRow} key={name}>
                  <div className={styles.tooltipSource}>{name}</div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
        {calc.conditionalSources.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>{"Conditional Bonuses"}</div>
            <div className={styles.tooltipDivider} />
            {calc.conditionalSources.map(({ name, value, condition }) => {
              return (
                <div className={styles.tooltipSourceRow} key={name}>
                  <div className={styles.growingColumn}>
                    <div className={styles.tooltipSource}>{name}</div>
                    <div className={styles.tooltipCondition}>{condition}</div>
                  </div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export const TooltipBonusCalculationsPanel = connect(mapStateToProps)(ATooltipBonusCalculationsPanel);
