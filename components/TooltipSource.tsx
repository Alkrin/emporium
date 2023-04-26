/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { hideTooltip, showTooltip, TooltipParams, updateTooltip } from "../redux/tooltipSlice";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltipParams: TooltipParams;
}

interface InjectedProps {
  currentTooltipId: string | null;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class TooltipSource extends React.Component<Props> {
  public render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { children, tooltipParams, currentTooltipId, dispatch, ...otherProps } = this.props;
    return (
      <div
        {...otherProps}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
      >
        {children}
      </div>
    );
  }

  private onMouseEnter(e: React.MouseEvent) {
    const newParams: TooltipParams = {
      ...this.props.tooltipParams,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    this.props.dispatch?.(showTooltip(newParams));
  }

  private onMouseMove(e: React.MouseEvent) {
    const newParams: Partial<TooltipParams> = {
      ...this.props.tooltipParams,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };
    this.props.dispatch?.(updateTooltip(newParams));
  }

  private onMouseLeave() {
    this.props.dispatch?.(hideTooltip());
  }

  componentWillUnmount(): void {
    if (this.props.currentTooltipId === this.props.tooltipParams.id) {
      this.props.dispatch?.(hideTooltip());
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const currentTooltipId = state.tooltip.id;
  return {
    ...ownProps,
    currentTooltipId,
  };
}

export default connect(mapStateToProps)(TooltipSource);
