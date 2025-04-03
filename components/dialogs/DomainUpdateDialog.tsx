import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import styles from "./DomainUpdateDialog.module.scss";
import { FittingView } from "../FittingView";
import { ArmyData, CharacterData, DomainData, LocationCityData, LocationData, StructureData } from "../../serverAPI";
import dateFormat from "dateformat";
import { ModalCloseButton } from "../ModalCloseButton";
import { addCommasToNumber, BonusCalculations } from "../../lib/characterUtils";
import { InfoButton } from "../InfoButton";
import { getArmyTotalWages } from "../../lib/armyUtils";
import { getStructureMonthlyMaintenance } from "../../lib/structureUtils";
import { showModal } from "../../redux/modalsSlice";
import { BasicDialog } from "./BasicDialog";
import { DomainUpdateOutcomesDialog } from "./DomainUpdateOutcomesDialog";

interface State {
  was_administered: boolean;
  did_adventure: boolean;
  investmentStrings: Record<number, string>;
}

interface ReactProps {
  domain: DomainData;
}

interface InjectedProps {
  ruler: CharacterData;
  allLocations: Record<number, LocationData>;
  allArmies: Record<number, ArmyData>;
  allStructures: Record<number, StructureData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADomainUpdateDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      was_administered: true,
      did_adventure: true,
      investmentStrings: {},
    };
  }

  render(): React.ReactNode {
    const cities = this.props.domain.city_ids
      .map((cid) => {
        return Object.values(this.props.allLocations).find((loc) => {
          return loc.id === cid && loc.type === "City";
        }) as LocationData;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    const revenue = this.calculateRevenue(cities);
    const expenses = this.calculateExpenses(cities);

    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{`${this.props.domain.name} - ${dateFormat(new Date(), "mmmm yyyy")}`}</div>
        </FittingView>

        <div className={styles.row}>
          <span
            className={styles.checkboxLabel}
          >{`Did ${this.props.ruler.name} administrate the domain this month?\xa0`}</span>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.was_administered}
            onChange={(e) => {
              this.setState({ was_administered: e.target.checked });
            }}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.checkboxLabel}>{`Did ${this.props.ruler.name} go adventuring this month?\xa0`}</span>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.did_adventure}
            onChange={(e) => {
              this.setState({ did_adventure: e.target.checked });
            }}
          />
        </div>
        {this.renderRevenueSection(revenue, expenses)}
        {this.renderInvestmentSection(revenue, cities)}
        <button className={styles.button} onClick={this.onBeginClick.bind(this, revenue, expenses)}>
          {"Begin"}
        </button>

        <ModalCloseButton />
      </div>
    );
  }

  private renderRevenueSection(revenue: BonusCalculations, expenses: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.revenueSection}>
        <div className={styles.row}>
          <span className={styles.revenueLabel}>{"Revenue:\xa0"}</span>
          <span className={styles.revenueValue}>{`${addCommasToNumber(revenue.bonus, 2)}gp`}</span>
          <InfoButton
            className={styles.infoButton}
            tooltipParams={{ id: "Revenue", content: this.renderRevenueTooltip.bind(this, revenue) }}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.revenueLabel}>{"Expenses:\xa0"}</span>
          <span className={styles.expensesValue}>{`${addCommasToNumber(expenses.bonus, 2)}gp`}</span>
          <InfoButton
            className={styles.infoButton}
            tooltipParams={{ id: "Expenses", content: this.renderExpensesTooltip.bind(this, expenses) }}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.revenueLabel}>{"Net Income:\xa0"}</span>
          <span className={styles.incomeValue}>{`${addCommasToNumber(revenue.bonus - expenses.bonus, 2)}gp`}</span>
        </div>
      </div>
    );
  }

  private renderRevenueTooltip(calc: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"Revenue"}</div>
          <div className={styles.tooltipValue}>{`${addCommasToNumber(calc.bonus, 2)}gp`}</div>
        </div>
        <div className={styles.divider} />
        {calc?.sources.map(({ name, value }) => {
          return (
            <div className={styles.sourceRow} key={name}>
              <div className={styles.source}>{name}</div>
              <div className={styles.sourceValue}>{`${addCommasToNumber(value, 2)}gp`}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderExpensesTooltip(calc: BonusCalculations): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"Expenses"}</div>
          <div className={styles.tooltipExpenseValue}>{`${addCommasToNumber(calc.bonus, 2)}gp`}</div>
        </div>
        <div className={styles.divider} />
        {calc?.sources.map(({ name, value }) => {
          return (
            <div className={styles.sourceRow} key={name}>
              <div className={styles.source}>{name}</div>
              <div className={styles.expenseSourceValue}>{`${addCommasToNumber(value, 2)}gp`}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderInvestmentSection(revenue: BonusCalculations, cities: LocationData[]): React.ReactNode {
    return (
      <div className={styles.column}>
        <div className={styles.investmentSection}>
          <div className={styles.row}>
            <div className={styles.column}>
              <div className={styles.investmentCell}>
                <div className={styles.investmentLabel}>{"Frontier Investment:\xa0"}</div>
              </div>
              {cities.map((loc, index) => {
                return (
                  <div className={styles.investmentCell} key={index}>
                    <div className={styles.investmentLabel}>{`${loc.name} Investment:\xa0`}</div>
                  </div>
                );
              })}
            </div>
            <div className={styles.column}>
              <div className={styles.investmentCell}>
                <input
                  className={styles.inputField}
                  type={"number"}
                  value={this.state.investmentStrings[0] ?? "0"}
                  onChange={(e) => {
                    const investmentStrings = { ...this.state.investmentStrings };
                    investmentStrings[0] = e.target.value;
                    this.setState({ investmentStrings });
                  }}
                />
                <div className={styles.investmentLabel}>{`\xa0gp`}</div>
              </div>
              {cities.map((loc, index) => {
                return (
                  <div className={styles.investmentCell} key={index}>
                    <input
                      className={styles.inputField}
                      type={"number"}
                      value={this.state.investmentStrings[index + 1] ?? "0"}
                      onChange={(e) => {
                        const investmentStrings = { ...this.state.investmentStrings };
                        investmentStrings[loc.id] = e.target.value;
                        this.setState({ investmentStrings });
                      }}
                    />
                    <div className={styles.investmentLabel}>{`\xa0gp`}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.infoLabel}>{`Total investment may not exceed domain Revenue (${addCommasToNumber(
            revenue.bonus,
            2
          )}gp)`}</div>
          <div className={styles.infoLabel}>{`Each 1000gp invested increases population growth by 1d10 families.`}</div>
          <div className={styles.infoLabel}>{`City investments increase maximum population for that city.`}</div>
        </div>
      </div>
    );
  }

  private calculateRevenue(cities: LocationData[]): BonusCalculations {
    const { domain } = this.props;
    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Income comes from population, both frontier and cities.
    const frontierIncome = 12 * domain.frontier_population;
    calc.bonus += frontierIncome;
    calc.sources.push({
      name: `Frontier Income (12gp * ${domain.frontier_population} families)`,
      value: frontierIncome,
    });

    cities.forEach((city) => {
      const { population } = city.type_data as LocationCityData;
      const incomePerFamily = this.getIncomePerFamilyForCityPopulation(population);
      const cityIncome = incomePerFamily * population;
      calc.bonus += cityIncome;
      calc.sources.push({
        name: `${city.name} Income (${incomePerFamily}gp * ${population} families)`,
        value: cityIncome,
      });
    });

    return calc;
  }

  private getIncomePerFamilyForCityPopulation(population: number): number {
    if (population >= 20000) {
      return 8.5;
    } else if (population >= 5000) {
      return 8;
    } else if (population >= 2500) {
      return 7.5;
    } else if (population >= 75) {
      return 7;
    } else {
      // Technically illegal to have less than 75 families in a city.
      return 0;
    }
  }

  private calculateExpenses(cities: LocationData[]): BonusCalculations {
    const { domain } = this.props;
    const calc: BonusCalculations = {
      bonus: 0,
      sources: [],
      conditionalSources: [],
    };

    // Garrisons.
    domain.garrison_army_ids.forEach((aid) => {
      const army = this.props.allArmies[aid];
      const armyWages = getArmyTotalWages(aid);
      calc.bonus += armyWages;
      calc.sources.push({ name: `${army.name} wages`, value: armyWages });
    });

    // Fortifications.
    domain.fortification_structure_ids.forEach((sid) => {
      const structure = this.props.allStructures[sid];
      const maintenance = getStructureMonthlyMaintenance(sid);
      calc.bonus += maintenance;
      calc.sources.push({ name: `${structure.name} maintenance`, value: maintenance });
    });

    // Other expenses are per-family, both frontier and cities.
    const totalPopulation = cities.reduce<number>((pop, loc) => {
      const cityData = loc.type_data as LocationCityData;
      return pop + cityData.population;
    }, domain.frontier_population);

    calc.bonus += 3 * totalPopulation;
    calc.sources.push({
      name: `Liturgies (1gp * ${addCommasToNumber(totalPopulation)} families)`,
      value: totalPopulation,
    });
    calc.sources.push({
      name: `Tithes (1gp * ${addCommasToNumber(totalPopulation)} families)`,
      value: totalPopulation,
    });
    calc.sources.push({
      name: `Upkeep (1gp * ${addCommasToNumber(totalPopulation)} families)`,
      value: totalPopulation,
    });

    return calc;
  }

  private onBeginClick(revenue: BonusCalculations, expenses: BonusCalculations): void {
    // Validate investment total.

    // Maps locationId (or zero for frontier) to investment amount.
    const investments: Record<number, number> = {};
    Object.entries(this.state.investmentStrings).forEach(([locId, is]) => {
      investments[+locId] = is ? +is : 0;
    });
    const totalInvestment = Object.entries(investments).reduce<number>((soFar, [locId, amount]) => soFar + amount, 0);
    if (totalInvestment > revenue.bonus) {
      this.props.dispatch?.(
        showModal({
          id: "InvestmentError",
          content: () => (
            <BasicDialog
              title={"Error!"}
              prompt={`Total Investment (${addCommasToNumber(
                totalInvestment,
                2
              )}gp) may not exceed Revenue (${addCommasToNumber(revenue.bonus, 2)}gp)`}
            />
          ),
        })
      );
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "DomainOutcomes",
        content: () => (
          <DomainUpdateOutcomesDialog
            domain={this.props.domain}
            investments={investments}
            wasAdministered={this.state.was_administered}
            didAdventure={this.state.did_adventure}
            netIncome={revenue.bonus - expenses.bonus}
          />
        ),
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const ruler = state.characters.characters[props.domain.ruler_character_id];
  return {
    ...props,
    ruler,
    allLocations: state.locations.locations,
    allArmies: state.armies.armies,
    allStructures: state.structures.structures,
  };
}

export const DomainUpdateDialog = connect(mapStateToProps)(ADomainUpdateDialog);
