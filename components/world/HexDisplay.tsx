import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { DomainData, LocationData, MapHexData, MapHexRiverData, MapHexRoadData, MapHexRoadType } from "../../serverAPI";
import styles from "./HexDisplay.module.scss";
import { hexPointCoords, roadColors } from "./MapHexConstants";

export interface MapHexDataEx extends MapHexData {
  locations: LocationData[];
  cityName: string;
  domain?: DomainData;
}

interface ReactProps extends React.HTMLAttributes<HTMLDivElement> {
  data: MapHexDataEx;
  height: string;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AHexDisplay extends React.Component<Props> {
  render(): React.ReactNode {
    // We pull out our custom props so the DOM's `div` doesn't get confused by unknown props.
    const { data, height, dispatch, className, style, children, ...otherProps } = this.props;

    const finalStyle = { ...style, height: this.props.height };

    return (
      <div className={`${styles.root} ${className}`} style={finalStyle} {...otherProps}>
        <div className={`${styles.hexRoot} ${styles[this.props.data.type]}`}>
          {!!data.domain ? (
            <div className={styles.hexRoot} style={{ background: this.buildBackgroundStyle(data.domain.color) }} />
          ) : null}
          {(data.rivers.length > 0 || data.roads.length > 0) && (
            <svg className={styles.riversAndRoads} viewBox={"0 0 11547 10000"}>
              {data.rivers.map(this.renderRiver.bind(this))}
              {data.roads.map(this.renderRoad.bind(this))}
            </svg>
          )}
        </div>
        {this.props.children}
      </div>
    );
  }

  private buildBackgroundStyle(color: string): string {
    return `repeating-linear-gradient(-60deg,transparent,transparent 11%,${color} 11%,${color} 22%)`;
  }

  private renderRiver(data: MapHexRiverData, index: number): React.ReactNode {
    // Width can be 1, 2, or 3.
    const startCoords = hexPointCoords[data.start];
    const endCoords = hexPointCoords[data.end];
    return (
      <line
        key={index}
        x1={startCoords[0]}
        y1={startCoords[1]}
        x2={endCoords[0]}
        y2={endCoords[1]}
        strokeWidth={data.width * 300}
        stroke={"blue"}
        strokeLinecap={"round"}
      />
    );
  }

  private renderRoad(data: MapHexRoadData, index: number): React.ReactNode {
    const startCoords = hexPointCoords[data.start];
    const endCoords = hexPointCoords[data.end];
    return (
      <line
        key={index}
        x1={startCoords[0]}
        y1={startCoords[1]}
        x2={endCoords[0]}
        y2={endCoords[1]}
        strokeWidth={600}
        stroke={roadColors[data.type]}
        strokeLinecap={"round"}
      />
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const HexDisplay = connect(mapStateToProps)(AHexDisplay);
