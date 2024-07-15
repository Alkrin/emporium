import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import ServerAPI, { MapData, MapHexData, MapHexRoadType } from "../../serverAPI";
import styles from "./HexEditor.module.scss";
import { hexPointCoords, MapHexTypes, roadColors } from "./MapHexConstants";
import { HexDisplay } from "./HexDisplay";
import { updateMapHex } from "../../redux/mapsSlice";
import { showModal } from "../../redux/modalsSlice";

interface State {
  mode: "add" | "delete";
  startPoint: string;
  riverWidth: number;
  roadType: MapHexRoadType;
}

interface ReactProps {
  mapId: number;
  x: number;
  y: number;
  type: "roads" | "rivers";
}

interface InjectedProps {
  map: MapData;
  hexes: MapHexData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AHexEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: "add",
      startPoint: "",
      riverWidth: 1,
      roadType: MapHexRoadType.Dirt,
    };
  }

  render(): React.ReactNode {
    const hexSize = "15vmin";
    const isOdd = this.props.x % 2 === 1;
    const oddMod = isOdd ? 0 : -1;
    return (
      <div className={styles.root}>
        <div className={styles.modeRow}>
          <div
            className={`${styles.modeButton} ${this.state.mode === "add" ? styles.selected : ""}`}
            onClick={() => this.setState({ mode: "add" })}
          >
            {"Add"}
          </div>
          <div
            className={`${styles.modeButton} ${this.state.mode === "delete" ? styles.selected : ""}`}
            onClick={() => this.setState({ mode: "delete" })}
          >
            {"Delete"}
          </div>
        </div>
        <div className={styles.hexWindow}>
          <HexDisplay
            className={styles.hexTop}
            data={this.getHexDataAt(this.props.x, this.props.y - 1)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexRightTop}
            data={this.getHexDataAt(this.props.x + 1, this.props.y + oddMod)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexRightBottom}
            data={this.getHexDataAt(this.props.x + 1, this.props.y + 1 + oddMod)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexBottom}
            data={this.getHexDataAt(this.props.x, this.props.y + 1)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexLeftBottom}
            data={this.getHexDataAt(this.props.x - 1, this.props.y + 1 + oddMod)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexLeftTop}
            data={this.getHexDataAt(this.props.x - 1, this.props.y + oddMod)}
            height={hexSize}
          />
          <HexDisplay
            className={styles.hexCenter}
            data={this.getHexDataAt(this.props.x, this.props.y)}
            height={hexSize}
          >
            {this.renderPointButton("a")}
            {this.renderPointButton("b")}
            {this.renderPointButton("c")}
            {this.renderPointButton("d")}
            {this.renderPointButton("e")}
            {this.renderPointButton("f")}
            {this.renderPointButton("g")}
            {this.renderPointButton("h")}
            {this.renderPointButton("i")}
            {this.renderPointButton("j")}
            {this.renderPointButton("k")}
            {this.renderPointButton("l")}
            {this.renderPointButton("m")}
            {this.renderPointButton("n")}
            {this.renderPointButton("o")}
            {this.renderPointButton("p")}
            {this.renderPointButton("q")}
            {this.renderPointButton("r")}
            {this.renderPointButton("s")}
          </HexDisplay>
        </div>
        {this.props.type === "rivers" && this.renderRiverToggles()}
        {this.props.type === "roads" && this.renderRoadToggles()}
      </div>
    );
  }

  private renderRiverToggles(): React.ReactNode {
    return (
      <div className={styles.toggleRow}>
        <div
          className={`${styles.riverWidthButton} ${this.state.riverWidth === 1 ? styles.selected : ""}`}
          onClick={() => this.setState({ riverWidth: 1 })}
        >
          <div className={`${styles.riverWidthIcon} ${styles.one}`} />
        </div>
        <div
          className={`${styles.riverWidthButton} ${this.state.riverWidth === 2 ? styles.selected : ""}`}
          onClick={() => this.setState({ riverWidth: 2 })}
        >
          <div className={`${styles.riverWidthIcon} ${styles.two}`} />
        </div>
        <div
          className={`${styles.riverWidthButton} ${this.state.riverWidth === 3 ? styles.selected : ""}`}
          onClick={() => this.setState({ riverWidth: 3 })}
        >
          <div className={`${styles.riverWidthIcon} ${styles.three}`} />
        </div>
      </div>
    );
  }

  private renderRoadToggles(): React.ReactNode {
    return (
      <div className={styles.toggleRow}>
        <div
          className={`${styles.roadTypeButton} ${this.state.roadType === MapHexRoadType.Dirt ? styles.selected : ""}`}
          onClick={() => this.setState({ roadType: MapHexRoadType.Dirt })}
        >
          <div className={styles.roadTypeIcon} style={{ backgroundColor: roadColors[MapHexRoadType.Dirt] }} />
        </div>
        <div
          className={`${styles.roadTypeButton} ${this.state.roadType === MapHexRoadType.Paved ? styles.selected : ""}`}
          onClick={() => this.setState({ roadType: MapHexRoadType.Paved })}
        >
          <div className={styles.roadTypeIcon} style={{ backgroundColor: roadColors[MapHexRoadType.Paved] }} />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.x !== prevProps.x || this.props.y !== prevProps.y || this.props.type !== prevProps.type) {
      // If they select a new hex, reset the edit state.
      this.setState({ startPoint: "" });
    }
  }

  private renderPointButton(point: string): React.ReactNode {
    const xy = hexPointCoords[point];
    return (
      <div
        className={`${styles.pointButton} ${this.state.startPoint === point ? styles.selected : ""}`}
        style={{ left: xy[0], top: xy[1] }}
        onClick={async () => {
          const originalData = this.getHexDataAt(this.props.x, this.props.y);
          // We make a new deep copy of the hex data so we can safely modify it.
          const hex: MapHexData = {
            id: originalData.id,
            map_id: originalData.map_id,
            x: originalData.x,
            y: originalData.y,
            type: originalData.type,
            rivers: originalData.rivers.map((r) => {
              return { width: r.width, start: r.start, end: r.end };
            }),
            roads: originalData.roads.map((r) => {
              return { type: r.type, start: r.start, end: r.end };
            }),
          };

          if (this.state.startPoint === "") {
            if (this.state.mode === "add") {
              // No start point yet, and they just clicked a node, so record it.
              this.setState({ startPoint: point });
            } else {
              // Only start a delete if they clicked a node that is in use.
              const isValidNode =
                // Valid river node?
                (this.props.type === "rivers" &&
                  hex.rivers.find((data) => data.start === point || data.end === point)) ||
                // Valid road node?
                (this.props.type === "roads" && hex.roads.find((data) => data.start === point || data.end === point));
              if (isValidNode) {
                this.setState({ startPoint: point });
              }
            }
          } else {
            if (this.state.startPoint !== point) {
              // See if the segment already exists.
              const riverSegment = hex.rivers.find((data) => {
                return (
                  (data.start === this.state.startPoint && data.end === point) ||
                  (data.start === point && data.end === this.state.startPoint)
                );
              });
              const roadSegment = hex.roads.find((data) => {
                return (
                  (data.start === this.state.startPoint && data.end === point) ||
                  (data.start === point && data.end === this.state.startPoint)
                );
              });
              const segment = this.props.type === "rivers" ? riverSegment : roadSegment;
              // If the selectedPoint is not the startPoint, add/delete as appropriate.
              if (this.state.mode === "add") {
                if (segment) {
                  // If it already exists, update its road type or river width.
                  if ("width" in segment) {
                    segment.width = this.state.riverWidth;
                  } else {
                    segment.type = this.state.roadType;
                  }
                  this.props.dispatch?.(updateMapHex(hex));
                } else {
                  // If it doesn't exist, create it.
                  if (this.props.type === "rivers") {
                    hex.rivers.push({ width: this.state.riverWidth, start: this.state.startPoint, end: point });
                  } else {
                    hex.roads.push({ type: this.state.roadType, start: this.state.startPoint, end: point });
                  }
                  this.props.dispatch?.(updateMapHex(hex));
                }
                if (hex.id === 0) {
                  // The hex didn't exist on the server yet, so create it.
                  await this.createHex(hex);
                } else {
                  // The hex already exists on the server, so just update it.
                  // We already updated locally, so we don't wait on the change and we don't fetch.
                  ServerAPI.editMapHex(hex);
                }
              } else {
                // Deleting.
                if (segment) {
                  if ("width" in segment) {
                    hex.rivers = hex.rivers.filter((r) => r.start !== segment.start || r.end !== segment.end);
                  } else {
                    hex.roads = hex.roads.filter((r) => r.start !== segment.start || r.end !== segment.end);
                  }
                  this.props.dispatch?.(updateMapHex(hex));
                  // The hex already exists on the server, so just update it.
                  // We already updated locally, so we don't wait on the change and we don't fetch.
                  ServerAPI.editMapHex(hex);
                }
              }
              // In any case, the second click clears the startPoint;
              this.setState({ startPoint: "" });
            }
          }
        }}
      />
    );
  }

  private async createHex(hex: MapHexData): Promise<void> {
    const res = await ServerAPI.createMapHex(hex);
    if ("error" in res) {
      this.props.dispatch?.(
        showModal({
          id: "HexCreateError",
          content: { message: "An error occurred while attempting to create this hex.  Please try again." },
        })
      );
    } else {
      hex.id = res.insertId;
    }
  }

  private getHexDataAt(x: number, y: number): MapHexData {
    const emptyHex: MapHexData = {
      id: 0,
      map_id: this.props.mapId,
      x,
      y,
      type: MapHexTypes.Undefined,
      rivers: [],
      roads: [],
    };

    const currentHex = this.props.hexes?.find((hex) => {
      return hex.x === x && hex.y === y;
    });

    // Make a copy so we don't directly alter data in Redux.
    return currentHex ? { ...currentHex } : emptyHex;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const map = state.maps.maps[props.mapId];
  const hexes = state.maps.mapHexesByMap[props.mapId] ?? [];
  return {
    ...props,
    map,
    hexes,
  };
}

export const HexEditor = connect(mapStateToProps)(AHexEditor);
