import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectLocationDialog.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { LocationData } from "../../serverAPI";
import { HexMapWindow } from "../world/HexMapWindow";
import TooltipSource from "../TooltipSource";
import { LocationTooltip } from "../tooltips/LocationTooltip";

interface State {
  selectedLocationId: number;
}

interface ReactProps {
  preselectedLocationId: number;
  onSelectionConfirmed: (locationId: number) => Promise<void>;
  locationIdWhitelist?: number[];
}

interface InjectedProps {
  locations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectLocationDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedLocationId: props.preselectedLocationId,
    };
  }

  render(): React.ReactNode {
    const selectedLocation = this.props.locations[this.state.selectedLocationId];

    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select Location"}</div>

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
          <HexMapWindow
            className={styles.mapWindow}
            mapId={selectedLocation?.map_id ?? 0}
            hexId={selectedLocation?.hex_id ?? 0}
          />
        </div>

        <div className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          Confirm Selection
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Cancel
        </div>
      </div>
    );
  }

  private renderLocationRow(location: LocationData, index: number): React.ReactNode {
    return (
      <TooltipSource
        className={`${styles.listRow} ${location.id === this.state.selectedLocationId ? styles.selected : ""}`}
        key={`locationRow${index}`}
        tooltipParams={{
          id: `Location${location.id}`,
          content: () => {
            return location.id === 0 ? null : <LocationTooltip data={location} />;
          },
        }}
        onClick={() => {
          this.setState({ selectedLocationId: location.id });
        }}
      >
        <div className={styles.listName}>{location.name}</div>
      </TooltipSource>
    );
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedLocationId);
    this.onCloseClicked();
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

export const SelectLocationDialog = connect(mapStateToProps)(ASelectLocationDialog);
