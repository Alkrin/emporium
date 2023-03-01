import * as React from "react";
import styles from "./CharactersPanel.module.scss";

export class CharactersPanel extends React.Component {
  render(): React.ReactNode {
    return <div className={styles.root}>Characters</div>;
  }
}
