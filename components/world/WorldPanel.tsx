import * as React from "react";
import styles from "./WorldPanel.module.scss";
import { Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../../redux/store";
import ServerAPI, { MapData, MapHexData } from "../../serverAPI";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { showSubPanel } from "../../redux/subPanelsSlice";
import { WorldMapsSubPanel } from "./WorldMapsSubPanel";
import { SubPanelPane } from "../SubPanelPane";
import { HexMap } from "./HexMap";
import { MapHexTypes, MapHexTypesArray } from "./MapHexConstants";
import { showModal } from "../../redux/modalsSlice";
import { updateMapHex } from "../../redux/mapsSlice";

interface State {
  mapID: number;
  selectedX: number;
  selectedY: number;
}

interface ReactProps {}

interface InjectedProps {
  maps: Dictionary<MapData>;
  mapHexesByMap: Dictionary<MapHexData[]>;
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
        <div className={styles.mapSelectorTitle}>
          {this.state.selectedX > Number.MIN_SAFE_INTEGER
            ? `${this.state.selectedX}, ${this.state.selectedY}`
            : "No Hex Selected"}
        </div>
        {this.state.selectedX > Number.MIN_SAFE_INTEGER ? (
          <div className={styles.row}>
            <div className={styles.typeSelectorTitle}>{"Terrain"}</div>
            <select className={styles.typeSelector} value={hex.type} onChange={this.onTerrainTypeSelected.bind(this)}>
              {MapHexTypesArray.map((type: string) => {
                return (
                  <option value={type} key={`type${type}`}>
                    {type}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}
      </div>
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

  private async applyHexChanges(hex: MapHexData): Promise<void> {
    if (hex.id === 0) {
      const res = await ServerAPI.createMapHex(hex);
      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "HexCreateError",
            content: { message: "An error occurred while attempting to create this hex.  Please try again." },
          })
        );
        return;
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
        return;
      }
    }

    // If we get here, then the server has successfully saved the data.
    this.props.dispatch?.(updateMapHex(hex));
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
  return {
    ...props,
    maps,
    mapHexesByMap,
  };
}

export const WorldPanel = connect(mapStateToProps)(AWorldPanel);
