import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./DomainUpdateOutcomesDialog.module.scss";
import ServerAPI, { CharacterData, DomainData, LocationCityData, LocationData, StorageData } from "../../serverAPI";
import dateFormat from "dateformat";
import { ModalCloseButton } from "../ModalCloseButton";
import { CharacterStat, DieRoll } from "../../staticData/types/characterClasses";
import {
  addCommasToNumber,
  getAbilityComponentInstanceSourceName,
  getActiveAbilityComponentsForCharacter,
  getCharacterStat,
  getCharacterStatv2,
  getCharacterSupportsV2,
  getProficiencyRankForCharacter,
  getStatBonusForValue,
  rollDice,
  rollFactorialDie,
} from "../../lib/characterUtils";
import { ProficiencyLeadership } from "../../staticData/proficiencies/ProficiencyLeadership";
import {
  AbilityComponentDomainMoraleBonusStatic,
  AbilityComponentDomainMoraleBonusStaticData,
} from "../../staticData/abilityComponents/AbilityComponentDomainMoraleBonusStatic";
import { SavingVeil } from "../SavingVeil";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { BasicDialog } from "./BasicDialog";
import { showToaster } from "../../redux/toastersSlice";
import { getArmyTotalWages } from "../../lib/armyUtils";
import { updateDomain } from "../../redux/domainsSlice";
import { updateLocation } from "../../redux/locationsSlice";
import { updateStorage } from "../../redux/storageSlice";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { getMaxPopulationForCityValue } from "../../lib/locationUtils";
import { getMaxFrontierPopulationForDomain } from "../../lib/domainUtils";

interface PopulationRolls {
  prestigeGrowth: number;
  naturalGrowth: number;
  naturalDecline: number;
  moraleGrowth: number;
  investmentGrowth: number;
}

interface State {
  // Key: locationId (or zero for Frontier)
  populationRolls: Record<number, PopulationRolls>;
  moraleRoll: number;
  isSaving: boolean;

  newCurrentMorale: number;
  newTreasuryValue: number;
  newFrontierPopulation: number;
  cityUpdates: Record<number, LocationCityData>;
}

interface ReactProps {
  domain: DomainData;
  investments: Record<number, number>;
  wasAdministered: boolean;
  didAdventure: boolean;
  netIncome: number;
}

interface InjectedProps {
  ruler: CharacterData;
  allLocations: Record<number, LocationData>;
  treasury: StorageData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADomainUpdateOutcomesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = this.performRolls(props);
  }

  render(): React.ReactNode {
    const cities = this.props.domain.city_ids
      .map((cid) => {
        return Object.values(this.props.allLocations).find((loc) => {
          return loc.id === cid && loc.type === "City";
        }) as LocationData;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <div className={styles.root}>
        <div className={styles.title}>{`${this.props.domain.name} - ${dateFormat(
          new Date(),
          "mmmm yyyy"
        )} Outcomes`}</div>

        {this.renderPopulationSections(cities)}
        {this.renderMoraleSection()}

        <button className={styles.button} onClick={this.onApplyClick.bind(this)}>
          {"Apply Outcomes"}
        </button>

        <SavingVeil show={this.state.isSaving} />
        <ModalCloseButton />
      </div>
    );
  }

  private renderPopulationSections(cities: LocationData[]): React.ReactNode {
    return (
      <>
        {this.renderPopulationSection(0)}
        {cities.map((loc) => {
          return this.renderPopulationSection(loc.id);
        })}
      </>
    );
  }

  private renderPopulationSection(id: number): React.ReactNode {
    const { domain, investments } = this.props;
    const city = this.props.allLocations[id];
    const cityData = (city?.type_data as LocationCityData) ?? {
      market_class: 0,
      population: domain.frontier_population,
      city_value: 0,
    };
    const name = city ? `${city.name} Population` : "Frontier Population";

    const populationMultiplier = Math.ceil(cityData.population / 1000);
    const prestigeRoll = this.getPrestigeRollForPopulation(cityData.population);

    const investmentMultiplier = Math.floor((investments[id] ?? 0) / 1000);

    const rolls = this.state.populationRolls[id];
    const netGrowth =
      rolls.investmentGrowth + rolls.moraleGrowth + rolls.prestigeGrowth + rolls.naturalDecline + rolls.naturalGrowth;

    return (
      <div className={styles.section} key={id}>
        <div className={styles.sectionHeader}>{name}</div>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.growthLabel}>{`Natural Growth ( ${populationMultiplier}× 1d10! ):`}</div>
            <div className={styles.growthLabel}>{`Natural Decline ( ${populationMultiplier}× 1d10! ):`}</div>
            <div className={styles.growthLabel}>{`Prestige Growth ( ${prestigeRoll.dice}d${prestigeRoll.die} ):`}</div>
            {domain.current_morale > 0 && (
              <div
                className={styles.growthLabel}
              >{`Morale Growth ( ${populationMultiplier}× ${domain.current_morale}d10 ):`}</div>
            )}
            {domain.current_morale < 0 && (
              <div className={styles.growthLabel}>{`Morale Decline ( ${populationMultiplier}× ${Math.abs(
                domain.current_morale
              )}d10 ):`}</div>
            )}
            {investmentMultiplier > 0 && (
              <div className={styles.growthLabel}>{`Investment Growth ( ${investmentMultiplier}d10 ):`}</div>
            )}
            <div className={styles.divider} />
            {netGrowth >= 0 ? (
              <div className={styles.growthLabel}>{`Net Growth:`}</div>
            ) : (
              <div className={styles.growthLabel}>{`Net Decline:`}</div>
            )}
          </div>
          <div className={styles.column}>
            <div className={styles.growthValue}>{addCommasToNumber(rolls.naturalGrowth)}</div>
            <div className={styles.declineValue}>{addCommasToNumber(rolls.naturalDecline)}</div>
            <div className={styles.growthValue}>{addCommasToNumber(rolls.prestigeGrowth)}</div>
            {domain.current_morale > 0 && (
              <div className={styles.growthValue}>{addCommasToNumber(rolls.moraleGrowth)}</div>
            )}
            {domain.current_morale < 0 && (
              <div className={styles.declineValue}>{addCommasToNumber(rolls.moraleGrowth)}</div>
            )}
            {investmentMultiplier > 0 && (
              <div className={styles.growthValue}>{addCommasToNumber(rolls.investmentGrowth)}</div>
            )}
            <div className={styles.divider} />
            {netGrowth >= 0 ? (
              <div className={styles.growthValue}>{addCommasToNumber(netGrowth)}</div>
            ) : (
              <div className={styles.declineValue}>{addCommasToNumber(netGrowth)}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  private getPrestigeRollForPopulation(pop: number): DieRoll {
    const diceForPopulation: DieRoll[] = [
      { dice: 5, die: 20, bonus: 0 },
      { dice: 5, die: 10, bonus: 0 },
      { dice: 4, die: 10, bonus: 0 },
      { dice: 3, die: 10, bonus: 0 },
      { dice: 2, die: 10, bonus: 0 },
      { dice: 1, die: 10, bonus: 0 },
    ];
    let index = Math.min(5, Math.floor(pop / 100));

    return diceForPopulation[index];
  }

  private renderMoraleSection(): React.ReactNode {
    const personalAuthorityBonus = this.getPersonalAuthorityBonus();

    let charismaBonus = 0;
    let leadershipBonusSources: { name: string; value: number }[] = [];
    if (!getCharacterSupportsV2(this.props.ruler)) {
      const charisma = getCharacterStat(this.props.ruler, CharacterStat.Charisma);
      charismaBonus = getStatBonusForValue(charisma);
      const hasLeadershipBonus = getProficiencyRankForCharacter(this.props.ruler.id, ProficiencyLeadership.id) > 0;
      if (hasLeadershipBonus) {
        leadershipBonusSources = [{ name: "Leadership Proficiency", value: 1 }];
      }
    } else {
      const instances = getActiveAbilityComponentsForCharacter(this.props.ruler);
      const charisma = getCharacterStatv2(this.props.ruler, CharacterStat.Charisma, instances);
      charismaBonus = getStatBonusForValue(charisma);
      leadershipBonusSources = instances[AbilityComponentDomainMoraleBonusStatic.id].map((instance) => {
        return {
          name: getAbilityComponentInstanceSourceName(instance),
          value: (instance.data as AbilityComponentDomainMoraleBonusStaticData).bonus,
        };
      });
    }

    const totalBonus =
      personalAuthorityBonus +
      charismaBonus +
      leadershipBonusSources.reduce<number>((soFar, { name, value }) => soFar + value, 0);

    return (
      <>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>{"Base Morale"}</div>
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={styles.moraleLabel}>{`L${this.props.ruler.level} Ruler vs ${addCommasToNumber(
                this.props.netIncome
              )}gp Income:`}</div>
              <div className={styles.moraleLabel}>{`Ruler Charisma Bonus:`}</div>
              {leadershipBonusSources.map(({ name, value }, index) => {
                return (
                  <div className={styles.moraleLabel} key={index}>
                    {name}
                  </div>
                );
              })}
              <div className={styles.divider} />
              <div className={styles.moraleLabel}>{`Total:`}</div>
            </div>
            <div className={styles.column}>
              <div className={personalAuthorityBonus >= 0 ? styles.growthValue : styles.declineValue}>{`${
                personalAuthorityBonus > 0 ? "+" : ""
              }${personalAuthorityBonus}`}</div>
              <div className={charismaBonus >= 0 ? styles.growthValue : styles.declineValue}>{`${
                charismaBonus > 0 ? "+" : ""
              }${charismaBonus}`}</div>
              {leadershipBonusSources.map(({ name, value }, index) => {
                return (
                  <div className={value >= 0 ? styles.growthValue : styles.declineValue} key={index}>{`${
                    value > 0 ? "+" : ""
                  }${value}`}</div>
                );
              })}
              <div className={styles.divider} />
              <div className={totalBonus >= 0 ? styles.growthValue : styles.declineValue}>{`${
                totalBonus > 0 ? "+" : ""
              }${totalBonus}`}</div>
            </div>
          </div>
        </div>
        {this.renderCurrentMoraleSection(totalBonus)}
      </>
    );
  }

  private renderCurrentMoraleSection(baseMorale: number): React.ReactNode {
    const { current_morale } = this.props.domain;

    const [newCurrentMorale, rollExplanation] = this.calculateNewCurrentMorale(baseMorale);
    if (newCurrentMorale !== this.state.newCurrentMorale) {
      this.setState({ newCurrentMorale });
    }

    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>{"Current Morale"}</div>
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.moraleLabel}>{`Previous Month's Morale:`}</div>
            <div className={styles.moraleLabel}>{`Morale Roll (2d6${this.props.wasAdministered ? "+1" : ""}):`}</div>
            <div className={styles.divider} />
            <div className={styles.moraleLabel}>{`New Current Morale:`}</div>
          </div>
          <div className={styles.column}>
            <div className={styles.growthMorale}>{`${current_morale > 0 ? "+" : ""}${current_morale}`}</div>
            <div
              className={newCurrentMorale >= current_morale ? styles.growthMorale : styles.declineMorale}
            >{`${this.state.moraleRoll} - ${rollExplanation}`}</div>
            <div className={styles.divider} />
            <div className={newCurrentMorale >= 0 ? styles.growthMorale : styles.declineMorale}>{`${
              newCurrentMorale > 0 ? "+" : ""
            }${newCurrentMorale}`}</div>
          </div>
        </div>
      </div>
    );
  }

  private calculateNewCurrentMorale(baseMorale: number): [number, string] {
    const { current_morale } = this.props.domain;
    switch (this.state.moraleRoll) {
      case 13:
      case 12: {
        return [Math.min(4, current_morale + 2), "Increases by 2"];
      }
      case 11:
      case 10:
      case 9: {
        return [Math.min(4, current_morale + 1), "Increases by 1"];
      }
      case 8:
      case 7:
      case 6: {
        if (current_morale < baseMorale) {
          return [Math.min(4, current_morale + 1), "Increases by 1"];
        } else if (current_morale > baseMorale) {
          return [Math.max(-4, current_morale - 1), "Decreases by 1"];
        } else {
          return [current_morale, "No change"];
        }
      }
      case 5:
      case 4:
      case 3: {
        return [Math.max(-4, current_morale - 1), "Decreases by 1"];
      }
      case 2: {
        return [Math.max(-4, current_morale - 2), "Decreases by 2"];
      }
    }
    return [0, "Invalid Roll"];
  }

  private getPersonalAuthorityBonus(): number {
    const { netIncome, ruler } = this.props;
    const wealthBreakpoints = [25, 75, 150, 300, 600, 1200, 2400, 5000, 10000, 20000, 45000, 75000, 150000, 425000];
    let wealthIndex = 0;
    for (; wealthIndex < wealthBreakpoints.length; ++wealthIndex) {
      if (netIncome < wealthBreakpoints[wealthIndex]) {
        break;
      }
    }

    const authorityBonus = Math.min(4, Math.max(-4, ruler.level - wealthIndex - 1));

    return authorityBonus;
  }

  private async onApplyClick(): Promise<void> {
    this.setState({ isSaving: true });

    const res = await ServerAPI.updateDomain(
      this.props.domain.id,
      this.state.newCurrentMorale,
      this.state.newFrontierPopulation,
      this.state.cityUpdates,
      this.props.domain.treasury_storage_id,
      this.state.newTreasuryValue
    );

    if ("error" in res || res.find((r) => "error" in r)) {
      this.props.dispatch?.(
        showModal({
          id: "updateDomainError",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={"Failed to update the domain.  Please check your network connection and try again."}
            />
          ),
        })
      );
    } else if (this.props.dispatch) {
      this.props.dispatch(
        showToaster({
          content: {
            title: "Domain updated!",
            message: "",
          },
        })
      );

      // Update local Domain data.
      const newDomain: DomainData = {
        ...this.props.domain,
        current_morale: this.state.newCurrentMorale,
        frontier_population: this.state.newFrontierPopulation,
        last_updated_date: getFirstOfThisMonthDateString(),
      };
      this.props.dispatch(updateDomain(newDomain));

      // Update local Location/City data.
      Object.entries(this.state.cityUpdates).forEach(([locationIdString, cityData]) => {
        const newCity: LocationData = { ...this.props.allLocations[+locationIdString], type_data: cityData };
        this.props.dispatch?.(updateLocation(newCity));
      });

      // Update local treasury data.
      const newTreasury: StorageData = { ...this.props.treasury, money: this.state.newTreasuryValue };
      this.props.dispatch(updateStorage(newTreasury));

      // Hide the Outcomes dialog.
      this.props.dispatch(hideModal());
      // Hide the Inputs dialog.
      this.props.dispatch(hideModal());
    }

    this.setState({ isSaving: false });
  }

  private performRolls(props: Props): State {
    const results: State = {
      populationRolls: {},
      moraleRoll: 0,
      isSaving: false,
      newCurrentMorale: 0,
      newTreasuryValue: 0,
      newFrontierPopulation: 0,
      cityUpdates: {},
    };

    // Population rolls.
    const { domain, investments } = props;
    let cityOverflow: number = 0;
    for (let i = -1; i < props.domain.city_ids.length; ++i) {
      const cityId = domain.city_ids[i] ?? 0;
      const population =
        (props.allLocations[cityId]?.type_data as LocationCityData)?.population ?? domain.frontier_population;

      const populationMultiplier = Math.ceil(population / 1000);
      const prestigeRoll = this.getPrestigeRollForPopulation(population);

      const investmentMultiplier = Math.floor((investments[cityId] ?? 0) / 1000);

      let naturalGrowth = 0;
      let naturalDecline = 0;
      for (let i = 0; i < populationMultiplier; ++i) {
        naturalGrowth += rollFactorialDie(10);
        naturalDecline += rollFactorialDie(10);
      }

      results.populationRolls[cityId] = {
        naturalGrowth,
        naturalDecline,
        prestigeGrowth: rollDice(prestigeRoll.dice, prestigeRoll.die),
        moraleGrowth: rollDice(populationMultiplier * domain.current_morale, 10),
        investmentGrowth: rollDice(investmentMultiplier, 10),
      };

      const rolls = results.populationRolls[cityId];
      if (cityId > 0) {
        // City update.
        const cityData: LocationCityData = { ...(props.allLocations[cityId].type_data as LocationCityData) };
        cityData.population =
          cityData.population +
          rolls.investmentGrowth +
          rolls.moraleGrowth +
          rolls.naturalDecline +
          rolls.naturalGrowth +
          rolls.prestigeGrowth;

        // If we invested, make sure the city value grows.
        if (props.investments[cityId]) {
          cityData.city_value += props.investments[cityId];
        }

        // Check if population growth has exceeded city limits.
        const maxPop = getMaxPopulationForCityValue(cityData.city_value);
        if (cityData.population > maxPop) {
          cityOverflow += cityData.population - maxPop;
        }

        results.cityUpdates[cityId] = cityData;
      } else {
        // Frontier update.
        results.newFrontierPopulation =
          domain.frontier_population +
          rolls.investmentGrowth +
          rolls.moraleGrowth +
          rolls.naturalDecline +
          rolls.naturalGrowth +
          rolls.prestigeGrowth;
      }
    }
    // Any overflow from full cities goes to the frontier.
    results.newFrontierPopulation += cityOverflow;
    // But any overflow from the frontier goes to other domains, so we lose it!
    const maxFrontierPop = getMaxFrontierPopulationForDomain(domain);
    results.newFrontierPopulation = Math.min(results.newFrontierPopulation, maxFrontierPop);

    // Morale roll.
    results.moraleRoll = rollDice(2, 6) + (props.wasAdministered ? 1 : 0);

    // Treasury update.
    results.newTreasuryValue =
      props.treasury.money +
      props.netIncome +
      // We put back the garrison expenses, since those are paid separately via Contracts.
      props.domain.garrison_army_ids.reduce<number>((totalWages, armyId) => {
        const wages = getArmyTotalWages(armyId);
        return totalWages + wages;
      }, 0) -
      // And we take out money for the Investments.
      Object.entries(investments).reduce<number>((soFar, [locId, amount]) => soFar + amount, 0);
    return results;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const ruler = state.characters.characters[props.domain.ruler_character_id];
  const treasury = state.storages.allStorages[props.domain.treasury_storage_id];
  return {
    ...props,
    ruler,
    allLocations: state.locations.locations,
    treasury,
  };
}

export const DomainUpdateOutcomesDialog = connect(mapStateToProps)(ADomainUpdateOutcomesDialog);
