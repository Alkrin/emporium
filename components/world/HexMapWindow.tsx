import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { LocationData, MapData, MapHexData } from "../../serverAPI";
import styles from "./HexMapWindow.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { MapHexTypes } from "./MapHexConstants";

interface MapHexDataEx extends MapHexData {
  locations: LocationData[];
}

interface State {
  hexLookup: Dictionary<Dictionary<MapHexDataEx>>;
}

const defaultState: State = {
  hexLookup: {},
};

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  mapId: number;
  hexId: number;
}

interface InjectedProps {
  map?: MapData;
  hexes?: MapHexData[];
  locations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AHexMapWindow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
    requestAnimationFrame(() => {
      this.buildSparseHexLookup();
    });
  }

  render(): React.ReactNode {
    const { className, mapId, hexId, map, hexes, locations, dispatch, ...otherProps } = this.props;

    return (
      <div className={`${styles.root} ${className}`} {...otherProps}>
        {this.props.map ? (
          <div
            className={styles.mapRoot}
            // Have to manually calculate width or else the mapRoot maxWidth matches parent width.
            style={{ width: `${20 + (this.props.map.max_x - this.props.map.min_x + 1) * 5.3}vmin` }}
          >
            {this.renderHexes()}
          </div>
        ) : (
          <img className={styles.mapPlaceholder} src={"/images/MapPlaceholder.png"} />
        )}
      </div>
    );
  }

  private renderHexes(): React.ReactNode[] {
    const columns: React.ReactNode[] = [];

    const map = this.props.map;
    if (map) {
      for (let x = map.min_x; x <= map.max_x; ++x) {
        const columnHexes: React.ReactNode[] = [];
        for (let y = map.min_y; y <= map.max_y; ++y) {
          columnHexes.push(this.renderHex(x, y));
        }

        columns.push(
          <div key={x} className={`${styles.hexColumn} ${x % 2 ? styles.odd : ""}`}>
            {columnHexes}
          </div>
        );
      }
    }

    return columns;
  }

  private renderHex(x: number, y: number): React.ReactNode {
    const hex = this.state.hexLookup[x]?.[y];
    const type = styles[hex?.type ?? MapHexTypes.Undefined];

    const shouldShowCoords = true;
    const shouldShowIcons = hex?.locations?.length > 0 && true;

    const isTargetHex = hex?.id === this.props.hexId;
    const targetRef = isTargetHex
      ? {
          ref: (r: HTMLDivElement) => {
            requestAnimationFrame(() => {
              if (r) {
                r.scrollIntoView({
                  behavior: "auto",
                  block: "center",
                  inline: "center",
                });
              }
            });
          },
        }
      : {};

    return (
      <div key={y} className={`${styles.hexRoot} ${type}`} {...targetRef}>
        {shouldShowIcons ? this.renderHexIcon(hex) : null}
        {shouldShowCoords ? (
          <div className={styles.hexCoordinates}>
            {x},{y}
          </div>
        ) : null}
      </div>
    );
  }

  private renderHexIcon(hex: MapHexDataEx): React.ReactNode {
    const locationsWithIcons = hex.locations.filter((loc) => {
      return loc.icon_url.length > 0;
    });
    if (locationsWithIcons.length === 0) {
      return null;
    }

    return <img className={styles.hexIcon} src={locationsWithIcons[0].icon_url} />;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (
      this.props.hexes !== prevProps.hexes ||
      this.props.locations !== prevProps.locations ||
      this.props.mapId !== prevProps.mapId ||
      this.props.hexId !== prevProps.hexId
    ) {
      requestAnimationFrame(() => {
        this.buildSparseHexLookup();
      });
    }
  }

  private buildSparseHexLookup(): void {
    // Using dictionaries to support negative indices.
    const locs = Object.values(this.props.locations) ?? [];
    const data: Dictionary<Dictionary<MapHexDataEx>> = {};
    const hexes = this.props.hexes;
    if (hexes) {
      hexes.forEach((hex) => {
        // Make sure the column exists.
        if (!data[hex.x]) {
          data[hex.x] = {};
        }
        const locations = locs.filter((location) => {
          return location.hex_id === hex.id;
        });
        locations.sort(this.sortLocations);
        data[hex.x][hex.y] = { ...hex, locations };
      });
    }

    this.setState({ hexLookup: data });
  }

  private sortLocations(a: LocationData, b: LocationData): number {
    // Sort by location type first.
    const typeSort = a.type.localeCompare(b.type);
    if (typeSort !== 0) {
      return typeSort;
    }

    // Sort  by name second.
    const nameSort = a.name.localeCompare(b.name);
    return nameSort;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const map = state.maps.maps[props.mapId];
  const hexes = state.maps.mapHexesByMap[props.mapId];
  const locations = state.locations.locations;
  return {
    ...props,
    map,
    hexes,
    locations,
  };
}

export const HexMapWindow = connect(mapStateToProps)(AHexMapWindow);
