/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { reportDraggableBounds } from "../redux/dragAndDropSlice";
import { RootState } from "../redux/store";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Must match with the draggableID on a DraggableHandle. */
  draggableID: string;
}

interface InjectedProps {
  currentDraggableID: string | null;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class Draggable extends React.Component<Props> {
  private ref: HTMLDivElement | null = null;
  public render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const {
      children,
      style,
      draggableID,
      currentDraggableID,
      dispatch,
      ...otherProps
    } = this.props;

    const finalStyle = {};
    if (style) {
      Object.assign(finalStyle, style);
    }
    // When dragging, we render the dragged item elsewhere, but we retain the original to preserve layout flow.
    const draggingStyle =
      draggableID === currentDraggableID ? { opacity: 0.5 } : {};
    Object.assign(finalStyle, draggingStyle);

    return (
      <div
        {...otherProps}
        id={`Draggable_${draggableID}`}
        ref={(r) => {
          this.ref = r;
        }}
        style={finalStyle}
      >
        {children}
      </div>
    );
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    if (this.ref && this.props.draggableID === this.props.currentDraggableID) {
      // This Draggable is currently being dragged, so report its bounds. We need its
      // size and position so that the dragRender output will match.
      const bounds = this.ref.getBoundingClientRect();
      this.props.dispatch?.(reportDraggableBounds(bounds));
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { currentDraggableID } = state.dragAndDrop;

  return {
    ...ownProps,
    currentDraggableID,
  };
}

export default connect(mapStateToProps)(Draggable);
