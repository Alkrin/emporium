/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideContextMenu } from "../redux/contextMenuSlice";
import { RootState } from "../redux/store";
import { showToaster } from "../redux/toastersSlice";
import ContextMenuSource from "./ContextMenuSource";
import Draggable from "./Draggable";
import DraggableHandle from "./DraggableHandle";
import DropTarget from "./DropTarget";
import styles from "./RolePaneDebug.module.scss";

interface State {
  draggablePosition: string;
}

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class RolePaneDebug extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { draggablePosition: "A" };
  }

  public render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <ContextMenuSource
          menuParams={{
            id: "TESTO",
            content: [
              {
                title: "One",
                onClick: () => {
                  this.props.dispatch?.(
                    showToaster({
                      id: "ONE",
                      content: {
                        title: "CONTEXT MENU",
                        message: "SINGLE TOASTER",
                      },
                    })
                  );
                  this.props.dispatch?.(hideContextMenu());
                },
              },
              {
                title: "Two",
                onClick: () => {
                  this.props.dispatch?.(
                    showToaster({
                      id: "TWOA",
                      content: {
                        title: "CONTEXT MENU",
                        message: "TOASTER 1 of 2",
                      },
                    })
                  );
                  this.props.dispatch?.(
                    showToaster({
                      id: "TWOB",
                      content: {
                        title: "CONTEXT MENU",
                        message: "TOASTER 2 of 2",
                      },
                    })
                  );
                  this.props.dispatch?.(hideContextMenu());
                },
              },
              {
                title: "Three",
                onClick: () => {
                  this.props.dispatch?.(
                    showToaster({
                      id: "THREEA",
                      content: {
                        title: "CONTEXT MENU",
                        message: "TOASTER 1 of 3",
                      },
                    })
                  );
                  this.props.dispatch?.(
                    showToaster({
                      id: "THREEB",
                      content: {
                        title: "CONTEXT MENU",
                        message: "TOASTER 2 of 3",
                      },
                    })
                  );
                  this.props.dispatch?.(
                    showToaster({
                      id: "THREEC",
                      content: {
                        title: "CONTEXT MENU",
                        message: "TOASTER 3 of 3",
                      },
                    })
                  );
                  this.props.dispatch?.(hideContextMenu());
                },
              },
            ],
          }}
          style={{
            position: "absolute",
            padding: "1vmin",
            top: "3vmin",
            left: "3vmin",
            backgroundColor: "yellow",
            color: "black",
          }}
        >
          Right Click to show a Context Menu
        </ContextMenuSource>

        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "40%",
            right: "35%",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          The purple square can be dragged and dropped into any of the four
          white squares.
        </div>
        {this.renderDropTarget("A", "35%", "45%")}
        {this.renderDropTarget("B", "35%", "55%")}
        {this.renderDropTarget("C", "45%", "45%")}
        {this.renderDropTarget("D", "45%", "55%")}
      </div>
    );
  }

  private renderDropTarget(
    id: string,
    top: string,
    left: string
  ): React.ReactNode {
    return (
      <DropTarget
        dropID={id}
        dropType={"TEST"}
        style={{
          position: "absolute",
          top,
          left,
          width: "5vmin",
          height: "5vmin",
          border: "2px solid white",
        }}
      >
        {this.state.draggablePosition === id && (
          <Draggable
            draggableID={"TEST"}
            style={{
              backgroundColor: "purple",
              color: "white",
              width: "4vmin",
              height: "4vmin",
              margin: "0.5vmin",
            }}
          >
            <DraggableHandle
              style={{
                border: "1px solid lime",
                width: "4vmin",
                height: "4vmin",
              }}
              draggableID={"TEST"}
              draggingRender={() => (
                <div
                  style={{
                    border: "1px solid lime",
                    backgroundColor: "purple",
                    color: "white",
                    width: "4vmin",
                    height: "4vmin",
                  }}
                />
              )}
              dropType={"TEST"}
              dropHandler={(targetId) => {
                if (targetId) {
                  // TODO: Chrome doesn't like us using setState here, but it works.
                  //       In production we'll probably use Redux instead of local state.
                  this.setState({ draggablePosition: targetId });
                }
              }}
            ></DraggableHandle>
          </Draggable>
        )}
      </DropTarget>
    );
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
  };
}

export default connect(mapStateToProps)(RolePaneDebug);
