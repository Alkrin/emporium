/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as React from "react";
import { RootState } from "./store";
import { Dispatch } from "redux";
import { connect } from "react-redux";

interface ReactProps {
  onReduxUpdate(
    reduxState: RootState | undefined,
    dispatch: Dispatch | undefined
  ): void;
}

interface InjectedProps {
  dispatch?: Dispatch<any>;
  reduxState?: RootState;
}

type Props = ReactProps & InjectedProps;

class RootStateListener extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    return <></>;
  }

  componentDidMount() {
    this.props.onReduxUpdate(this.props.reduxState, this.props.dispatch);
  }

  componentDidUpdate() {
    this.props.onReduxUpdate(this.props.reduxState, this.props.dispatch);
  }
}

function mapStateToProps(state: RootState, ownProps: ReactProps): Props {
  return {
    ...ownProps,
    reduxState: state,
  };
}

const ReduxStateListener = connect(mapStateToProps)(RootStateListener);

/**
 * This is a base class that provides ready access to dispatch and reduxState.
 * Inheritors should be added to render functions describing their lifecycle,
 * such as inside the "SharedContextProviders' render function for always
 * on connections.
 */
export default abstract class ExternalDataSource<
  P = {},
  S = {},
  SS = any
> extends React.Component<P, S, SS> {
  protected dispatch: Dispatch<any> | null = null;
  protected reduxState: RootState | null = null;

  render() {
    // The thing returned from a connect() call can be rendered, but not directly inherited from.
    // Thus this extra wrapper layer.
    return <ReduxStateListener onReduxUpdate={this.onReduxUpdate.bind(this)} />;
  }

  /**
   * Can be overridden in subclasses to give ready access to data change events.
   * Remember to call super.onReduxUpdate or else the base functionality will break!
   * @param reduxState
   * @param dispatch
   */
  protected onReduxUpdate(reduxState: RootState, dispatch: Dispatch): void {
    this.dispatch = dispatch;
    this.reduxState = reduxState;
  }
}
