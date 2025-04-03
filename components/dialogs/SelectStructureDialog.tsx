import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectStructureDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { StructureData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";

interface State {
  selectedStructureId: number;
}

interface ReactProps {
  preselectedStructureId: number;
  onSelectionConfirmed: (structureId: number) => Promise<void>;
}

interface InjectedProps {
  allStructures: Dictionary<StructureData>;
  activeRole: UserRole;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectStructureDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStructureId: props.preselectedStructureId,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Structure"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderStructureRow(
                {
                  id: 0,
                  name: "---",
                  description: "",
                  location_id: 0,
                  maintenance_date: "",
                  owner_id: 0,
                },
                -1
              )}
              {this.getSortedStructures().map(this.renderStructureRow.bind(this))}
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

  private renderStructureRow(structure: StructureData, index: number): React.ReactNode {
    const selectedClass = structure.id === this.state.selectedStructureId ? styles.selected : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`structureRow${index}`}
        onClick={() => {
          this.setState({ selectedStructureId: structure.id });
        }}
      >
        <div className={styles.listName}>{structure.name}</div>
      </div>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedStructureId);
    this.onCloseClicked();
  }

  private getSortedStructures(): StructureData[] {
    const permittedStructures = Object.values(this.props.allStructures).filter((structure) => {
      return this.props.activeRole !== "player" || structure.owner_id === this.props.currentUserId;
    });

    permittedStructures.sort((structureA, structureB) => {
      // And an alphy sort when the others don't apply.
      const nameA = structureA.name;
      const nameB = structureB.name;

      return nameA.localeCompare(nameB);
    });

    return permittedStructures;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allStructures = state.structures.structures;
  const { activeRole } = state.hud;
  const currentUserId = state.user.currentUser.id;

  return {
    ...props,
    allStructures,
    activeRole,
    currentUserId,
  };
}

export const SelectStructureDialog = connect(mapStateToProps)(ASelectStructureDialog);
