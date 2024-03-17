/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { HUDHorizontalAnchor, HUDVerticalAnchor } from "../redux/hudSlice";
import { RootState } from "../redux/store";
import { TooltipState } from "../redux/tooltipSlice";
import styles from "./TooltipPane.module.scss";

// We offset the tooltip slightly so you can still see what you're hovering the mouse over.
const TOOLTIP_OFFSET_VMIN = 1;

interface State {
  xAnchor: HUDHorizontalAnchor;
  yAnchor: HUDVerticalAnchor;
  yPinned: boolean;
}

interface ReactProps {}

interface InjectedProps {
  // We use ALL of the fields in this class, so just take them all directly.
  tooltipState: TooltipState;
  hudWidth: number;
  hudHeight: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class TooltipPane extends React.Component<Props, State> {
  private tooltipRef: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      // Tooltips show to the bottom right of the mouse by default (i.e. the mouse cursor is the TopLeft anchor of the tooltip).
      xAnchor: HUDHorizontalAnchor.Left,
      yAnchor: HUDVerticalAnchor.Top,
      yPinned: false,
    };
  }

  public render(): React.ReactNode {
    return <div className={styles.root}>{this.renderTooltip()}</div>;
  }

  private renderTooltip(): React.ReactNode {
    if (!this.props.tooltipState.content) {
      return null;
    }

    const content =
      typeof this.props.tooltipState.content === "function"
        ? this.props.tooltipState.content()
        : this.props.tooltipState.content;

    if (!content) {
      return null;
    }

    return (
      <div
        className={styles.tooltipWrapper}
        ref={(r) => {
          this.tooltipRef = r;
          this.recalculateAnchors();
        }}
        style={this.calculateTooltipStyle()}
      >
        {typeof this.props.tooltipState.content === "string" ? (
          <div className={styles.textWrapper}>{content}</div>
        ) : (
          content
        )}
      </div>
    );
  }

  private calculateTooltipStyle(): React.CSSProperties {
    const finalStyle: React.CSSProperties = {
      position: "absolute",
      backgroundColor: this.props.tooltipState.disableBackground ? "inherit" : "#222",
    };

    if (this.state.xAnchor === HUDHorizontalAnchor.Left) {
      finalStyle.left = `calc(${this.props.tooltipState.mouseX ?? 0}px + ${TOOLTIP_OFFSET_VMIN}vmin)`;
    } else {
      finalStyle.right = `calc(${
        this.props.hudWidth - (this.props.tooltipState.mouseX ?? 0)
      }px + ${TOOLTIP_OFFSET_VMIN}vmin)`;
    }

    if (this.state.yPinned) {
      finalStyle.top = "1px";
    } else if (this.state.yAnchor === HUDVerticalAnchor.Top) {
      finalStyle.top = `calc(${this.props.tooltipState.mouseY ?? 0}px + ${TOOLTIP_OFFSET_VMIN}vmin)`;
    } else {
      finalStyle.bottom = `calc(${
        this.props.hudHeight - (this.props.tooltipState.mouseY ?? 0)
      }px + ${TOOLTIP_OFFSET_VMIN}vmin)`;
    }

    return finalStyle;
  }

  private recalculateAnchors(): void {
    if (!this.tooltipRef) {
      return;
    }

    const pxToVmin = Math.min(this.props.hudHeight, this.props.hudWidth) / 100;

    const bounds = this.tooltipRef.getBoundingClientRect();
    // If the tooltip hangs off the right edge (or has ceased to do so), change its horizontal anchor.
    if (bounds.right > this.props.hudWidth) {
      this.setState({ xAnchor: HUDHorizontalAnchor.Right });
    } else if (
      this.state.xAnchor === HUDHorizontalAnchor.Right &&
      bounds.right + bounds.width + 2 * TOOLTIP_OFFSET_VMIN * pxToVmin < this.props.hudWidth
    ) {
      this.setState({ xAnchor: HUDHorizontalAnchor.Left });
    }

    // If the tooltip hangs off the bottom edge (or has ceased to do so), change its vertical anchor.
    if (bounds.bottom > this.props.hudHeight) {
      this.setState({ yAnchor: HUDVerticalAnchor.Bottom, yPinned: false });
    } else if (
      this.state.yAnchor === HUDVerticalAnchor.Bottom &&
      bounds.bottom + bounds.height + 2 * TOOLTIP_OFFSET_VMIN * pxToVmin < this.props.hudHeight
    ) {
      this.setState({ yAnchor: HUDVerticalAnchor.Top, yPinned: false });
    } else if (this.state.yAnchor === HUDVerticalAnchor.Bottom && bounds.top < 0) {
      this.setState({ yPinned: true });
    }
    // However, if it is hanging off of the left or top edge, we have already flipped the anchor,
    // and there's no point in flipping it back, since we will overflow either way.
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // If the content changed, reset the anchors for the new tooltip.
    if (prevProps.tooltipState?.content !== this.props.tooltipState?.content) {
      this.setState({
        xAnchor: HUDHorizontalAnchor.Left,
        yAnchor: HUDVerticalAnchor.Top,
        yPinned: false,
      });
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const tooltipState = state.tooltip;
  const { hudWidth, hudHeight } = state.hud;

  return {
    ...ownProps,
    tooltipState,
    hudWidth,
    hudHeight,
  };
}

export default connect(mapStateToProps)(TooltipPane);
