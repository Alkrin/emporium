/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./ExpandableSection.module.scss";

interface State {
  isOpen: boolean;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  renderHeader: () => React.ReactNode;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AExpandableSection extends React.Component<Props, State> {
  private contentContainerRef: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  public render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { children, className, renderHeader, dispatch, ...otherProps } = this.props;

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        <div className={styles.headerSection}>
          <div className={styles.headerContent}>{renderHeader()}</div>
          <button className={styles.expandButton} onClick={this.toggleExpansion.bind(this)}>
            {this.state.isOpen ? "^" : "v"}
          </button>
        </div>
        <div
          className={`${styles.contentClipper} ${this.state.isOpen ? styles.open : ""}`}
          ref={(r) => {
            this.contentContainerRef = r;
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  private toggleExpansion(): void {
    // TODO: Animate the swap!
    this.setState({ isOpen: !this.state.isOpen });
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export const ExpandableSection = connect(mapStateToProps)(AExpandableSection);
