import * as React from "react";
import { Dispatch } from "@reduxjs/toolkit";
import { LocationCityData, LocationData, LocationLairData } from "../../serverAPI";
import styles from "./LocationTooltip.module.scss";
import { RootState } from "../../redux/store";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { getRomanNumerals } from "../../lib/stringUtils";
import { getMaxPopulationForCityValue } from "../../lib/locationUtils";
import { addCommasToNumber } from "../../lib/characterUtils";

interface ReactProps {
  data: LocationData;
}

interface InjectedProps {
  locations: Dictionary<LocationData>;
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
    const city = Object.values(this.props.locations).find((l) => {
      return l.id === locationID && l.type === "City";
    });
    if (city) {
      const data = city.type_data as LocationCityData;
      return (
        <>
          <div className={styles.data}>
            <div className={styles.dataName}>{"Market Class:"}</div>
            <div className={styles.dataValue}>{getRomanNumerals(data.market_class)}</div>
          </div>
          <div className={styles.data}>
            <div className={styles.dataName}>{"Population:"}</div>
            <div className={styles.dataValue}>{`${data.population} / ${getMaxPopulationForCityValue(
              data.city_value
            )} families`}</div>
          </div>
          <div className={styles.data}>
            <div className={styles.dataName}>{"City Value:"}</div>
            <div className={styles.dataValue}>{`${addCommasToNumber(data.city_value)}gp`}</div>
          </div>
        </>
      );
    } else {
      return null;
    }
  }

  private renderLairTooltipData(locationID: number): React.ReactNode {
    const lair = Object.values(this.props.locations).find((l) => {
      return l.id === locationID && l.type === "Lair";
    });
    if (lair) {
      const data = lair.type_data as LocationLairData;
      return null;
    } else {
      return null;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { locations } = state.locations;
  return {
    ...props,
    locations,
  };
}

export const LocationTooltip = connect(mapStateToProps)(ALocationTooltip);
