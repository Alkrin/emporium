import * as React from "react";
import { Dispatch } from "@reduxjs/toolkit";
import { LocationCityData, LocationData, LocationLairData } from "../../serverAPI";
import styles from "./LocationTooltip.module.scss";
import { RootState } from "../../redux/store";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { getRomanNumerals } from "../../lib/stringUtils";

interface ReactProps {
  data: LocationData;
}

interface InjectedProps {
  locations: Dictionary<LocationData>;
  cities: Dictionary<LocationCityData>;
  lairs: Dictionary<LocationLairData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ALocationTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>{this.props.data.name}</div>
          <div className={styles.type}>{this.props.data.type}</div>
        </div>
        <div className={styles.description}>{this.props.data.description}</div>
        {this.props.data.type === "City" ? this.renderCityTooltipData(this.props.data.id) : null}
        {this.props.data.type === "Lair" ? this.renderLairTooltipData(this.props.data.id) : null}
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
          <div className={styles.data}>
            <div className={styles.dataName}>{"Market Class:"}</div>
            <div className={styles.dataValue}>{getRomanNumerals(data.market_class)}</div>
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
          <div className={styles.data}>
            <div className={styles.dataName}>{"Monster Level:"}</div>
            <div className={styles.dataValue}>{data.monster_level}</div>
          </div>
          <div className={styles.data}>
            <div className={styles.dataName}>{"Num Encounters:"}</div>
            <div className={styles.dataValue}>{data.num_encounters}</div>
          </div>
        </>
      );
    } else {
      return null;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { locations, cities, lairs } = state.locations;
  return {
    ...props,
    locations,
    cities,
    lairs,
  };
}

export const LocationTooltip = connect(mapStateToProps)(ALocationTooltip);
