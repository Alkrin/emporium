import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectNamedValuesDialog.module.scss";
import TooltipSource from "../TooltipSource";

interface State {
  selections: any[];
}

interface ReactProps {
  prompt: string;
  availableValues: [string, any][];
  allowMultiSelect?: boolean;
  preselectedValues?: any[];
  onSelectionConfirmed: (selectedValues: any[]) => void;
  renderTooltip?: (value: any) => React.ReactNode;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectNamedValuesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { selections: props.preselectedValues ?? [] };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.prompt}>{this.props.prompt}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.stringListRoot}>
              {this.props.availableValues.map(this.renderValueRow.bind(this))}
            </div>
          </div>
        </div>
        <div className={styles.actionButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Confirm Selection"}
        </div>
        <div className={styles.actionButton} onClick={this.onCancelClicked.bind(this)}>
          {"Cancel"}
        </div>
      </div>
    );
  }

  private renderValueRow(aEntry: [string, any], index: number): React.ReactNode {
    const [name, value] = aEntry;
    const sv = JSON.stringify(value);
    const isSelected = !!this.state.selections.find((s: any) => {
      return JSON.stringify(s) === sv;
    });
    const selectedStyle = isSelected ? styles.selected : "";

    return (
      <TooltipSource
        key={index}
        className={`${styles.stringListRowContentWrapper} ${selectedStyle}`}
        onClick={() => {
          if (this.props.allowMultiSelect) {
            if (isSelected) {
              this.setState({
                selections: this.state.selections.filter((s) => {
                  return JSON.stringify(s) !== sv;
                }),
              });
            } else {
              this.setState({ selections: [...this.state.selections, value] });
            }
          } else {
            this.setState({ selections: [value] });
          }
        }}
        tooltipParams={{
          id: JSON.stringify(value),
          content: () => {
            if (this.props.renderTooltip) {
              return this.props.renderTooltip(value);
            }
            return null;
          },
        }}
      >
        <div className={styles.string}>{name}</div>
      </TooltipSource>
    );
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selections);
    this.props.dispatch?.(hideModal());
  }

  private onCancelClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SelectNamedValuesDialog = connect(mapStateToProps)(ASelectNamedValuesDialog);
