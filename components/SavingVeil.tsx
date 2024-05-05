/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./SavingVeil.module.scss";

interface ReactProps {
  show: boolean;
  textOverride?: string;
}

interface InjectedProps {
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class ASavingVeil extends React.Component<Props> {
  public render(): React.ReactNode {
    if (!this.props.show) {
      return null;
    } else {
      return (
        <div className={styles.root}>
          <div className={styles.label}>{this.props.textOverride ?? "Saving..."}</div>
        </div>
      );
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export const SavingVeil = connect(mapStateToProps)(ASavingVeil);
