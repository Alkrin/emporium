import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { UserRole } from "../../redux/userSlice";
import { StructureComponentData, StructureComponentDefData, StructureData } from "../../serverAPI";
import styles from "./StructuresList.module.scss";
import { CreateStructureSubPanel } from "./CreateStructureSubPanel";
import {
  FilterDropdowns,
  FilterType,
  FilterValueAny,
  FilterValues,
  isFilterMetLocation,
  isFilterMetOwner,
} from "../FilterDropdowns";
import { setActiveStructureId } from "../../redux/structuresSlice";
import { EditButton } from "../EditButton";

interface State {
  filters: FilterValues;
}

interface ReactProps {}

interface InjectedProps {
  activeRole: UserRole;
  currentUserId: number;
  activeStructureId: number;
  structures: Dictionary<StructureData>;
  componentsByStructure: Dictionary<StructureComponentData[]>;
  componentDefs: Dictionary<StructureComponentDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AStructuresList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filters: {
        [FilterType.Owner]: this.props.currentUserId.toString(),
        [FilterType.Location]: FilterValueAny,
      },
    };
  }

  render(): React.ReactNode {
    const structures = this.sortPermittedStructures();

    return (
      <div className={styles.root}>
        <div className={styles.headerContainer}>
          <div className={styles.newStructureButton} onClick={this.onCreateNewClicked.bind(this)}>
            {"Add New Structure"}
          </div>
          {"Filters"}
          <div className={styles.filtersContainer}>
            <FilterDropdowns
              filterOrder={[[FilterType.Owner], [FilterType.Location]]}
              filterValues={this.state.filters}
              onFilterChanged={(filters) => {
                this.setState({ filters });
              }}
            />
          </div>
        </div>
        <div className={styles.listContainer}>
          {structures.map((structure, index) => {
            return this.renderStructureRow(structure, index);
          })}
        </div>
      </div>
    );
  }

  private renderStructureRow(structure: StructureData, index: number): React.ReactNode {
    const selectedClass = structure.id === this.props.activeStructureId ? styles.selected : "";

    return (
      <div
        className={`${styles.listRow} ${selectedClass}`}
        key={`structureRow${index}`}
        onClick={this.onStructureRowClick.bind(this, structure.id)}
      >
        <div className={styles.row}>
          <div className={styles.listName}>{structure.name}</div>
          <EditButton className={styles.editButton} onClick={this.onStructureEditClick.bind(this, structure.id)} />
        </div>
      </div>
    );
  }

  private onStructureRowClick(structureId: number): void {
    if (this.props.activeStructureId !== structureId) {
      this.props.dispatch?.(setActiveStructureId(structureId));
    }
  }

  private onStructureEditClick(structureId: number): void {
    // Editing also selects the structure.
    this.onStructureRowClick(structureId);
    // Open the structureCreator in edit mode.
    this.props.dispatch?.(
      showSubPanel({
        id: "EditStructure",
        content: () => {
          return <CreateStructureSubPanel isEditMode />;
        },
        escapable: true,
      })
    );
  }

  private sortPermittedStructures(): StructureData[] {
    const permittedStructures = Object.values(this.props.structures).filter((structure) => {
      return this.props.activeRole !== "player" || structure.owner_id === this.props.currentUserId;
    });

    const filteredStructures = permittedStructures.filter((structure) => {
      // Apply Owner filter.
      if (!isFilterMetOwner(this.state.filters, structure.owner_id)) {
        return false;
      }

      // Apply Location filter.
      if (!isFilterMetLocation(this.state.filters, structure.location_id)) {
        return false;
      }

      return true;
    });

    filteredStructures.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });

    return filteredStructures;
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "CreateNewStructure",
        content: () => {
          return <CreateStructureSubPanel />;
        },
        escapable: true,
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const { structures, componentsByStructure, activeStructureId } = state.structures;

  return {
    ...props,
    activeRole,
    currentUserId: state.user.currentUser.id,
    structures,
    componentsByStructure,
    activeStructureId,
    componentDefs: state.gameDefs.structureComponents,
  };
}

export const StructuresList = connect(mapStateToProps)(AStructuresList);
