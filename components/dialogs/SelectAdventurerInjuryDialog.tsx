import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectAdventurerInjuryDialog.module.scss";
import { InjuryNamesById, SortedInjuryIds } from "../../staticData/injuries/AllInjuries";

interface State {
  selectedInjuryIds: string[];
}

interface ReactProps {
  preselectedInjuryIds: string[];
  onSelectionConfirmed: (injuryIds: string[]) => Promise<void>;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectAdventurerInjuryDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedInjuryIds: props.preselectedInjuryIds,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Injuries"}</div>

        <div className={styles.contentRow}>
          <div className={styles.injuriesListContainer}>{SortedInjuryIds.map(this.renderInjuryRow.bind(this))}</div>
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Selection"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Cancel"}
        </div>
      </div>
    );
  }

  private renderInjuryRow(injuryId: string, index: number): React.ReactNode {
    return (
      <div
        className={`${styles.listRow} ${this.state.selectedInjuryIds.includes(injuryId) ? styles.selected : ""}`}
        key={`injuryRow${index}`}
        onClick={() => {
          let injuries: string[] = [...this.state.selectedInjuryIds];
          if (injuries.includes(injuryId)) {
            // Remove it.
            injuries = injuries.filter((iid) => {
              return iid !== injuryId;
            });
          } else {
            // Add it.
            injuries.push(injuryId);
          }
          this.setState({ selectedInjuryIds: injuries });
        }}
      >
        <div className={styles.listName}>{InjuryNamesById[injuryId]}</div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedInjuryIds);
    this.onCloseClicked();
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SelectAdventurerInjuryDialog = connect(mapStateToProps)(ASelectAdventurerInjuryDialog);
