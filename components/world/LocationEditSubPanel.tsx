import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { LocationCityData, LocationData, LocationLairData } from "../../serverAPI";
import styles from "./LocationEditSubPanel.module.scss";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { deleteLocation, updateLocation } from "../../redux/locationsSlice";
import { refetchLocations } from "../../dataSources/LocationsDataSource";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import { ImagePickerDialog } from "../ImagePickerDialog";
import { BasicDialog } from "../dialogs/BasicDialog";
import { SavingVeil } from "../SavingVeil";
import { getMarketClassForPopulation, getMaxPopulationForCityValue } from "../../lib/locationUtils";
import { addCommasToNumber } from "../../lib/characterUtils";

type LocationType = "---" | "City" | "Lair";

const defaultCityData: LocationCityData = {
  market_class: 0,
  population: 0,
  city_value: 0,
};

const defaultLairData: LocationLairData = {};

interface State {
  isSaving: boolean;
  location: LocationData;
  cityPopulationString: string;
  cityCityValueString: string;
}

const defaultState: State = {
  isSaving: false,
  location: {
    id: 0,
    name: "",
    description: "",
    map_id: 0,
    hex_id: 0,
    type: "---",
    type_data: {},
    icon_url: "",
  },
  cityPopulationString: "0",
  cityCityValueString: "0",
};

interface ReactProps {
  mapId: number;
  hexId: number;
  locationId?: number;
}

interface InjectedProps {
  location?: LocationData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ALocationEditSubPanel extends React.Component<Props, State> {
  private nextTabIndex: number = 1;

  constructor(props: Props) {
    super(props);

    const cityPopulationString =
      props.location?.type === "City" ? (props.location.type_data as LocationCityData).population.toString() : "0";
    const cityCityValueString =
      props.location?.type === "City" ? (props.location.type_data as LocationCityData).city_value.toString() : "0";

    this.state = {
      ...defaultState,
      location: props.location ?? {
        ...defaultState.location,
        map_id: props.mapId,
        hex_id: props.hexId,
        id: props.locationId ?? 0,
      },
      cityPopulationString,
      cityCityValueString,
    };
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
          {this.renderTypeDataSection()}
        </div>
        <div className={styles.footerSection}>
          <div className={`${styles.footerButton} ${deletableClass}`} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
          <div className={styles.footerButton} onClick={this.onSaveClicked.bind(this)}>
            {"Save"}
          </div>
        </div>
        <SavingVeil show={this.state.isSaving} />
        <SubPanelCloseButton />
      </div>
    );
  }

  private renderIdSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.firstLabel}>{"ID"}</div>
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
        <div className={styles.firstLabel}>{"Name"}</div>
        <input
          className={styles.nameField}
          type={"text"}
          value={this.state.location.name}
          autoFocus
          spellCheck={false}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ location: { ...this.state.location, name: e.target.value } });
          }}
        />
      </div>
    );
  }

  private renderDescriptionSection(): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.labelText}>{"Description"}</div>
        <textarea
          className={styles.descriptionField}
          value={this.state.location.description}
          tabIndex={this.nextTabIndex++}
          onChange={(e) => {
            this.setState({ location: { ...this.state.location, description: e.target.value } });
          }}
        />
      </div>
    );
  }

  private renderIconSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.labelText}>{"Icon"}</div>
        {(this.state.location.icon_url?.length ?? 0) > 0 ? (
          <img
            className={styles.iconPicker}
            src={this.state.location.icon_url}
            onClick={this.onIconPickerClicked.bind(this)}
          />
        ) : (
          <div className={styles.iconPicker} onClick={this.onIconPickerClicked.bind(this)}>
            {"None"}
          </div>
        )}
      </div>
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
              onImageSelected={(icon_url) => {
                this.setState({ location: { ...this.state.location, icon_url } });
              }}
            />
          );
        },
      })
    );
  }

  private renderTypeSection(): React.ReactNode {
    return (
      <div className={styles.row}>
        <div className={styles.labelText}>{"Type"}</div>
        <select
          className={styles.typeSelector}
          value={this.state.location.type}
          onChange={(e) => {
            const newType = e.target.value as LocationType;
            if (newType !== this.state.location.type) {
              this.setState({
                location: { ...this.state.location, type: e.target.value, type_data: this.getDefaultTypeData(newType) },
                cityPopulationString: "0",
                cityCityValueString: "0",
              });
            }
          }}
          tabIndex={this.nextTabIndex++}
        >
          <option value={"---"}>---</option>
          <option value={"City"}>{"City"}</option>
          <option value={"Lair"}>{"Lair"}</option>
        </select>
      </div>
    );
  }

  private getDefaultTypeData(type: LocationType): {} {
    switch (type) {
      case "---":
        return {};
      case "City":
        return defaultCityData;
      case "Lair":
        return defaultLairData;
    }
  }

  private renderTypeDataSection(): React.ReactNode {
    switch (this.state.location.type) {
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
    const data = this.state.location.type_data as LocationCityData;
    return (
      <div className={styles.typeSpecificSection}>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Market Class"}</div>
          <select
            className={styles.marketClassSelector}
            value={data.market_class}
            onChange={(e) => {
              const type_data: LocationCityData = {
                ...(this.state.location.type_data as LocationCityData),
                market_class: +e.target.value,
              };
              this.setState({ location: { ...this.state.location, type_data } });
            }}
            tabIndex={this.nextTabIndex++}
          >
            <option value={0}>{"---"}</option>
            <option value={1}>{"I (20,000+ families)"}</option>
            <option value={2}>{"II (5,000-19,999 families)"}</option>
            <option value={3}>{"III (2,500-4,999 families)"}</option>
            <option value={4}>{"IV (500-2,499 families)"}</option>
            <option value={5}>{"V (250-499 families)"}</option>
            <option value={6}>{"VI (75-249 families)"}</option>
          </select>
        </div>
        <div className={styles.row}>
          <div className={styles.labelText}>{"Population"}</div>
          <input
            className={styles.field}
            type={"text"}
            value={this.state.cityPopulationString}
            onChange={(e) => {
              this.setState({ cityPopulationString: e.target.value });
            }}
            onBlur={() => {
              this.setState({
                location: {
                  ...this.state.location,
                  type_data: {
                    ...this.state.location.type_data,
                    population: +this.state.cityPopulationString,
                    // When the population is changed, the market class may change to match.
                    market_class: getMarketClassForPopulation(+this.state.cityPopulationString),
                  },
                },
              });
            }}
          />
          <div className={styles.labelText}>{`\xa0/ ${addCommasToNumber(
            getMaxPopulationForCityValue(+this.state.cityCityValueString)
          )} families`}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.labelText}>{"City Value"}</div>
          <input
            className={styles.field}
            type={"text"}
            value={this.state.cityCityValueString}
            onChange={(e) => {
              this.setState({ cityCityValueString: e.target.value });
            }}
            onBlur={() => {
              this.setState({
                location: {
                  ...this.state.location,
                  type_data: {
                    ...this.state.location.type_data,
                    city_value: +this.state.cityCityValueString,
                  },
                },
              });
            }}
          />
          <div className={styles.labelText}>{"\xa0gp"}</div>
        </div>
      </div>
    );
  }

  private renderLairSection(): React.ReactNode {
    return null;
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    if (this.state.location.name.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "CreateLocationFailure",
          content: () => <BasicDialog title={"Error!"} prompt={"Unable to create.  Locations must have a name."} />,
        })
      );
      return;
    }

    this.setState({ isSaving: true });

    if (!this.props.locationId) {
      // Brand new location.
      const res = await ServerAPI.createLocation(this.state.location);

      if ("insertId" in res) {
        // Put the real id into our data.
        const location: LocationData = { ...this.state.location, id: res.insertId };

        // Push the data into Redux.
        this.props.dispatch?.(updateLocation(location));

        this.props.dispatch?.(hideSubPanel());
      } else {
        this.props.dispatch?.(
          showModal({
            id: "CreateLocationFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Location creation failed.  Please try again."} />,
          })
        );
      }
    } else {
      // Editing old location.
      const res = await ServerAPI.editLocation(this.state.location);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditLocationFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Location update failed.  Please try again."} />,
          })
        );
      } else {
        const location: LocationData = { ...this.state.location };
        this.props.dispatch?.(updateLocation(location));
        this.props.dispatch?.(hideSubPanel());
      }
    }

    this.setState({ isSaving: false });
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
        content: () => (
          <BasicDialog
            title={"Please Confirm"}
            prompt={`Are you sure you wish to delete "${this.state.location.name}", id ${this.props.locationId}?  This cannot be undone.`}
            buttons={[
              {
                text: "Delete",
                onClick: async () => {
                  this.setState({ isSaving: true });
                  this.props.dispatch?.(hideModal());
                  const res = await ServerAPI.deleteLocation(this.props.locationId ?? 0);

                  if ("affectedRows" in res) {
                    // Delete successful, so deselect and close.
                    this.props.dispatch?.(deleteLocation(this.props.locationId ?? 0));
                    this.props.dispatch?.(hideSubPanel());
                  } else {
                    this.props.dispatch?.(
                      showModal({
                        id: "locationDeleteError",
                        content: () => (
                          <BasicDialog title={"Error!"} prompt={"Location deletion failed.  Please try again."} />
                        ),
                      })
                    );
                  }
                },
              },
              { text: "Cancel" },
            ]}
          />
        ),
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const location = state.locations.locations[props.locationId ?? -1];
  return {
    ...props,
    location,
  };
}

export const LocationEditSubPanel = connect(mapStateToProps)(ALocationEditSubPanel);
