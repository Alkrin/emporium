import * as React from "react";
import styles from "./SheetRoot.module.scss";

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {}

export class SheetRoot extends React.Component<ReactProps> {
  render(): React.ReactNode {
    const { className, children, ...otherProps } = this.props;
    return (
      <div className={`${styles.root} ${className}`}>
        <div className={styles.background} />
        <div className={styles.scroller}>
          <div className={styles.contentWidthSizer}>{children}</div>
        </div>
      </div>
    );
  }
}
