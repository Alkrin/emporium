import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import styles from "./DashboardDomainSection.module.scss";
import ServerAPI, {
  CharacterAlignment,
  CharacterData,
  DomainClassification,
  DomainData,
  LocationCityData,
  LocationData,
  MapData,
  MapHexData,
  StorageData,
} from "../../../serverAPI";
import { EditButton } from "../../EditButton";
import { hideModal, showModal } from "../../../redux/modalsSlice";
import { SelectDomainDialog } from "../../dialogs/SelectDomainDialog";
import { setDomainRuler, updateDomain } from "../../../redux/domainsSlice";
import { BasicDialog } from "../../dialogs/BasicDialog";
import { ColorPickerDialog } from "../../dialogs/ColorPickerDialog";
import { MapHexSelectorDialog } from "../../dialogs/MapHexSelectorDialog";
import { InputSingleNumberDialog } from "../../dialogs/InputSingleNumberDialog";
import { SelectStorageDialog } from "../../dialogs/SelectStorageDialog";
import { updateStorage } from "../../../redux/storageSlice";
import { addCommasToNumber } from "../../../lib/characterUtils";
import { SelectArmiesDialog } from "../../dialogs/SelectArmiesDialog";
import { getArmyTotalWages } from "../../../lib/armyUtils";
import { SelectStructuresDialog } from "../../dialogs/SelectStructuresDialog";
import { getStructureValue } from "../../../lib/structureUtils";
import { SelectLocationsDialog } from "../../dialogs/SelectLocationsDialog";
import { getFirstOfThisMonthDateString, getRomanNumerals } from "../../../lib/stringUtils";
import { getMaxPopulationForCityValue } from "../../../lib/locationUtils";
import { InfoButton } from "../../InfoButton";
import dateFormat from "dateformat";
import { DomainUpdateDialog } from "../../dialogs/DomainUpdateDialog";
import { getMaxFrontierPopulationForDomain, getRequiredFortificationValue } from "../../../lib/domainUtils";

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  allDomains: Record<number, DomainData>;
  dashboardCharacterId: number;
  allStorages: Record<number, StorageData>;
  allMaps: Record<number, MapData>;
  allMapHexes: Record<number, MapHexData>;
  allLocations: Record<number, LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADashboardDomainSection extends React.Component<Props> {
  render(): React.ReactNode {
    if (!this.props.character) {
      return null;
    }

    const domain = Object.values(this.props.allDomains).find(
      (d) => d.ruler_character_id === this.props.dashboardCharacterId
    );

    const cities = domain ? domain.city_ids.map((cid) => this.props.allLocations[cid]) : [];

    const totalArmyWages = domain
      ? domain.garrison_army_ids.reduce<number>((soFar: number, armyId: number) => {
          return soFar + getArmyTotalWages(armyId);
        }, 0)
      : 0;

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.panelTitle}>{`${this.props.character.name}'s Domain:\xa0`}</div>
          <div className={styles.domainName}>{domain?.name ?? "None"}</div>
          <EditButton className={styles.editButton} onClick={this.onDomainEditClicked.bind(this, domain)} />
        </div>
        {domain ? (
          <div className={styles.column}>
            <div className={styles.domainDataContainer}>
              <div className={styles.column}>
                <div className={styles.row}>
                  <div className={styles.fieldName}>{"Alignment"}</div>
                  <select
                    className={styles.selector}
                    value={domain.alignment}
                    onChange={(e) => this.onAlignmentChanged(domain, e.target.value as CharacterAlignment)}
                  >
                    {Object.values(CharacterAlignment).map((name) => (
                      <option value={name} key={`alignment${name}`}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.row}>
                  <div className={styles.fieldName}>{"Classification"}</div>
                  <select
                    className={styles.selector}
                    value={domain.classification}
                    onChange={(e) => this.onClassificationChanged(domain, e.target.value as DomainClassification)}
                  >
                    {Object.values(DomainClassification).map((name) => (
                      <option value={name} key={`classification${name}`}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.row}>
                  <div className={styles.fieldName}>{"Color"}</div>
                  <button
                    className={styles.colorPreview}
                    style={{ backgroundColor: domain.color }}
                    onClick={(e) => {
                      this.props.dispatch?.(
                        showModal({
                          id: "EditColor",
                          content: () => {
                            return (
                              <ColorPickerDialog
                                initialValue={domain.color}
                                onValueConfirmed={async (color) => this.onColorChanged(domain, color)}
                              />
                            );
                          },
                        })
                      );
                    }}
                  />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Garrison:"}</div>
                  <div className={styles.fieldValue}>{`${addCommasToNumber(totalArmyWages)} / ${addCommasToNumber(
                    2 * this.getTotalPopulation(domain)
                  )}gp`}</div>
                  <EditButton className={styles.editButton} onClick={this.onGarrisonEditClicked.bind(this, domain)} />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Fortifications:"}</div>
                  <div className={styles.fieldValue}>{`${addCommasToNumber(
                    this.getTotalFortificationValue(domain)
                  )} / ${addCommasToNumber(getRequiredFortificationValue(domain))}gp`}</div>
                  <EditButton
                    className={styles.editButton}
                    onClick={this.onFortificationsEditClicked.bind(this, domain)}
                  />
                </div>
              </div>
              <div className={styles.horizontalSpacer} />
              <div className={styles.column}>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Hexes:"}</div>
                  <div className={styles.fieldValue}>{domain.hex_ids.length}</div>
                  <EditButton className={styles.editButton} onClick={this.onHexesEditClicked.bind(this, domain)} />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Population:"}</div>
                  <div className={styles.fieldValue}>{`${addCommasToNumber(
                    domain.frontier_population
                  )} / ${addCommasToNumber(getMaxFrontierPopulationForDomain(domain))} families`}</div>
                  <EditButton
                    className={styles.editButton}
                    onClick={this.onFrontierPopulationEditClicked.bind(this, domain)}
                  />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Morale:"}</div>
                  <div className={styles.fieldValue}>{`${domain.current_morale} - ${this.getMoraleTitle(
                    domain.current_morale
                  )}`}</div>
                  <EditButton className={styles.editButton} onClick={this.onMoraleEditClicked.bind(this, domain)} />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Treasury:"}</div>
                  <div className={styles.fieldValue}>
                    {this.props.allStorages[domain.treasury_storage_id]?.name ?? "---"}
                  </div>
                  <EditButton className={styles.editButton} onClick={this.onTreasuryEditClicked.bind(this, domain)} />
                </div>
                <div className={styles.centeredRow}>
                  <div className={styles.fieldName}>{"Funds:"}</div>
                  <div className={styles.fieldValue}>{`${addCommasToNumber(
                    this.props.allStorages[domain.treasury_storage_id]?.money ?? 0,
                    2
                  )}gp`}</div>
                  <EditButton className={styles.editButton} onClick={this.onFundsEditClicked.bind(this, domain)} />
                </div>
              </div>
            </div>
            <div className={styles.column}>
              <div className={styles.row}>
                <div className={styles.citiesTitle}>{"Cities"}</div>
                <EditButton className={styles.editButton} onClick={this.onCitiesEditClicked.bind(this, domain)} />
              </div>
              <div className={styles.citiesPanel}>
                <div className={styles.citiesFirstColumn}>
                  <div className={styles.citiesHeader}>{"Name"}</div>
                  {cities.map((c, index) => {
                    const rowStyle = index % 2 ? styles.odd : "";
                    return (
                      <div className={`${styles.citiesCell} ${rowStyle}`} key={index}>
                        <div className={styles.citiesName}>{c.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.citiesOtherColumn}>
                  <div className={styles.citiesHeader}>
                    <div className={styles.row}>
                      {"Market"}
                      <InfoButton
                        className={styles.infoButton}
                        tooltipParams={{ id: "MarketInfo", content: this.renderMarketInfoTooltip.bind(this) }}
                      />
                    </div>
                  </div>
                  {cities.map((c, index) => {
                    const data = c.type_data as LocationCityData;
                    const rowStyle = index % 2 ? styles.odd : "";
                    return (
                      <div className={`${styles.citiesCell} ${rowStyle}`} key={index}>
                        <div className={styles.marketValue}>{getRomanNumerals(data.market_class)}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.citiesOtherColumn}>
                  <div className={styles.citiesHeader}>{"Population"}</div>
                  {cities.map((c, index) => {
                    const data = c.type_data as LocationCityData;
                    const rowStyle = index % 2 ? styles.odd : "";
                    return (
                      <div className={`${styles.citiesCell} ${rowStyle}`} key={index}>
                        <div className={styles.populationValue}>{`${addCommasToNumber(
                          data.population
                        )} / ${addCommasToNumber(getMaxPopulationForCityValue(data.city_value))} families`}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.citiesOtherColumn}>
                  <div className={styles.citiesHeader}>
                    <div className={styles.row}>
                      {"City Value"}
                      <InfoButton
                        className={styles.infoButton}
                        tooltipParams={{ id: "CityValueInfo", content: this.renderCityValueTooltip.bind(this) }}
                      />
                    </div>
                  </div>
                  {cities.map((c, index) => {
                    const data = c.type_data as LocationCityData;
                    const rowStyle = index % 2 ? styles.odd : "";
                    return (
                      <div className={`${styles.citiesCell} ${rowStyle}`} key={index}>
                        <div className={styles.citiesValue}>{`${addCommasToNumber(data.city_value)}gp`}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.updateSection}>
              {domain.last_updated_date === getFirstOfThisMonthDateString() ? (
                <span className={styles.updateLabel}>{`Up to date for ${dateFormat(new Date(), "mmmm yyyy")}`}</span>
              ) : (
                <button
                  className={styles.updateButton}
                  onClick={this.performDomainUpdateClick.bind(this, domain)}
                >{`Perform ${dateFormat(new Date(), "mmmm yyyy")} Update`}</button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  private performDomainUpdateClick(domain: DomainData): void {
    // Domain update cannot run if no treasury is specified.
    if ((domain?.treasury_storage_id ?? 0) === 0) {
      this.props.dispatch?.(
        showModal({
          id: "TreasuryError",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"You must set the Domain Treasury before performing a monthly update."}
            />
          ),
        })
      );
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DomainUpdate",
        content: () => <DomainUpdateDialog domain={domain} />,
      })
    );
  }

  private getMoraleTitle(morale: number): string {
    switch (morale) {
      case -4:
        return "Rebellious";
      case -3:
        return "Defiant";
      case -2:
        return "Turbulent";
      case -1:
        return "Demoralized";
      case 0:
        return "Apathetic";
      case 1:
        return "Loyal";
      case 2:
        return "Dedicated";
      case 3:
        return "Steadfast";
      case 4:
        return "Stalwart";
    }
    return "Unknown";
  }

  private renderMarketInfoTooltip(): React.ReactNode {
    return (
      <div className={styles.infoTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class I"}</div>
          <div className={styles.marketClassRequirement}>{"20,000+ families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class II"}</div>
          <div className={styles.marketClassRequirement}>{"5,000+ families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class III"}</div>
          <div className={styles.marketClassRequirement}>{"2,500+ families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class IV"}</div>
          <div className={styles.marketClassRequirement}>{"500+ families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class V"}</div>
          <div className={styles.marketClassRequirement}>{"250+ families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.marketClassLabel}>{"Class VI"}</div>
          <div className={styles.marketClassRequirement}>{"75+ families"}</div>
        </div>
      </div>
    );
  }

  private renderCityValueTooltip(): React.ReactNode {
    return (
      <div className={styles.infoTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"10,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 249 families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"25,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 499 families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"75,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 2,499 families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"200,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 4,999 families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"625,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 19,999 families"}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.cityValueLabel}>{"2,500,000gp"}</div>
          <div className={styles.marketClassRequirement}>{"max: 100,000 families"}</div>
        </div>
      </div>
    );
  }

  private getTotalPopulation(domain: DomainData): number {
    let pop = domain.frontier_population;

    domain.city_ids.forEach((cityId: number) => {
      const city = this.props.allLocations[cityId];
      const data = city.type_data as LocationCityData;
      pop += data.population;
    });

    return pop;
  }

  private async onAlignmentChanged(domain: DomainData, newAlignment: CharacterAlignment): Promise<void> {
    if (domain.alignment === newAlignment) {
      return;
    }

    const newDomain: DomainData = { ...domain, alignment: newAlignment };

    const res = await ServerAPI.editDomain(newDomain);
    if ("error" in res) {
      this.props.dispatch?.(
        showModal({
          id: "AlignmentError",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"Unable to alter alignment.  Check your network and try again."} />
          ),
        })
      );
    } else {
      this.props.dispatch?.(updateDomain(newDomain));
    }
  }

  private async onClassificationChanged(domain: DomainData, newClassification: DomainClassification): Promise<void> {
    if (domain.classification === newClassification) {
      return;
    }

    const newDomain: DomainData = { ...domain, classification: newClassification };

    const res = await ServerAPI.editDomain(newDomain);
    if ("error" in res) {
      this.props.dispatch?.(
        showModal({
          id: "ClassificationError",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Unable to alter classification.  Check your network and try again."}
            />
          ),
        })
      );
    } else {
      this.props.dispatch?.(updateDomain(newDomain));
    }
  }

  private async onColorChanged(domain: DomainData, newColor: string): Promise<void> {
    newColor = `${newColor}cc`;
    if (domain.color === newColor) {
      return;
    }

    const newDomain: DomainData = { ...domain, color: newColor };

    const res = await ServerAPI.editDomain(newDomain);
    if ("error" in res) {
      this.props.dispatch?.(
        showModal({
          id: "ColorError",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"Unable to alter color.  Check your network and try again."} />
          ),
        })
      );
    } else {
      this.props.dispatch?.(updateDomain(newDomain));
    }
  }

  private async onDomainEditClicked(domain?: DomainData): Promise<void> {
    this.props.dispatch?.(
      showModal({
        id: "DomainEditModal",
        content: () => {
          return (
            <SelectDomainDialog
              preselectedDomainId={domain?.id ?? 0}
              onSelectionConfirmed={async (domainId) => {
                if (domainId > 0) {
                  const res = ServerAPI.setDomainRuler(this.props.dashboardCharacterId, domainId);
                  if ("error" in res) {
                    this.props.dispatch?.(
                      showModal({
                        id: "SetRulerError",
                        content: () => (
                          <BasicDialog
                            title={"Error"}
                            prompt={
                              "An Error occurred while attempting to change domain ruler.  Please check your network and try again."
                            }
                          />
                        ),
                      })
                    );
                  } else {
                    this.props.dispatch?.(setDomainRuler({ domainId, rulerId: this.props.dashboardCharacterId }));
                  }
                } else {
                  const res = ServerAPI.setDomainRuler(this.props.dashboardCharacterId, domainId);
                  if ("error" in res) {
                    this.props.dispatch?.(
                      showModal({
                        id: "SetRulerError",
                        content: () => (
                          <BasicDialog
                            title={"Error"}
                            prompt={
                              "An Error occurred while attempting to change domain ruler.  Please check your network and try again."
                            }
                          />
                        ),
                      })
                    );
                  } else {
                    // If the character was previously ruling a domain, this will unset the rule field for that domain.
                    this.props.dispatch?.(setDomainRuler({ domainId: domain?.id ?? 0, rulerId: 0 }));
                  }
                }
              }}
            />
          );
        },
      })
    );
  }

  private onHexesEditClicked(domain: DomainData): void {
    const mapId = this.props.allMapHexes[domain.hex_ids[0]]?.map_id ?? undefined;

    this.props.dispatch?.(
      showModal({
        id: "EditHexes",
        content: () => {
          return (
            <MapHexSelectorDialog
              preselectedMapId={mapId}
              preselectedHexIds={domain.hex_ids}
              onValuesConfirmed={async (mapId: number, hexIds: number[]) => {
                // Try to assign the selected hexes to the current domain.
                const newDomain: DomainData = { ...domain, hex_ids: hexIds };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "SelectionError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={"Something went wrong while assigning hexes.  Check your network and try again."}
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onFrontierPopulationEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditFrontierPopulation",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${domain.name} Frontier Population`}
              prompt={"Enter the current frontier (non-city) population, in families."}
              initialValue={domain.frontier_population}
              onValueConfirmed={async (newPopulation: number) => {
                const newDomain: DomainData = { ...domain, frontier_population: newPopulation };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "PopulationError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating population count.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onMoraleEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditMorale",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${domain.name} Current Morale`}
              prompt={"Enter the current morale level of the domain (-4 to 4)."}
              initialValue={domain.current_morale}
              onValueConfirmed={async (newMorale: number) => {
                const newDomain: DomainData = { ...domain, current_morale: newMorale };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "MoraleError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain morale.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onFundsEditClicked(domain: DomainData): void {
    const treasury = this.props.allStorages[domain.treasury_storage_id];
    // No treasury, no funds.
    if (!treasury) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "EditFunds",
        content: () => {
          return (
            <InputSingleNumberDialog
              title={`${domain.name} Current Funds`}
              prompt={"Enter the current gp in the domain's treasury."}
              initialValue={treasury.money}
              onValueConfirmed={async (newMoney: number) => {
                const newStorage: StorageData = {
                  ...treasury,
                  money: newMoney,
                };

                const res = await ServerAPI.editStorage(newStorage);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "FundsError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain funds.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateStorage(newStorage));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onTreasuryEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditTreasury",
        content: () => {
          return (
            <SelectStorageDialog
              preselectedStorageId={domain.treasury_storage_id}
              onSelectionConfirmed={async (treasury_storage_id: number) => {
                const newDomain: DomainData = { ...domain, treasury_storage_id };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "TreasuryError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain treasury.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onGarrisonEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditGarrison",
        content: () => {
          return (
            <SelectArmiesDialog
              preselectedArmyIDs={domain.garrison_army_ids}
              onSelectionConfirmed={async (garrison_army_ids: number[]) => {
                const newDomain: DomainData = { ...domain, garrison_army_ids };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "GarrisonError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain garrison.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onFortificationsEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditFortifications",
        content: () => {
          return (
            <SelectStructuresDialog
              preselectedStructureIds={domain.fortification_structure_ids}
              onSelectionConfirmed={async (fortification_structure_ids: number[]) => {
                const newDomain: DomainData = { ...domain, fortification_structure_ids };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "FortificationsError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain fortifications.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private onCitiesEditClicked(domain: DomainData): void {
    this.props.dispatch?.(
      showModal({
        id: "EditCities",
        content: () => {
          return (
            <SelectLocationsDialog
              locationIdWhitelist={this.getPossibleCityIds(domain)}
              preselectedLocationIds={domain.city_ids}
              onSelectionConfirmed={async (city_ids: number[]) => {
                const newDomain: DomainData = { ...domain, city_ids };
                const res = await ServerAPI.editDomain(newDomain);
                if ("error" in res) {
                  this.props.dispatch?.(
                    showModal({
                      id: "CitiesError",
                      content: () => (
                        <BasicDialog
                          title={"Error!"}
                          prompt={
                            "Something went wrong while updating domain cities.  Check your network and try again."
                          }
                        />
                      ),
                    })
                  );
                } else {
                  this.props.dispatch?.(updateDomain(newDomain));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }

  private getTotalFortificationValue(domain: DomainData): number {
    return domain.fortification_structure_ids.reduce<number>((soFar: number, structureId: number) => {
      return soFar + getStructureValue(structureId);
    }, 0);
  }

  private getPossibleCityIds(domain: DomainData): number[] {
    if (!domain) return [];

    return Object.values(this.props.allLocations)
      .filter((loc) => {
        return loc.type === "City" && domain.hex_ids.includes(loc.hex_id);
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((l) => l.id);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.dashboardCharacterId];
  const { dashboardCharacterId } = state.characters;
  const allStorages = state.storages.allStorages;
  const allDomains = state.domains.allDomains;
  const allMaps = state.maps.maps;
  const allMapHexes = state.maps.mapHexes;

  return {
    ...props,
    character,
    dashboardCharacterId,
    allStorages,
    allDomains,
    allMaps,
    allMapHexes,
    allLocations: state.locations.locations,
  };
}

export const DashboardDomainSection = connect(mapStateToProps)(ADashboardDomainSection);
