/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { removeDropTarget, reportDropTargetBounds } from "../redux/dragAndDropSlice";
import { RootState } from "../redux/store";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The drop handler will receive this dropID. */
  dropID: string;
  /** Only Draggables with a matching dropType will trigger drop events. */
  dropTypes: string[];
}

interface InjectedProps {
  dispatch?: Dispatch;
  // hudWidth and hudHeight are not directly used, but injecting them ensures that this widget
  // reports its bounds on a screen resize.
  hudWidth: number;
  hudHeight: number;
}

type Props = ReactProps & InjectedProps;

class DropTarget extends React.Component<Props> {
  private needsToReportBounds: boolean = true;
  private ref: HTMLDivElement | null = null;
  public render(): React.ReactNode {
    this.reportBounds();
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { children, dropID, dropTypes, dispatch, hudWidth, hudHeight, ...otherProps } = this.props;
    return (
      <div
        {...otherProps}
        ref={(r) => {
          this.ref = r;
          this.reportBounds();
        }}
      >
        {children}
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if (this.props.hudHeight !== prevProps.hudHeight || this.props.hudWidth !== prevProps.hudWidth) {
      this.needsToReportBounds = true;
    }
    this.reportBounds();
  }

  private reportBounds(): void {
    if (this.ref && this.needsToReportBounds) {
      this.needsToReportBounds = false;
      // These bounds are used by DraggableHandle to decide if a drag was dropped on a target.
      const bounds = this.ref.getBoundingClientRect();
      this.props.dispatch?.(
        reportDropTargetBounds({
          dropTargetID: this.props.dropID,
          dropTypes: this.props.dropTypes,
          bounds,
        })
      );
    }
  }

  componentWillUnmount(): void {
    this.props.dispatch?.(
      removeDropTarget({
        dropTargetID: this.props.dropID,
        dropTypes: this.props.dropTypes,
      })
    );
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { hudWidth, hudHeight } = state.hud;

  return {
    ...ownProps,
    hudWidth,
    hudHeight,
  };
}

export default connect(mapStateToProps)(DropTarget);
