/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { ContextMenuParams, hideContextMenu, showContextMenu } from "../redux/contextMenuSlice";
import { RootState } from "../redux/store";
import { hideTooltip } from "../redux/tooltipSlice";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  menuParams: ContextMenuParams;
}

interface InjectedProps {
  currentMenuId: string | null;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ContextMenuSource extends React.Component<Props> {
  public render(): React.ReactNode {
    // We pull out `children` and our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { children, menuParams, currentMenuId, dispatch, ...otherProps } = this.props;
    return (
      <div {...otherProps} onMouseDown={this.onMouseDown.bind(this)}>
        {children}
      </div>
    );
  }

  private onMouseDown(e: React.MouseEvent) {
    // Right click?
    if (e.button === 2) {
      const newParams: ContextMenuParams = {
        ...this.props.menuParams,
        mouseX: e.clientX,
        mouseY: e.clientY,
      };
      this.props.dispatch?.(showContextMenu(newParams));
      // For items with both a tooltip and a context menu, the context menu  takes precedence.
      this.props.dispatch?.(hideTooltip());
      // We are the final handler if we summon a context menu.
      e.stopPropagation();
      // And we don't want the browser's right-click menu to pop up.
      e.preventDefault();
    }
  }

  componentWillUnmount(): void {
    if (this.props.currentMenuId === this.props.menuParams.id) {
      this.props.dispatch?.(hideContextMenu());
    }
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  const currentMenuId = state.contextMenu.id;
  return {
    ...ownProps,
    currentMenuId: currentMenuId,
  };
}

export default connect(mapStateToProps)(ContextMenuSource);
