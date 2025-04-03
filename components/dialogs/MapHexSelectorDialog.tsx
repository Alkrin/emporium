import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./MapHexSelectorDialog.module.scss";
import { FittingView } from "../FittingView";
import { ModalCloseButton } from "../ModalCloseButton";
import ServerAPI, { MapData, MapHexData } from "../../serverAPI";
import { HexMap } from "../world/HexMap";
import { showModal } from "../../redux/modalsSlice";
import { BasicDialog } from "./BasicDialog";
import { updateMapHex } from "../../redux/mapsSlice";
import { SavingVeil } from "../SavingVeil";

interface State {
  mapId: number;
  hexIds: number[];
  isSaving: boolean;
  focusCoords: [number, number];
}

interface ReactProps {
  preselectedMapId: number;
  preselectedHexIds: number[];
  onValuesConfirmed: (mapId: number, hexIds: number[]) => Promise<void>;
}

interface InjectedProps {
  allMaps: Record<number, MapData>;
  allMapHexes: Record<number, MapHexData>;
  mapHexesByMap: Record<number, MapHexData[]>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AMapHexSelectorDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mapId: props.preselectedMapId ?? 0,
      hexIds: props.preselectedHexIds ?? [],
      isSaving: false,
      focusCoords: this.getFocusCoords(props),
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{"Hex Selector"}</div>
        </FittingView>

        <div className={styles.row}>
          <div className={styles.mapSelectorTitle}>{"Map"}</div>
          <select
            className={styles.mapSelector}
            value={this.state.mapId}
            onChange={(e) => {
              if (+e.target.value !== this.state.mapId) {
                this.setState({
                  mapId: +e.target.value,
                  hexIds: [],
                });
              }
            }}
          >
            <option value={0}>---</option>
            {this.getSortedMaps().map(({ name, id: mapID }) => {
              return (
                <option value={mapID} key={`map${name}`}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {this.state.mapId !== 0 ? (
          <>
            <div className={styles.prompt}>{"Click to select one or more hexes"}</div>
            <div className={styles.map}>
              <HexMap
                mapID={this.state.mapId}
                settings={{ showCoordinates: true, showLocations: true, showCityNames: true, zoomLevel: 0.75 }}
                renderCustomOverlay={this.renderSelectionOverlay.bind(this)}
                focusCoordinates={this.state.focusCoords}
                onHexSelected={async (x: number, y: number) => {
                  const mapHex = this.props.mapHexesByMap[this.state.mapId].find((hex) => {
                    return hex.x === x && hex.y === y;
                  });

                  if (mapHex) {
                    // Toggle the selection on or off for this mapHex.
                    if (this.state.hexIds.includes(mapHex.id)) {
                      this.setState({ hexIds: this.state.hexIds.filter((hid) => hid !== mapHex.id) });
                    } else {
                      this.setState({ hexIds: [...this.state.hexIds, mapHex.id] });
                    }
                  } else {
                    // Create the mapHex and add it to the selection.
                    const data: MapHexData = {
                      id: 0,
                      map_id: this.state.mapId,
                      x,
                      y,
                      type: "Undefined",
                      roads: [],
                      rivers: [],
                    };
                    this.setState({ isSaving: true });
                    const res = await ServerAPI.createMapHex(data);
                    this.setState({ isSaving: false });
                    if ("error" in res) {
                      this.props.dispatch?.(
                        showModal({
                          id: "HexCreateError",
                          content: () => (
                            <BasicDialog
                              title={"Error!"}
                              prompt={"An error occurred while attempting to select this hex.  Please try again."}
                            />
                          ),
                        })
                      );
                    } else {
                      data.id = res.insertId;
                      this.props.dispatch?.(updateMapHex(data));
                      this.setState({ hexIds: [...this.state.hexIds, data.id] });
                    }
                  }
                }}
              />
            </div>

            <div className={styles.button} onClick={this.onConfirmClicked.bind(this)}>
              {"Confirm Selection"}
            </div>
          </>
        ) : null}
        <SavingVeil show={this.state.isSaving} />
        <ModalCloseButton />
      </div>
    );
  }

  private getFocusCoords(props: Props): [number, number] {
    const map = props.allMaps[props.preselectedMapId];
    if (map && props.preselectedHexIds.length > 0) {
      let minX = Number.MAX_SAFE_INTEGER;
      let maxX = Number.MIN_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;

      props.preselectedHexIds.forEach((hid) => {
        const hex = props.allMapHexes[hid];
        if (hex) {
          minX = Math.min(minX, hex.x);
          maxX = Math.max(maxX, hex.x);
          minY = Math.min(minY, hex.y);
          maxY = Math.max(maxY, hex.y);
        }
      });
      return [Math.floor((minX + maxX) / 2), Math.floor((minY + maxY) / 2)];
    } else {
      return [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    }
  }

  private renderSelectionOverlay(hexId: number): React.ReactNode {
    if (this.state.hexIds.includes(hexId)) {
      return <div className={styles.multiSelectOverlay} />;
    } else {
      return null;
    }
  }

  private async onConfirmClicked(): Promise<void> {
    this.setState({ isSaving: true });
    await this.props.onValuesConfirmed(this.state.mapId, this.state.hexIds);
    this.setState({ isSaving: false });
  }

  private getSortedMaps(): MapData[] {
    const sorted = Object.values(this.props.allMaps).sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allMaps = state.maps.maps;
  const allMapHexes = state.maps.mapHexes;
  const mapHexesByMap = state.maps.mapHexesByMap;
  return {
    ...props,
    allMaps,
    allMapHexes,
    mapHexesByMap,
  };
}

export const MapHexSelectorDialog = connect(mapStateToProps)(AMapHexSelectorDialog);
