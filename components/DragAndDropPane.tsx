/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import styles from "./DragAndDropPane.module.scss";

interface ReactProps {}

interface InjectedProps {
  currentDraggableId: string | null;
  currentDraggableBounds: DOMRect | null;
  currentDraggingRender: (() => React.ReactNode) | null;
  dragDelta: [number, number];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class DragAndDropPane extends React.Component<Props> {
  public render(): React.ReactNode {
    const dragClass = (this.props.currentDraggableId?.length ?? 0) > 0 ? styles.dragging : "";
    return <div className={`${styles.root} ${dragClass}`}>{this.renderDraggable()}</div>;
  }

  private renderDraggable(): React.ReactNode {
    if (
      (this.props.currentDraggableId?.length ?? 0) > 0 &&
      this.props.currentDraggingRender &&
      this.props.currentDraggableBounds
    ) {
      // We explicitly force the size to match the original Draggable in case that Draggable's layout was
      // dependent on its parent or siblings (since our draggingRender here won't match those).
      const { x, y, width, height } = this.props.currentDraggableBounds;
      const draggableStyle: React.CSSProperties = {
        position: "absolute",
        top: `${y + this.props.dragDelta[1]}px`,
        left: `${x + this.props.dragDelta[0]}px`,
        width: `${width}px`,
        height: `${height}px`,
      };
      return <div style={draggableStyle}>{this.props.currentDraggingRender()}</div>;
    } else {
      return null;
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const { currentDraggableId, currentDraggableBounds, currentDraggingRender, dragDelta } = state.dragAndDrop;

  return {
    ...ownProps,
    currentDraggableId,
    currentDraggableBounds,
    currentDraggingRender,
    dragDelta,
  };
}

export default connect(mapStateToProps)(DragAndDropPane);
