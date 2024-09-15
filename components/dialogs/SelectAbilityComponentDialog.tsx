import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectAbilityComponentDialog.module.scss";
import { AbilityComponent, AllAbilityComponentsArray } from "../../staticData/abilityComponents/abilityComponent";
import { InfoButton } from "../InfoButton";
import { AbilityComponentTooltip } from "../database/tooltips/AbilityComponentTooltip";

interface State {
  selectedAbilityComponentId: string;
}

interface ReactProps {
  preselectedAbilityComponentId?: string;
  onSelectionConfirmed: (abilityComponentId: string) => Promise<void>;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectAbilityComponentDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedAbilityComponentId: props.preselectedAbilityComponentId ?? "",
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Ability Component"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {AllAbilityComponentsArray.map(this.renderAbilityComponentRow.bind(this))}
            </div>
          </div>
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

  private renderAbilityComponentRow(component: AbilityComponent, index: number): React.ReactNode {
    const selectedClass = component.id === this.state.selectedAbilityComponentId ? styles.selected : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`abilityComponentRow${index}`}
        onClick={() => {
          this.setState({ selectedAbilityComponentId: component.id });
        }}
      >
        <div className={styles.listName}>{component.name}</div>
        <InfoButton
          className={styles.infoButton}
          tooltipParams={{
            id: component.id,
            content: () => {
              return <AbilityComponentTooltip componentId={component.id} />;
            },
          }}
        />
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedAbilityComponentId);
    this.onCloseClicked();
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const SelectAbilityComponentDialog = connect(mapStateToProps)(ASelectAbilityComponentDialog);
