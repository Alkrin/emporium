/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../lib/dictionary";
import { endDrag, startDrag, updateDragDelta } from "../redux/dragAndDropSlice";
import { RootState } from "../redux/store";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Must match with the draggableId on a Draggable. */
  draggableId: string;
  /** Used to render the matched Draggable when it is being dragged. */
  draggingRender: () => React.ReactNode;
  /** Can only trigger drop events on DropTargets with a matching dropType. */
  dropTypes: string[];
  /** Fired when a drag ends, whether or not it is over a matching DropTarget. */
  dropHandler?: (dropTargetId: string[]) => void;
}

interface InjectedProps {
  currentDraggableId: string | null;
  currentDraggableBounds: DOMRect | null;
  dragDelta: [number, number];
  dropTargets: Dictionary<Dictionary<DOMRect>>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADraggableHandle extends React.Component<Props> {
  // Storing these here since consumers only care about the delta.
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  private mouseMoveHandler: (e: MouseEvent) => void;
  private mouseUpHandler: (e: MouseEvent) => void;

  constructor(props: Props) {
    super(props);
    // Stashing the function pointers used to register for window events, so we can unregister them later.
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
  }

  public render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const {
      children,
      style,
      draggableId,
      draggingRender,
      dropTypes: dropType,
      dropHandler,
      currentDraggableId,
      currentDraggableBounds,
      dragDelta,
      dropTargets,
      dispatch,
      ...otherProps
    } = this.props;
    return (
      <div
        {...otherProps}
        id={`DraggableHandle_${draggableId}`}
        style={{
          // Defaulting to a technically-visible background color ensures that the handle can
          // receive mouse click events.  In Coherent, any pixel that isn't rendered will only
          // receive mouse move events.
          backgroundColor: "rgba(0,0,0,0.01)",
          ...style,
        }}
        onMouseDown={this.handleMouseDown.bind(this)}
      >
        {children}
      </div>
    );
  }

  private handleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
    // Stash the start coordinates so we can calculate deltas.
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    // Register for window-level events, since we aren't moving the original Draggable.
    // Need to be able to catch the mouseUp and mouseMove when the cursor is over other widgets.
    window.addEventListener("mousemove", this.mouseMoveHandler);
    window.addEventListener("mouseup", this.mouseUpHandler);
    // Tell Redux what we'll be dragging around.
    this.props.dispatch?.(
      startDrag({
        draggableId: this.props.draggableId,
        draggingRender: this.props.draggingRender,
      })
    );
  }

  private handleMouseUp(e: MouseEvent): void {
    // If the item wasn't dragged, then this was really a click event.
    if (Math.abs(this.props.dragDelta[0]) <= 5 && Math.abs(this.props.dragDelta[1]) <= 5) {
      this.props.onClick?.(e as any);
      // We'll still continue on and do all of the drag cleanup, of course.
    }

    // Report the drop before ending the drag so that the dropHandler can still access the current Draggable.
    this.reportDrop();

    // Unregister from the window-level events.
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    window.removeEventListener("mouseup", this.mouseUpHandler);

    // Tell Redux we're done dragging.
    this.props.dispatch?.(endDrag());
  }

  private handleMouseMove(e: MouseEvent): void {
    const dragDeltaX = e.clientX - this.dragStartX;
    const dragDeltaY = e.clientY - this.dragStartY;
    this.setState({ dragDeltaX, dragDeltaY });
    this.props.dispatch?.(updateDragDelta([dragDeltaX, dragDeltaY]));
  }

  private reportDrop(): void {
    // If no one is listening to drop events, no need to report.
    if (!this.props.dropHandler) {
      return;
    }

    // We consider a Draggable to be over a DropTarget if the Draggable's center is within the DropTarget's bounds.
    const dcx =
      (this.props.currentDraggableBounds?.x ?? 0) +
      this.props.dragDelta[0] +
      (this.props.currentDraggableBounds?.width ?? 0) / 2;
    const dcy =
      (this.props.currentDraggableBounds?.y ?? 0) +
      this.props.dragDelta[1] +
      (this.props.currentDraggableBounds?.height ?? 0) / 2;

    // Iterate all matching DropTargets and see if we are over one.
    let targetsFound: string[] = [];
    this.props.dropTypes.forEach((dropType) => {
      Object.entries(this.props.dropTargets[dropType] ?? {}).forEach((entry) => {
        const [dropTargetId, bounds] = entry;

        if (dcx >= bounds.x && dcx <= bounds.right && dcy >= bounds.y && dcy <= bounds.bottom) {
          targetsFound.push(dropTargetId);
        }
      });
    });

    this.props.dropHandler(targetsFound);
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { currentDraggableId, currentDraggableBounds, dragDelta, dropTargets } = state.dragAndDrop;

  return {
    ...ownProps,
    currentDraggableId,
    currentDraggableBounds,
    dragDelta,
    dropTargets,
  };
}

export const DraggableHandle = connect(mapStateToProps)(ADraggableHandle);
