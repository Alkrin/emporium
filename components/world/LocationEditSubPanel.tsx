import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { LocationCityData, LocationData, LocationLairData } from "../../serverAPI";
import styles from "./LocationEditSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { deleteLocation } from "../../redux/locationsSlice";
import { refetchLocationCities, refetchLocationLairs, refetchLocations } from "../../dataSources/LocationsDataSource";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import { ImagePickerDialog } from "../ImagePickerDialog";
import { Dictionary } from "../../lib/dictionary";

type LocationType = "---" | "City" | "Lair";

interface CityState {
  market_class: number;
}

const defaultCityState: CityState = {
  market_class: 0,
};

interface LairState {
  monster_level: number;
  num_encounters: number;
}

const defaultLairState: LairState = {
  monster_level: 0,
  num_encounters: 0,
};

interface State {
  isSaving: boolean;
  name: string;
  description: string;
  icon_url: string;
  type: LocationType;
  cityData: CityState;
  lairData: LairState;
}

const defaultState: State = {
  isSaving: false,
  name: "",
  description: "",
  icon_url: "",
  type: "---",
  cityData: defaultCityState,
  lairData: defaultLairState,
};

interface ReactProps {
  mapId: number;
  hexId: number;
  locationId?: number;
}

interface InjectedProps {
  location?: LocationData;
  cities: Dictionary<LocationCityData>;
  lairs: Dictionary<LocationLairData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ALocationEditSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);
    const initialState = { ...defaultState };
    if (props.location) {
      initialState.name = props.location.name;
      initialState.description = props.location.description;
      initialState.icon_url = props.location.icon_url;
      initialState.type = props.location.type as LocationType;

      initialState.cityData = this.getOldCityData() ?? defaultCityState;
      initialState.lairData = this.getOldLairData() ?? defaultLairState;
    }
    this.state = initialState;
  }

  render(): React.ReactNode {
    this.nextTabIndex = 1;
    const deletableClass = !this.props.locationId ? styles.disabled : "";

    return (
      <div className={styles.root}>
        <div className={styles.panelTitle}>{this.props.location ? "Edit Location" : "Create Location"}</div>
        <div className={styles.dataPanelRoot}>
          {this.renderIdSection()}
          {this.renderNameSection()}
          {this.renderDescriptionSection()}
          {this.renderIconSection()}
          {this.renderTypeSection()}
          {this.renderTypeSpecificSection()}
        </div>
        <div className={styles.footerSection}>
          <div className={`${styles.footerButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
            Delete
          </div>
          <div className={styles.footerButton} onClick={this.onSaveClicked.bind(this)}>
            Save
          </div>
        </div>
        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderIdSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>ID</div>
        <input
          className={styles.idField}
          type={"text"}
          value={!this.props.locationId ? "NEW" : `${this.props.locationId}`}
          readOnly={true}
        />
      </div>
    );
  }

  private renderNameSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>Name</div>
        <input
          className={styles.nameField}
          type={"text"}
          value={this.state.name}
          autoFocus
          spellCheck={false}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ name: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderDescriptionSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>Description</div>
        <textarea
          className={styles.descriptionField}
          value={this.state.description}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ description: e.target.value });
          }}
        />
      </div>
    );
  }

  private renderIconSection(): React.ReactNode {
    return (
      <>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Icon"}</div>
          {(this.state.icon_url?.length ?? 0) > 0 ? (
            <img
              className={styles.iconPicker}
              src={this.state.icon_url}
              onClick={this.onIconPickerClicked.bind(this)}
            />
          ) : (
            <div className={styles.iconPicker} onClick={this.onIconPickerClicked.bind(this)}>
              {"None"}
            </div>
          )}
        </div>
      </>
    );
  }

  private async onIconPickerClicked(): Promise<void> {
    let urls: string[] = [];
    const res = await ServerAPI.getMapIconURLs();
    if ("error" in res) {
    } else {
      urls = res;
    }
    this.props.dispatch?.(
      showModal({
        id: "IconPicker",
        content: () => {
          return (
            <ImagePickerDialog
              urls={urls}
              onImageSelected={(url) => {
                this.setState({ icon_url: url });
              }}
            />
          );
        },
      })
    );
  }

  private renderTypeSection(): React.ReactNode {
    return (
      <>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Type"}</div>
          <select
            className={styles.typeSelector}
            value={this.state.type}
            onChange={(e) => {
              const newType = e.target.value as LocationType;
              if (newType !== this.state.type) {
                this.setState({
                  type: e.target.value as LocationType,
                  cityData: defaultCityState,
                  lairData: defaultLairState,
                });
              }
            }}
            tabIndex={this.nextTabIndex++}
          >
            <option value={"---"}>---</option>
            <option value={"City"}>City</option>
            <option value={"Lair"}>Lair</option>
          </select>
        </div>
      </>
    );
  }

  private renderTypeSpecificSection(): React.ReactNode {
    switch (this.state.type) {
      case "City": {
        return this.renderCitySection();
      }
      case "Lair": {
        return this.renderLairSection();
      }
    }
    return null;
  }

  private renderCitySection(): React.ReactNode {
    return (
      <div className={styles.typeSpecificSection}>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Market Class"}</div>
          <select
            className={styles.typeSelector}
            value={this.state.cityData.market_class}
            onChange={(e) => {
              const newData: CityState = {
                ...this.state.cityData,
                market_class: +e.target.value,
              };
              this.setState({
                cityData: newData,
              });
            }}
            tabIndex={this.nextTabIndex++}
          >
            <option value={0}>---</option>
            <option value={1}>I</option>
            <option value={2}>II</option>
            <option value={3}>III</option>
            <option value={4}>IV</option>
            <option value={5}>V</option>
            <option value={6}>VI</option>
          </select>
        </div>
      </div>
    );
  }

  private renderLairSection(): React.ReactNode {
    return (
      <div className={styles.typeSpecificSection}>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Monster Level"}</div>
          <select
            className={styles.typeSelector}
            value={this.state.lairData.monster_level}
            onChange={(e) => {
              const newData: LairState = {
                ...this.state.lairData,
                monster_level: +e.target.value,
              };
              this.setState({
                lairData: newData,
              });
            }}
            tabIndex={this.nextTabIndex++}
          >
            <option value={0}>---</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Num Encounters"}</div>
          <select
            className={styles.typeSelector}
            value={this.state.lairData.num_encounters}
            onChange={(e) => {
              const newData: LairState = {
                ...this.state.lairData,
                num_encounters: +e.target.value,
              };
              this.setState({
                lairData: newData,
              });
            }}
            tabIndex={this.nextTabIndex++}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    if (this.state.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "CreateLocationFailure",
          content: { title: "Error!", message: "Unable to create.  Locations must have a name." },
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    const data: LocationData = {
      // If this is a new location, the locationId will be overwritten by the DB with a real value.
      id: this.props.locationId ?? 0,
      name: this.state.name,
      description: this.state.description,
      map_id: this.props.mapId,
      hex_id: this.props.hexId,
      is_public: true, //TODO: Or should this be included in viewer_ids?  Maybe a '*' id?
      viewer_ids: [], //TODO:
      type: this.state.type,
      icon_url: this.state.icon_url,
    };

    // Type-specific data.
    const cityData: LocationCityData = {
      id: 0,
      location_id: this.props.locationId ?? 0,
      ...(this.getOldCityData() ?? {}),
      ...this.state.cityData,
    };

    const lairData: LocationLairData = {
      id: 0,
      location_id: this.props.locationId ?? 0,
      ...(this.getOldLairData() ?? {}),
      ...this.state.lairData,
    };

    if (!this.props.locationId) {
      // Brand new location.
      const res = await ServerAPI.createLocation(data, cityData, lairData);

      if (
        "error" in res ||
        res.length === 0 ||
        !!res.find((entry) => {
          return "error" in entry;
        })
      ) {
        this.props.dispatch?.(
          showModal({
            id: "CreateLocationFailure",
            content: { title: "Error!", message: "Location creation failed.  Please try again." },
          })
        );
      } else {
        // Edit successful, so refetch (since we may have added new records).
        if (this.props.dispatch) {
          await refetchLocations(this.props.dispatch);
          await refetchLocationCities(this.props.dispatch);
          await refetchLocationLairs(this.props.dispatch);
        }
        this.props.dispatch?.(hideSubPanel());
      }
    } else {
      // Editing old location.
      const res = await ServerAPI.editLocation(data, cityData, lairData);

      if (
        "error" in res ||
        res.length === 0 ||
        !!res.find((entry) => {
          return "error" in entry;
        })
      ) {
        this.props.dispatch?.(
          showModal({
            id: "EditLocationFailure",
            content: { title: "Error!", message: "Location update failed.  Please try again." },
          })
        );
      } else {
        // Edit successful, so refetch (since we may have added new records).
        if (this.props.dispatch) {
          await refetchLocations(this.props.dispatch);
          await refetchLocationCities(this.props.dispatch);
          await refetchLocationLairs(this.props.dispatch);
        }
        this.props.dispatch?.(hideSubPanel());
      }
    }

    this.setState({ isSaving: false });
  }

  private getOldCityData(): LocationCityData | undefined {
    const data = Object.values(this.props.cities).find((c) => {
      return c.location_id === this.props.locationId;
    });

    return data;
  }

  private getOldLairData(): LocationLairData | undefined {
    const data = Object.values(this.props.lairs).find((l) => {
      return l.location_id === this.props.locationId;
    });

    return data;
  }

  private onDeleteClicked(): void {
    // Should be impossible, but just in case.
    if (!this.props.locationId) {
      return;
    }

    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DeleteLocation",
        content: {
          title: "Please Confirm",
          message: `Are you sure you wish to delete "${this.state.name}", id ${this.props.locationId}?  This cannot be undone.`,
          buttonText: "Cancel",
          onButtonClick: () => {
            this.props.dispatch?.(hideModal());
          },
          extraButtons: [
            {
              text: "Delete",
              onClick: async () => {
                this.setState({ isSaving: true });
                this.props.dispatch?.(hideModal());
                const res = await ServerAPI.deleteLocation(this.props.locationId ?? 0);

                if ("affectedRows" in res) {
                  // Delete successful, so deselect and close.
                  this.props.dispatch?.(deleteLocation(this.props.locationId ?? 0));
                  // TODO: Delete locationType data.
                  this.props.dispatch?.(hideSubPanel());
                }
              },
            },
          ],
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const location = state.locations.locations[props.locationId ?? -1];
  const { cities, lairs } = state.locations;
  return {
    ...props,
    location,
    cities,
    lairs,
  };
}

export const LocationEditSubPanel = connect(mapStateToProps)(ALocationEditSubPanel);
