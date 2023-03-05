/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, ModalParams } from "../redux/modalsSlice";
import { RootState } from "../redux/store";
import Escapable from "./Escapable";
import styles from "./ModalPane.module.scss";

interface State {
  shouldShow: boolean;
  // Stash the displayed modals so we can animate between modals if multiple are queued.
  currentModal: ModalParams | null;
  prevModal: ModalParams | null;
}

interface ReactProps {}

interface InjectedProps {
  modals: ModalParams[];
  dispatch?: Dispatch<any>;
}

type Props = ReactProps & InjectedProps;

class ModalPane extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      shouldShow: false,
      currentModal: null,
      prevModal: null,
    };
  }

  public render(): React.ReactNode {
    const modalClass = this.state.shouldShow ? styles.show : "";
    return (
      <div className={`${styles.root} ${modalClass}`}>
        <div
          className={styles.previousModalWrapper}
          key={`Prev${this.state.prevModal?.id ?? "None"}`}
        >
          {this.renderModal(this.state.prevModal)}
        </div>
        <div
          className={styles.currentModalWrapper}
          key={`Curr${this.state.currentModal?.id ?? "None"}`}
        >
          {this.state.currentModal?.escapable && (
            <Escapable
              escapeID={`Modal_${this.state.currentModal.id}`}
              onEscape={this.onEscape.bind(this)}
            />
          )}
          {this.renderModal(this.state.currentModal)}
        </div>
      </div>
    );
  }

  private renderModal(modal: ModalParams | null): React.ReactNode {
    if (!modal) {
      return null;
    }

    if (typeof modal.content === "function") {
      return modal.content();
    } else {
      return (
        <>
          {modal.content.title && (
            <div className={styles.titleText}>{modal.content.title}</div>
          )}
          {modal.content.message && (
            <div className={styles.messageText}>{modal.content.message}</div>
          )}
          {modal.content.extraButtons?.map((eb) => {
            return this.renderModalButton(eb.text, eb.onClick);
          })}
          {this.renderModalButton(
            modal.content.buttonText ?? "Close",
            this.onButtonClick.bind(this)
          )}
        </>
      );
    }
  }

  private renderModalButton(
    text: string,
    onClick: () => void
  ): React.ReactNode {
    return (
      <div key={text} className={styles.button} onClick={onClick}>
        {text}
      </div>
    );
  }

  private onEscape(): void {
    this.props.dispatch?.(hideModal());
  }

  private onButtonClick(): void {
    const modal = this.props.modals[0];
    // Should always be true.  Just using it for the typeguard.
    if (typeof modal.content !== "function") {
      if (modal.content.onButtonClick) {
        modal.content.onButtonClick();
      } else {
        this.props.dispatch?.(hideModal());
      }
    }
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    // If the current modal has changed, update state.
    if (this.props.modals[0]?.id != this.state.currentModal?.id) {
      this.setState({
        currentModal: this.props.modals[0],
        prevModal: this.state.currentModal,
      });

      if (this.props.modals.length > 0) {
        if (!this.state.shouldShow) {
          this.setState({ shouldShow: true });
        }
      } else {
        setTimeout(() => {
          this.setState({ shouldShow: false, prevModal: null });
        }, 250);
      }
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { modals } = state.modals;

  return {
    ...ownProps,
    modals,
  };
}

export default connect(mapStateToProps)(ModalPane);
