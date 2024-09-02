import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { StructureComponentData, StructureComponentDefData } from "../../serverAPI";
import styles from "./EditStructureComponentSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { deleteStructureComponent, updateStructureComponent } from "../../redux/structuresSlice";
import { BasicDialog } from "../dialogs/BasicDialog";

interface State {
  countString: string;
  isSaving: boolean;
}

interface ReactProps {
  component: StructureComponentData;
}

interface InjectedProps {
  componentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditStructureComponentSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      countString: props.component.quantity.toFixed(2),
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    let nextTabIndex: number = 1;

    const def = this.props.componentDefs[this.props.component.component_id];

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>{`Editing Structure Component #${this.props.component.id}`}</div>
        <div className={styles.contentRow}>
          <div className={styles.infoPanel}>
            <div className={styles.componentLabel}>{def.name}</div>
            <div className={styles.horizontalLine} />
            <div className={styles.descriptionContainer}>
              <div className={styles.descriptionLabel}>{def.description}</div>
            </div>
            <div className={styles.horizontalLine} />
            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>{"Cost:"}</div>
              <div className={styles.infoValue}>{def.cost}gp</div>
            </div>
          </div>
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>Quantity</div>
          <input
            className={styles.countTextField}
            type={"number"}
            value={this.state.countString}
            onChange={(e) => {
              this.setState({ countString: e.target.value });
            }}
            tabIndex={nextTabIndex++}
          />
        </div>

        <div className={styles.buttonRow}>
          <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
            {"Save Changes"}
          </div>
          <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
        </div>

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Send it to the server!
    const res = await ServerAPI.deleteStructureComponent(this.props.component.id);
    if ("error" in res) {
      console.log("Failed to delete structure component.");
    } else {
      // Successfully deleted, so update the local data.
      this.props.dispatch?.(deleteStructureComponent(this.props.component.id));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid count?
    if (+this.state.countString < 1) {
      this.props.dispatch?.(
        showModal({
          id: "NoCountError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please enter a non-zero component quantity!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Create a new component.
    const newComponent: StructureComponentData = {
      ...this.props.component,
      quantity: +this.state.countString,
    };

    // Send it to the server!
    const res = await ServerAPI.editStructureComponent(newComponent);
    if ("error" in res) {
      console.log("Failed to edit structure component.");
    } else {
      // Successfully edited, so update the local data.
      this.props.dispatch?.(updateStructureComponent(newComponent));
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const componentDefs = state.gameDefs.structureComponents;
  return {
    ...props,
    componentDefs,
  };
}

export const EditStructureComponentSubPanel = connect(mapStateToProps)(AEditStructureComponentSubPanel);
