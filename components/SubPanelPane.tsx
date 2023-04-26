/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { hideSubPanel, SubPanelParams } from "../redux/subPanelsSlice";
import Escapable from "./Escapable";
import styles from "./SubPanelPane.module.scss";

interface State {
  shouldShow: boolean;
  // Stash the displayed modals so we can animate between modals if multiple are queued.
  currentSubPanel: SubPanelParams | null;
  prevSubPanel: SubPanelParams | null;
}

interface ReactProps {}

interface InjectedProps {
  subPanels: SubPanelParams[];
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class ASubPanelPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      shouldShow: false,
      currentSubPanel: null,
      prevSubPanel: null,
    };
  }

  public render(): React.ReactNode {
    const subPanelClass = this.state.shouldShow ? styles.show : "";
    return (
      <div className={`${styles.root} ${subPanelClass}`}>
        <div className={styles.previousSubPanelWrapper} key={`Prev${this.state.prevSubPanel?.id ?? "None"}`}>
          {this.renderSubPanel(this.state.prevSubPanel)}
        </div>
        <div className={styles.currentSubPanelWrapper} key={`Curr${this.state.currentSubPanel?.id ?? "None"}`}>
          {this.state.currentSubPanel?.escapable && (
            <Escapable escapeId={`SubPanel_${this.state.currentSubPanel.id}`} onEscape={this.onEscape.bind(this)} />
          )}
          {this.renderSubPanel(this.state.currentSubPanel)}
        </div>
      </div>
    );
  }

  private renderSubPanel(subPanel: SubPanelParams | null): React.ReactNode {
    if (!subPanel) {
      return null;
    }

    return subPanel.content();
  }

  private onEscape(): void {
    this.props.dispatch?.(hideSubPanel());
  }

  componentWillUnmount(): void {
    // If the parent of the current subPanel goes away, the subPanel goes away also.
    this.props.dispatch?.(hideSubPanel());
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    // If the current subPanel has changed, update state.
    if (this.props.subPanels[0]?.id != this.state.currentSubPanel?.id) {
      this.setState({
        currentSubPanel: this.props.subPanels[0],
        prevSubPanel: this.state.currentSubPanel,
      });

      if (this.props.subPanels.length > 0) {
        if (!this.state.shouldShow) {
          this.setState({ shouldShow: true });
        }
      } else {
        setTimeout(() => {
          this.setState({ shouldShow: false, prevSubPanel: null });
        }, 250);
      }
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { subPanels } = state.subPanels;

  return {
    ...ownProps,
    subPanels,
  };
}

export const SubPanelPane = connect(mapStateToProps)(ASubPanelPane);
