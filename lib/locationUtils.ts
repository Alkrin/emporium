export function getMarketClassForPopulation(families: number): number {
  if (families >= 20000) {
    return 1;
  } else if (families >= 5000) {
    return 2;
  } else if (families >= 2500) {
    return 3;
  } else if (families >= 500) {
    return 4;
  } else if (families >= 250) {
    return 5;
  } else if (families >= 75) {
    return 6;
  }

  return 0;
}

export function getMaxPopulationForCityValue(cityValue: number): number {
  if (cityValue >= 2500000) {
    return 100000;
  } else if (cityValue >= 625000) {
    return 19999;
  } else if (cityValue >= 200000) {
    return 4999;
  } else if (cityValue >= 75000) {
    return 2499;
  } else if (cityValue >= 25000) {
    return 499;
  } else if (cityValue >= 10000) {
    return 249;
  }

  return 0;
}
