import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { SpellDefData } from "../../serverAPI";
import styles from "./SelectStringsDialog.module.scss";

interface State {
  selectedStrings: string[];
}

interface ReactProps {
  availableStrings: string[];
  preselectedStrings?: string[];
  onSelectionConfirmed: (selectedStrings: string[]) => void;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectStringsDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStrings: props.preselectedStrings ?? [],
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.stringListRoot}>
              {this.props.availableStrings.map(this.renderStringRow.bind(this))}
            </div>
          </div>
        </div>
        <div className={styles.actionButton} onClick={this.onConfirmClicked.bind(this)} tabIndex={4}>
          {"Confirm Selection"}
        </div>
        <div className={styles.actionButton} onClick={this.onCloseClicked.bind(this)} tabIndex={4}>
          {"Close"}
        </div>
      </div>
    );
  }

  private renderStringRow(aString: string, index: number): React.ReactNode {
    return (
      <div
        key={index}
        className={styles.stringListRowContentWrapper}
        onClick={() => {
          if (!this.state.selectedStrings.includes(aString)) {
            this.setState({ selectedStrings: [...this.state.selectedStrings, aString] });
          } else {
            this.setState({ selectedStrings: this.state.selectedStrings.filter((s) => s !== aString) });
          }
        }}
      >
        <input
          className={styles.checkbox}
          type={"checkbox"}
          checked={this.state.selectedStrings.includes(aString)}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              this.setState({ selectedStrings: [...this.state.selectedStrings, aString] });
            } else {
              this.setState({ selectedStrings: this.state.selectedStrings.filter((s) => s !== aString) });
            }
          }}
        />
        <div className={styles.string}>{aString}</div>
      </div>
    );
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedStrings);
    this.onCloseClicked();
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SelectStringsDialog = connect(mapStateToProps)(ASelectStringsDialog);
