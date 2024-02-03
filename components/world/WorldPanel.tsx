import * as React from "react";
import styles from "./WorldPanel.module.scss";
import { Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import ServerAPI, { LocationCityData, LocationData, LocationLairData, MapData, MapHexData } from "../../serverAPI";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { WorldMapsSubPanel } from "./WorldMapsSubPanel";
import { SubPanelPane } from "../SubPanelPane";
import { HexMap } from "./HexMap";
import { MapHexTypes, MapHexTypesArray } from "./MapHexConstants";
import { showModal } from "../../redux/modalsSlice";
import { updateMapHex } from "../../redux/mapsSlice";
import { LocationEditSubPanel } from "./LocationEditSubPanel";
import TooltipSource from "../TooltipSource";
import { getRomanNumerals } from "../../lib/stringUtils";

interface State {
  mapID: number;
  selectedX: number;
  selectedY: number;
}

interface ReactProps {}

interface InjectedProps {
  maps: Dictionary<MapData>;
  mapHexesByMap: Dictionary<MapHexData[]>;
  locations: Dictionary<LocationData>;
  cities: Dictionary<LocationCityData>;
  lairs: Dictionary<LocationLairData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AWorldPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mapID: -1,
      selectedX: Number.MIN_SAFE_INTEGER,
      selectedY: Number.MIN_SAFE_INTEGER,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <HexMap mapID={this.state.mapID} onHexSelected={this.onHexSelected.bind(this)} />
        <div className={styles.mapSelectorRoot}>
          <div className={styles.mapSelectorTitle}>{"Map"}</div>
          <select
            className={styles.mapSelector}
            value={this.state.mapID}
            onChange={(e) => {
              this.setState({
                mapID: +e.target.value,
                selectedX: Number.MIN_SAFE_INTEGER,
                selectedY: Number.MIN_SAFE_INTEGER,
              });
            }}
          >
            <option value={-1}>---</option>
            {this.getSortedMaps().map(({ name, id: mapID }) => {
              return (
                <option value={mapID} key={`map${name}`}>
                  {name}
                </option>
              );
            })}
          </select>
          <div className={styles.mapEditButton} onClick={this.onMapEditClick.bind(this)} />
        </div>
        {this.renderHexData()}
        <SubPanelPane />
      </div>
    );
  }

  private renderHexData(): React.ReactNode {
    const hex = this.getSelectedHexData();

    return (
      <div className={styles.hexDataRoot}>
        <div className={styles.hexDataSection}>
          <div className={styles.mapSelectorTitle}>
            {this.state.selectedX > Number.MIN_SAFE_INTEGER
              ? `${this.state.selectedX}, ${this.state.selectedY}`
              : "No Hex Selected"}
          </div>
          {this.state.selectedX > Number.MIN_SAFE_INTEGER ? (
            <div>
              <div className={styles.row}>
                <div className={styles.typeSelectorTitle}>{"Terrain"}</div>
                <select
                  className={styles.typeSelector}
                  value={hex.type}
                  onChange={this.onTerrainTypeSelected.bind(this)}
                >
                  {MapHexTypesArray.map((type: string) => {
                    return (
                      <option value={type} key={`type${type}`}>
                        {type}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : null}
        </div>
        {this.state.selectedX > Number.MIN_SAFE_INTEGER ? (
          <div className={styles.hexDataSection}>
            <div className={styles.locationsTitle}>{"Locations"}</div>
            <div className={styles.locationsAddButton} onClick={this.onAddLocationClicked.bind(this)}>
              {"+"}
            </div>
            <div className={styles.locationsDivider} />
            <div className={styles.locationsList}>
              {this.getLocationsForSelectedHex().map((data) => {
                return (
                  <TooltipSource
                    className={styles.locationRow}
                    key={data.id}
                    tooltipParams={{ id: `Location${data.id}`, content: this.renderLocationTooltip.bind(this, data) }}
                  >
                    <div className={styles.locationDataRow}>
                      <div className={styles.locationName}>{data.name}</div>
                    </div>
                    <div className={styles.locationEditButton} onClick={this.onEditLocationClicked.bind(this, data)} />
                  </TooltipSource>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  private renderLocationTooltip(data: LocationData): React.ReactNode {
    return (
      <div className={styles.locationTooltipRoot}>
        <div className={styles.locationTooltipHeader}>
          <div className={styles.locationTooltipTitle}>{data.name}</div>
          <div className={styles.locationTooltipType}>{data.type}</div>
        </div>
        <div className={styles.locationTooltipDescription}>{data.description}</div>
        {data.type === "City" ? this.renderCityTooltipData(data.id) : null}
        {data.type === "Lair" ? this.renderLairTooltipData(data.id) : null}
      </div>
    );
  }

  private renderCityTooltipData(locationID: number): React.ReactNode {
    const data = Object.values(this.props.cities).find((c) => {
      return c.location_id === locationID;
    });
    if (data) {
      return (
        <>
          <div className={styles.locationTooltipData}>
            <div className={styles.locationTooltipDataName}>{"Market Class:"}</div>
            <div className={styles.locationTooltipDataValue}>{getRomanNumerals(data.market_class)}</div>
          </div>
        </>
      );
    } else {
      return null;
    }
  }

  private renderLairTooltipData(locationID: number): React.ReactNode {
    const data = Object.values(this.props.lairs).find((l) => {
      return l.location_id === locationID;
    });
    if (data) {
      return (
        <>
          <div className={styles.locationTooltipData}>
            <div className={styles.locationTooltipDataName}>{"Monster Level:"}</div>
            <div className={styles.locationTooltipDataValue}>{data.monster_level}</div>
          </div>
          <div className={styles.locationTooltipData}>
            <div className={styles.locationTooltipDataName}>{"Num Encounters:"}</div>
            <div className={styles.locationTooltipDataValue}>{data.num_encounters}</div>
          </div>
        </>
      );
    } else {
      return null;
    }
  }

  private onEditLocationClicked(data: LocationData): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "Locations",
        content: () => {
          return <LocationEditSubPanel mapId={this.state.mapID} hexId={data.hex_id} locationId={data.id} />;
        },
        escapable: true,
      })
    );
  }

  private getLocationsForSelectedHex(): LocationData[] {
    const hexData = this.getSelectedHexData();
    // If no hex record, then there are no locations for it either.
    if (hexData.id === 0) {
      return [];
    }

    return Object.values(this.props.locations).filter((data) => {
      return data.hex_id === hexData.id;
    });
  }

  private async onAddLocationClicked(): Promise<void> {
    // If there is no hex record for the selected hex yet, create one.
    const hexData = this.getSelectedHexData();
    if (hexData.id === 0) {
      const created = await this.applyHexChanges(hexData);
      if (!created) {
        // applyHexChanges() generates its own error messages, so we just need to make sure
        // we don't try to do anything with an invalid hex.
        return;
      }
    }

    // Summon Add/Edit Location dialog.
    this.props.dispatch?.(
      showSubPanel({
        id: "Locations",
        content: () => {
          return <LocationEditSubPanel mapId={this.state.mapID} hexId={hexData.id} />;
        },
        escapable: true,
      })
    );
  }

  private getSelectedHexData(): MapHexData {
    const emptyHex: MapHexData = {
      id: 0,
      map_id: this.state.mapID,
      x: this.state.selectedX,
      y: this.state.selectedY,
      type: MapHexTypes.Undefined,
    };

    const currentHex = this.props.mapHexesByMap[this.state.mapID]?.find((hex) => {
      return hex.x === this.state.selectedX && hex.y === this.state.selectedY;
    });

    // Make a copy so we don't directly alter data in Redux.
    return currentHex ? { ...currentHex } : emptyHex;
  }

  private async applyHexChanges(hex: MapHexData): Promise<boolean> {
    if (hex.id === 0) {
      const res = await ServerAPI.createMapHex(hex);
      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "HexCreateError",
            content: { message: "An error occurred while attempting to create this hex.  Please try again." },
          })
        );
        return false;
      } else {
        hex.id = res.insertId;
      }
    } else {
      const res = await ServerAPI.editMapHex(hex);
      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "HexEditError",
            content: { message: "An error occurred while attempting to update this hex.  Please try again." },
          })
        );
        return false;
      }
    }

    // If we get here, then the server has successfully saved the data.
    this.props.dispatch?.(updateMapHex(hex));
    return true;
  }

  private onTerrainTypeSelected(e: React.ChangeEvent<HTMLSelectElement>): void {
    const hex = this.getSelectedHexData();

    hex.type = e.target.value;

    this.applyHexChanges(hex);
  }

  private onHexSelected(x: number, y: number): void {
    this.setState({ selectedX: x, selectedY: y });
  }

  private onMapEditClick(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "WorldMaps",
        content: () => {
          return <WorldMapsSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private getSortedMaps(): MapData[] {
    const sorted = Object.values(this.props.maps).sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { maps, mapHexesByMap } = state.maps;
  const { locations, cities, lairs } = state.locations;
  return {
    ...props,
    maps,
    mapHexesByMap,
    locations,
    cities,
    lairs,
  };
}

export const WorldPanel = connect(mapStateToProps)(AWorldPanel);
