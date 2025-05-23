import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { DomainData, LocationData, MapData, MapHexData } from "../../serverAPI";
import styles from "./HexMap.module.scss";
import { Dictionary } from "../../lib/dictionary";
import { MapHexTypes } from "./MapHexConstants";
import { HexDisplay, MapHexDataEx } from "./HexDisplay";

export interface HexMapSettings {
  showCoordinates: boolean;
  showLocations: boolean;
  showCityNames: boolean;
  zoomLevel: number;
}

interface State {
  hexLookup: Dictionary<Dictionary<MapHexDataEx>>;
  selectedX: number;
  selectedY: number;
  isDragging: boolean;
  dragStart: [number, number];
  scrollStart: [number, number];
  needsAutoScroll: boolean;
}

const defaultState: State = {
  hexLookup: {},
  selectedX: Number.MIN_SAFE_INTEGER,
  selectedY: Number.MIN_SAFE_INTEGER,
  isDragging: false,
  dragStart: [0, 0],
  scrollStart: [0, 0],
  needsAutoScroll: false,
};

interface ReactProps {
  mapID: number;
  onHexSelected: (x: number, y: number) => void;
  settings: HexMapSettings;
  renderCustomOverlay?: (mapHexId: number) => React.ReactNode;
  /** If supplied, we will auto-scroll to the hex at the coordinates. */
  focusCoordinates?: [number, number];
}

interface InjectedProps {
  map?: MapData;
  hexes?: MapHexData[];
  locations: Dictionary<LocationData>;
  allDomains: Record<number, DomainData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AHexMap extends React.Component<Props, State> {
  private rootRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      ...defaultState,
      // If focus coordinates are set, we should scroll to them.
      needsAutoScroll: !!props.focusCoordinates,
    };

    requestAnimationFrame(() => {
      this.buildSparseHexLookup();
      this.attemptAutoScroll();
    });
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root} ref={this.rootRef} onMouseDown={this.onMouseDown.bind(this)}>
        {this.props.map ? (
          <div
            className={styles.mapRoot}
            // Have to manually calculate width or else the mapRoot maxWidth matches parent width.
            style={{
              width: `${20 + (this.props.map.max_x - this.props.map.min_x + 1) * 5.3}vmin`,
              zoom: `${this.props.settings.zoomLevel}`,
            }}
          >
            {this.renderHexes()}
            <div className={styles.mapOverlayRoot}>{this.renderHexOverlays()}</div>
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

  private renderHexOverlays(): React.ReactNode[] {
    const columns: React.ReactNode[] = [];

    const map = this.props.map;
    if (map) {
      for (let x = map.min_x; x <= map.max_x; ++x) {
        const columnHexes: React.ReactNode[] = [];
        for (let y = map.min_y; y <= map.max_y; ++y) {
          columnHexes.push(this.renderHexOverlay(x, y));
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

  private renderHexOverlay(x: number, y: number): React.ReactNode {
    const hex = this.getHexDataAt(x, y);

    const shouldShowCityNames = this.props.settings.showCityNames;

    return (
      <div key={y} className={styles.overlayHexRoot}>
        {shouldShowCityNames && this.renderCityName(hex)}
        {this.props.renderCustomOverlay?.(hex.id) ?? null}
      </div>
    );
  }

  private getHexDataAt(x: number, y: number): MapHexDataEx {
    const hex: MapHexDataEx = this.state.hexLookup[x]?.[y] ?? {
      id: 0,
      map_id: this.props.mapID,
      x,
      y,
      type: MapHexTypes.Undefined,
      roads: [],
      rivers: [],
      locations: [],
      cityName: "",
    };

    return hex;
  }

  private renderHex(x: number, y: number): React.ReactNode {
    const hex = this.getHexDataAt(x, y);
    const type = styles[hex?.type ?? MapHexTypes.Undefined];
    const selectedStyle = x === this.state.selectedX && y === this.state.selectedY ? styles.selected : "";

    const shouldShowCoords = this.props.settings.showCoordinates;
    const shouldShowIcons = (hex?.locations?.length ?? 0) > 0 && this.props.settings.showLocations;

    return (
      <HexDisplay
        key={y}
        className={`${styles.hexRoot} ${type} ${selectedStyle}`}
        data={hex}
        height={"6vmin"}
        onClick={this.onHexClicked.bind(this, x, y)}
      >
        {shouldShowIcons ? this.renderHexIcon(hex) : null}
        {shouldShowCoords ? (
          <div className={styles.hexCoordinates}>
            {x},{y}
          </div>
        ) : null}
      </HexDisplay>
    );
  }

  private renderCityName(hex: MapHexDataEx): React.ReactNode {
    if ((hex?.cityName?.length ?? 0) === 0) {
      return null;
    }
    return <div className={styles.cityNameLabel}>{hex.cityName}</div>;
  }

  private renderHexIcon(hex: MapHexDataEx): React.ReactNode {
    const locationsWithIcons = (hex.locations ?? []).filter((loc) => {
      return loc.icon_url.length > 0;
    });
    if (locationsWithIcons.length === 0) {
      return null;
    }

    return <img className={styles.hexIcon} src={locationsWithIcons[0].icon_url} />;
  }

  private onMouseDown(e: React.MouseEvent): void {
    if (e.button === 2) {
      this.setState({ isDragging: true, dragStart: [e.pageX, e.pageY] });
      if (this.rootRef.current) {
        this.setState({ scrollStart: [this.rootRef.current.scrollLeft, this.rootRef.current.scrollTop] });
      }
      window.addEventListener("mouseup", this.onScreenMouseUp);
      window.addEventListener("mousemove", this.onScreenMouseMove);
    }
  }

  private onScreenMouseUp = (e: MouseEvent): void => {
    if (e.button === 2) {
      this.setState({ isDragging: false });
      window.removeEventListener("mouseup", this.onScreenMouseUp);
      window.removeEventListener("mousemove", this.onScreenMouseMove);
    }
  };

  private onScreenMouseMove = (e: MouseEvent): void => {
    if (this.rootRef.current && this.state.isDragging) {
      const deltaX = this.state.dragStart[0] - e.pageX;
      const deltaY = this.state.dragStart[1] - e.pageY;

      if (this.rootRef.current) {
        this.rootRef.current.scrollLeft = this.state.scrollStart[0] + deltaX;
        this.rootRef.current.scrollTop = this.state.scrollStart[1] + deltaY;
      }
    }
  };

  private onHexClicked(x: number, y: number): void {
    this.setState({ selectedX: x, selectedY: y });
    this.props.onHexSelected?.(x, y);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.hexes !== prevProps.hexes || this.props.locations !== prevProps.locations) {
      requestAnimationFrame(() => {
        this.buildSparseHexLookup();
      });
    }

    if (
      this.props.focusCoordinates &&
      this.props.focusCoordinates !== prevProps.focusCoordinates &&
      (this.props.focusCoordinates?.[0] !== prevProps.focusCoordinates?.[0] ||
        this.props.focusCoordinates?.[1] !== prevProps.focusCoordinates?.[1])
    ) {
      this.setState({ needsAutoScroll: true });
      this.attemptAutoScroll();
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
        const city = locations.find((l) => {
          return l.type === "City";
        });
        locations.sort(this.sortLocations);
        data[hex.x][hex.y] = {
          ...hex,
          locations,
          cityName: city?.name ?? "",
          domain: Object.values(this.props.allDomains).find((d) => d.hex_ids.includes(hex.id)),
        };
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

  private async attemptAutoScroll(): Promise<void> {
    setTimeout(() => {
      if (this.state.needsAutoScroll && this.rootRef.current && this.props.focusCoordinates && this.props.map) {
        const scroller = this.rootRef.current;
        const bounds = scroller.getBoundingClientRect();

        // The +4 accounts for the black border around the tiles, which is about 2 tiles on each side.
        const horizontalTileCount = this.props.map.max_x - this.props.map.min_x + 4;
        const verticalTileCount = this.props.map.max_y - this.props.map.min_y + 4;

        const relativeX = this.props.focusCoordinates[0] - this.props.map.min_x + 2;
        const relativeY = this.props.focusCoordinates[1] - this.props.map.min_y + 2;

        // Calculate the pixel position of the target within the scrollContent.
        const hexX = (scroller.scrollWidth * relativeX) / horizontalTileCount;
        const hexY = (scroller.scrollHeight * relativeY) / verticalTileCount;

        this.rootRef.current.scrollTo({ top: hexY - bounds.height / 2, left: hexX - bounds.width / 2 });
      }
    }, 1);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const map = state.maps.maps[props.mapID];
  const hexes = state.maps.mapHexesByMap[props.mapID] ?? [];
  const locations = state.locations.locations;
  const allDomains = state.domains.allDomains;
  return {
    ...props,
    map,
    hexes,
    locations,
    allDomains,
  };
}

export const HexMap = connect(mapStateToProps)(AHexMap);
