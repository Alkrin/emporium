/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import styles from "./ScrollArea.module.scss";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {}

interface InjectedProps {
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

export class ScrollArea extends React.Component<Props> {
  public render(): React.ReactNode {
    const { dispatch, className, children, ...otherProps } = this.props;
    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {children}
      </div>
    );
  }
}
