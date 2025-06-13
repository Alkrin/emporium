/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./DatabaseButton.module.scss";

interface ReactProps extends React.HTMLAttributes<HTMLButtonElement> {}

interface InjectedProps {
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class ADatabaseButton extends React.Component<Props> {
  public render(): React.ReactNode {
    const { dispatch, className, ...otherProps } = this.props;
    return <button className={`${styles.root} ${className}`} {...otherProps}></button>;
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export const DatabaseButton = connect(mapStateToProps)(ADatabaseButton);
