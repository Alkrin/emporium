import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectLocationsDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { LocationData } from "../../serverAPI";
import { HexMapWindow } from "../world/HexMapWindow";
import TooltipSource from "../TooltipSource";
import { LocationTooltip } from "../tooltips/LocationTooltip";
import { ModalCloseButton } from "../ModalCloseButton";

interface State {
  selectedLocationIds: number[];
}

interface ReactProps {
  preselectedLocationIds: number[];
  onSelectionConfirmed: (locationIds: number[]) => Promise<void>;
  locationIdWhitelist?: number[];
}

interface InjectedProps {
  locations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectLocationsDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedLocationIds: props.preselectedLocationIds,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Locations"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderLocationRow(
                {
                  id: 0,
                  name: "---",
                  description: "",
                  map_id: 0,
                  hex_id: 0,
                  type: "",
                  type_data: {},
                  icon_url: "",
                },
                -1
              )}
              {this.getSortedLocations().map(this.renderLocationRow.bind(this))}
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

  private renderLocationRow(location: LocationData, index: number): React.ReactNode {
    return (
      <TooltipSource
        className={`${styles.listRow} ${this.state.selectedLocationIds.includes(location.id) ? styles.selected : ""}`}
        key={`locationRow${index}`}
        tooltipParams={{
          id: `Location${location.id}`,
          content: () => {
            return location.id === 0 ? null : <LocationTooltip data={location} />;
          },
        }}
        onClick={() => {
          if (this.state.selectedLocationIds.includes(location.id)) {
            this.setState({ selectedLocationIds: this.state.selectedLocationIds.filter((lid) => lid !== location.id) });
          } else {
            this.setState({ selectedLocationIds: [...this.state.selectedLocationIds, location.id] });
          }
        }}
      >
        <div className={styles.listName}>{location.name}</div>
      </TooltipSource>
    );
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedLocationIds);
    this.props.dispatch?.(hideModal());
  }

  private getSortedLocations(): LocationData[] {
    let l: LocationData[] = Object.values(this.props.locations);
    if (this.props.locationIdWhitelist) {
      l = l.filter((data) => this.props.locationIdWhitelist?.includes(data.id));
    }

    // Sort by by name.
    l.sort(({ name: nameA }, { name: nameB }) => {
      return nameA.localeCompare(nameB);
    });

    return l;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { locations } = state.locations;
  return {
    ...props,
    locations,
  };
}

export const SelectLocationsDialog = connect(mapStateToProps)(ASelectLocationsDialog);
