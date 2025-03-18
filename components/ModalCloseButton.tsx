/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./ModalCloseButton.module.scss";
import { hideModal } from "../redux/modalsSlice";

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class AModalCloseButton extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <div className={styles.root} onClick={this.onClick.bind(this)}>
        <div className={styles.bigX}>{"X"}</div>
      </div>
    );
  }

  private onClick(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export const ModalCloseButton = connect(mapStateToProps)(AModalCloseButton);
