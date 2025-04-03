import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectStructuresDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { StructureData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";
import { ModalCloseButton } from "../ModalCloseButton";

interface State {
  selectedStructureIds: number[];
}

interface ReactProps {
  preselectedStructureIds: number[];
  onSelectionConfirmed: (structureIds: number[]) => Promise<void>;
}

interface InjectedProps {
  allStructures: Dictionary<StructureData>;
  activeRole: UserRole;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectStructuresDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStructureIds: props.preselectedStructureIds,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Structures"}</div>

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

        <ModalCloseButton />
      </div>
    );
  }

  private renderStructureRow(structure: StructureData, index: number): React.ReactNode {
    const selectedClass = this.state.selectedStructureIds.includes(structure.id) ? styles.selected : "";
    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`structureRow${index}`}
        onClick={() => {
          if (this.state.selectedStructureIds.includes(structure.id)) {
            this.setState({
              selectedStructureIds: this.state.selectedStructureIds.filter((sid) => sid !== structure.id),
            });
          } else {
            this.setState({ selectedStructureIds: [...this.state.selectedStructureIds, structure.id] });
          }
        }}
      >
        <div className={styles.listName}>{structure.name}</div>
      </div>
    );
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedStructureIds);
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

export const SelectStructuresDialog = connect(mapStateToProps)(ASelectStructuresDialog);
