import * as React from "react";
import styles from "./WorldPanel.module.scss";

export class WorldPanel extends React.Component {
  render(): React.ReactNode {
    return <div className={styles.root}>World</div>;
  }
}
