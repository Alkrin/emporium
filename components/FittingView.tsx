/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ResizeDetector } from './ResizeDetector';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  contentClassName?: string;
}

interface State {
  sizeMultiplier: number;
}

export class FittingView extends React.Component<Props, State> {
  containerWidth: number = -1;
  containerHeight: number = -1;
  contentWidth: number = -1;
  contentHeight: number = -1;

  constructor(props: Props) {
    super(props);
    this.state = {
      sizeMultiplier: 1
    };
  }

  public render() {
    const { className, contentClassName, children, ...otherProps } = this.props;
    return (
      <div className={className} {...otherProps}>
        <ResizeDetector onResize={this.onContainerResize.bind(this)} />
        <div
          className={contentClassName}
          style={{
            transform: `scale(${this.state.sizeMultiplier}) translate(-50%,-50%)`,
            transformOrigin: 'top left',
            position: 'absolute',
            left: '50%',
            top: '50%'
          }}
        >
          <ResizeDetector onResize={this.onContentResize.bind(this)} />
          {children}
        </div>
      </div>
    );
  }

  private onContainerResize(newWidth: number, newHeight: number, oldWidth: number, oldHeight: number): void {
    this.containerWidth = newWidth;
    this.containerHeight = newHeight;

    this.calculateSizeMultiplier();
  }

  private onContentResize(newWidth: number, newHeight: number, oldWidth: number, oldHeight: number): void {
    this.contentWidth = newWidth;
    this.contentHeight = newHeight;

    this.calculateSizeMultiplier();
  }

  private calculateSizeMultiplier(): void {
    // Only calculate once both content and container have been initialized.
    const { containerWidth, containerHeight, contentWidth, contentHeight } = this;
    if (containerWidth >= 0 && contentWidth >= 0) {
      let sizeMultiplier = 1.0;
      if (contentWidth === 0 || contentHeight === 0 || containerWidth === 0 || containerHeight === 0) {
        // Content is invisible, so might as well hide it.
        sizeMultiplier = 0;
      } else if (contentWidth / contentHeight > containerWidth / containerHeight) {
        // Content is Wide, so width should match perfectly.
        sizeMultiplier = containerWidth / contentWidth;
      } else {
        // Content is Tall, so height should match perfectly.
        sizeMultiplier = containerHeight / contentHeight;
      }

      requestAnimationFrame(() => {
        this.setState({ sizeMultiplier });
      });
    }
  }
}
