/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { hideToaster, ToasterParams } from "../redux/toastersSlice";
import styles from "./ToasterPane.module.scss";

const DEFAULT_TOAST_DURATION_MILLIS = 2000;

interface State {
  shouldShow: boolean;
  // Stash the displayed modals so we can animate between modals if multiple are queued.
  currentToaster: ToasterParams | null;
  prevToaster: ToasterParams | null;
}

interface ReactProps {}

interface InjectedProps {
  toasters: ToasterParams[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ToasterPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      shouldShow: false,
      currentToaster: null,
      prevToaster: null,
    };
  }

  public render(): React.ReactNode {
    const toastClass = this.state.shouldShow ? styles.show : "";
    return (
      <div className={`${styles.root} ${toastClass}`}>
        <div
          className={styles.previousToasterWrapper}
          key={`Prev${this.state.prevToaster?.id ?? "None"}`}
        >
          {this.renderToaster(this.state.prevToaster)}
        </div>
        <div
          className={styles.currentToasterWrapper}
          key={`Curr${this.state.currentToaster?.id ?? "None"}`}
        >
          {this.renderToaster(this.state.currentToaster)}
        </div>
      </div>
    );
  }

  private renderToaster(toaster: ToasterParams | null): React.ReactNode {
    if (!toaster) {
      return null;
    }

    if (typeof toaster.content === "function") {
      return toaster.content();
    } else {
      return (
        <>
          {toaster.content.title && (
            <div className={styles.titleText}>{toaster.content.title}</div>
          )}
          {toaster.content.message && (
            <div className={styles.messageText}>{toaster.content.message}</div>
          )}
        </>
      );
    }
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    // If the current modal has changed, update state.
    if (this.props.toasters[0]?.id != this.state.currentToaster?.id) {
      this.setState({
        currentToaster: this.props.toasters[0],
        prevToaster: this.state.currentToaster,
      });

      if (this.props.toasters.length > 0) {
        if (!this.state.shouldShow) {
          this.setState({ shouldShow: true });
        }
        // Queue up the exit for the top toaster.
        setTimeout(() => {
          this.props.dispatch?.(hideToaster());
        }, this.props.toasters[0].duration ?? DEFAULT_TOAST_DURATION_MILLIS);
      } else {
        setTimeout(() => {
          this.setState({ shouldShow: false, prevToaster: null });
        }, 250);
      }
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { toasters } = state.toasters;

  return {
    ...ownProps,
    toasters,
  };
}

export default connect(mapStateToProps)(ToasterPane);
