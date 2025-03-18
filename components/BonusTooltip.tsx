/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { BonusCalculations } from "../lib/characterUtils";
import styles from "./BonusTooltip.module.scss";

interface ReactProps {
  header: string;
  calc?: BonusCalculations;
  isFlatValue?: boolean;
  hideZeroBonus?: boolean;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class BonusTooltip extends React.Component<Props> {
  public render(): React.ReactNode {
    const { header, calc, isFlatValue, hideZeroBonus } = this.props;
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.title}>{header}</div>
          {!hideZeroBonus && (
            <div className={styles.value}>{`${!isFlatValue && (calc?.bonus ?? 0) > 0 ? "+" : ""}${
              calc?.bonus ?? 0
            }`}</div>
          )}
        </div>
        <div className={styles.divider} />
        {calc?.sources.map(({ name, value }) => {
          return (
            <div className={styles.sourceRow} key={name}>
              <div className={styles.source}>{name}</div>
              <div className={styles.sourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
            </div>
          );
        })}
        {(calc?.conditionalSources.length ?? 0) > 0 ? (
          <>
            <div className={styles.conditionalHeader}>{"Conditional Bonuses"}</div>
            <div className={styles.divider} />
            {calc?.conditionalSources.map(({ name, value }) => {
              return (
                <div className={styles.sourceRow} key={name}>
                  <div className={styles.source}>{name}</div>
                  <div className={styles.sourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
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

export default connect(mapStateToProps)(BonusTooltip);
