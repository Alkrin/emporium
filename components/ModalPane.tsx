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
import { genID } from "../lib/stringUtils";

interface ModalParamsEx extends ModalParams {
  // Track the associated custom animation(s) so we can trigger and/or clean up.
  entryKeyframeId: string;
  exitKeyframeId: string;
  animationTimeout: NodeJS.Timeout | null;
}

interface State {
  visibleModals: ModalParamsEx[];
  exitingModalId: string;
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
      visibleModals: [],
      exitingModalId: "",
    };
  }

  public render(): React.ReactNode {
    // No modals, then waste no time.
    if (this.state.visibleModals.length === 0) {
      return null;
    }

    return <div className={styles.root}>{this.renderAllModals()}</div>;
  }

  private renderAllModals(): React.ReactNode[] {
    // Render modals in stack order.
    const modals: React.ReactNode[] = this.state.visibleModals.map((mpe, index) => {
      const widthOverride = `${mpe.widthVmin ?? 32}vmin`;

      const isExiting = mpe.id === this.state.exitingModalId;

      const animation = isExiting ? `${mpe.exitKeyframeId} 1000ms` : `${mpe.entryKeyframeId} 250ms`;
      const pointerEvents = isExiting ? "none" : "auto";

      return (
        <div className={styles.modalWrapper} key={mpe.id} style={{ width: widthOverride, animation, pointerEvents }}>
          {mpe.escapable && (
            <Escapable escapeId={`Modal_${mpe.id}`} key={`Escapable_${mpe.id}`} onEscape={this.onEscape.bind(this)} />
          )}
          {this.renderModal(mpe)}
        </div>
      );
    });
    // Add a veil under the top non-exiting modal.
    let veilIndex = modals.length - 1;
    if (this.state.exitingModalId.length > 0) {
      veilIndex -= 1;
    }
    veilIndex = Math.max(veilIndex, 0);

    const modalsAndVeil = [
      ...modals.slice(0, veilIndex),
      <div className={styles.veil} key={"ModalVeil"} />,
      ...modals.slice(veilIndex),
    ];

    return modalsAndVeil;
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
          {modal.content.title && <div className={styles.titleText}>{modal.content.title}</div>}
          {modal.content.message && <div className={styles.messageText}>{modal.content.message}</div>}
          {modal.content.extraButtons?.map((eb) => {
            return this.renderModalButton(eb.text, eb.onClick);
          })}
          {this.renderModalButton(modal.content.buttonText ?? "Close", this.onButtonClick.bind(this, modal))}
        </>
      );
    }
  }

  private renderModalButton(text: string, onClick: () => void): React.ReactNode {
    return (
      <div key={text} className={styles.button} onClick={onClick}>
        {text}
      </div>
    );
  }

  private onEscape(): void {
    this.props.dispatch?.(hideModal());
  }

  private onButtonClick(modal: ModalParams): void {
    // Should always be true.  Just using it for the typeguard.
    if (typeof modal.content !== "function") {
      if (modal.content.onButtonClick) {
        modal.content.onButtonClick();
      } else {
        this.props.dispatch?.(hideModal());
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    // When the list of modals changes, we need to update state to match.
    if (this.props.modals !== prevProps.modals) {
      // The new list of displayedModals should be this.props.modals plus the top exiting modal (if there is one).
      const newVisibleModals = this.props.modals.map((mp) => {
        const oldMPE = this.state.visibleModals.find((mpe) => {
          return mpe.id === mp.id;
        });
        if (oldMPE) {
          // Reuse existing mpes if possible..
          return oldMPE;
        } else {
          // Generate new mpes if necessary.
          const newMPE: ModalParamsEx = {
            ...mp,
            entryKeyframeId: genID("entry"),
            exitKeyframeId: genID("exit"),
            animationTimeout: null,
          };
          // Make the keyframe anims for this modal and push them into the CSS sheet.
          this.createAnimations(newMPE);

          return newMPE;
        }
      });

      const exitingModals = this.state.visibleModals.filter((mpe) => {
        const stillHere = newVisibleModals.find((mp) => {
          return mp.id === mpe.id;
        });
        return !stillHere;
      });

      let exitingModalId: string = "";
      if (exitingModals.length > 0) {
        // The top exiting modal gets to stick around long enough to play an exit animation.
        // By popping it off, we avoid cleaning it up too early a few lines further down.
        const topExitingModal = exitingModals.pop() as ModalParamsEx; // Guaranteed to be true.
        exitingModalId = topExitingModal.id;
        // Set an animation timeout so we can remove the modal from the display stack.
        // If it's already animating out, don't re-animate. (maybe we dismissed again in the middle of its animation)
        if (!topExitingModal.animationTimeout) {
          topExitingModal.animationTimeout = setTimeout(() => {
            this.cleanUpAnimations(topExitingModal);
            topExitingModal.animationTimeout = null;
            this.setState({
              visibleModals: this.state.visibleModals.filter((mpe) => {
                return mpe.id !== topExitingModal.id;
              }),
            });
          }, 300);
        }
        newVisibleModals.push(topExitingModal);
      }

      // Removed modals must be cleaned up.
      exitingModals.forEach((empe) => {
        // Clean up animation styles.
        this.cleanUpAnimations(empe);
        // Clean up animation timeout if present.  Shouldn't happen, but just in case.
        if (empe.animationTimeout) {
          clearTimeout(empe.animationTimeout);
          empe.animationTimeout = null;
        }
      });

      // And set the new state.  Any fully-gone modals should no longer be rendered, and any exiting modal should start animating.
      this.setState({
        exitingModalId,
        visibleModals: newVisibleModals,
      });
    }
  }

  private cleanUpAnimations(mpe: ModalParamsEx): void {
    // Remove our keyframes to avoid polluting the style sheets indefinitely.
    // We have to find these by iteration because insertRule() and deleteRule() do not preserve previous indices.
    const styleSheet = window.document.styleSheets[0];
    const rules = styleSheet.cssRules;
    let entryIndex: number = -1;
    let exitIndex: number = -1;
    for (let i = 0; i < rules.length; ++i) {
      if (entryIndex === -1 && rules.item(i)?.cssText.includes(mpe.entryKeyframeId)) {
        entryIndex = i;
      }
      if (exitIndex === -1 && rules.item(i)?.cssText.includes(mpe.exitKeyframeId)) {
        exitIndex = i;
      }
    }
    // Delete them in the order that won't wreck the other index before we use it.
    if (entryIndex > exitIndex) {
      if (entryIndex > -1 && entryIndex < styleSheet.cssRules.length) styleSheet.deleteRule(entryIndex);
      if (exitIndex > -1 && exitIndex < styleSheet.cssRules.length) styleSheet.deleteRule(exitIndex);
    } else {
      if (exitIndex > -1 && exitIndex < styleSheet.cssRules.length) styleSheet.deleteRule(exitIndex);
      if (entryIndex > -1 && entryIndex < styleSheet.cssRules.length) styleSheet.deleteRule(entryIndex);
    }
  }

  private createAnimations(mpe: ModalParamsEx): void {
    // Entry anim.
    window.document.styleSheets[0].insertRule(`@keyframes ${mpe.entryKeyframeId} { 0% {opacity:0;} 100% {opacity:1;}}`);

    // Exit anim.
    window.document.styleSheets[0].insertRule(
      // We extend the zero-opacity time at the end so we can ensure the modal is fully removed by its timeout before the
      // animation ends (which would otherwise make it blink back into visibility for a moment).
      `@keyframes ${mpe.exitKeyframeId} { 0% {opacity:1;} 25% {opacity:0;} 100% {opacity:0;}}`
    );
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
