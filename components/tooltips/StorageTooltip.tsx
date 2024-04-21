import * as React from "react";
import { Dispatch } from "@reduxjs/toolkit";
import { CharacterData, LocationData, StorageData } from "../../serverAPI";
import styles from "./StorageTooltip.module.scss";
import { RootState } from "../../redux/store";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { getStorageDisplayName } from "../../lib/storageUtils";

interface ReactProps {
  data: StorageData;
}

interface InjectedProps {
  allStorages: Dictionary<StorageData>;
  locations: Dictionary<LocationData>;
  owner: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AStorageTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const location = this.props.locations[this.props.data.location_id];
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.title}>{getStorageDisplayName(this.props.data.id)}</div>
          <div className={styles.money}>{`${this.props.data.money}gp`}</div>
        </div>
        <div className={styles.owner}>{`Owned by: ${this.props.owner.name}`}</div>
        {location && <div className={styles.location}>{location.name}</div>}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allStorages } = state.storages;
  const { locations } = state.locations;
  const owner = state.characters.characters[props.data.owner_id];
  return {
    ...props,
    allStorages,
    locations,
    owner,
  };
}

export const StorageTooltip = connect(mapStateToProps)(AStorageTooltip);
