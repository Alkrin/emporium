import * as React from "react";
import styles from "./ActivitiesPanel.module.scss";

export class ActivitiesPanel extends React.Component {
  render(): React.ReactNode {
    return <div className={styles.root}>Activities</div>;
  }
}
