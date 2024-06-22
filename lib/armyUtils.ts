import store from "../redux/store";
import { TroopData } from "../serverAPI";
import dateFormat from "dateformat";
import { MaintenanceStatus } from "./characterUtils";
import { getFirstOfThisMonthDateString } from "./stringUtils";

export function getTroopAvailableUnitCount(troop: TroopData, currentDateOverride?: string): number {
  const redux = store.getState();

  let bodyCount = troop.count;
  const now = currentDateOverride ?? dateFormat(new Date(), "yyyy-mm-dd");
  const injuries = (redux.armies.troopInjuriesByTroop[troop.id] ?? []).filter((injuryData) => {
    // yyyy-mm-dd format is alphabetically sortable!
    return now.localeCompare(injuryData.recovery_date) < 0;
  });
  const injuryCount = injuries.reduce<number>((totalInjuries, tid) => {
    return totalInjuries + tid.count;
  }, 0);
  bodyCount -= injuryCount;

  return bodyCount;
}

export function getTroopAvailableBattleRating(troop: TroopData, currentDateOverride?: string): number {
  let bodyCount = getTroopAvailableUnitCount(troop, currentDateOverride);
  return getBattleRatingForTroopDefAndCount(troop.def_id, bodyCount);
}

export function getBattleRatingForTroopDefAndCount(defId: number, bodyCount: number): number {
  const redux = store.getState();
  const def = redux.gameDefs.troops[defId];

  const platoonCount = Math.floor(bodyCount / def.platoon_size);
  const individualCount = bodyCount % def.platoon_size;

  return platoonCount * def.platoon_br + individualCount * def.individual_br;
}

export function getArmyAvailableBattleRating(armyID: number, currentDateOverride?: string): number {
  const redux = store.getState();
  const troops = redux.armies.troopsByArmy[armyID];

  let br: number = 0;
  troops?.forEach((troop) => {
    br += getTroopAvailableBattleRating(troop, currentDateOverride);
  });

  return br;
}

export function getArmyTotalBattleRating(armyID: number): number {
  const redux = store.getState();
  const troops = redux.armies.troopsByArmy[armyID];

  let br: number = 0;
  troops?.forEach((troop) => {
    br += getBattleRatingForTroopDefAndCount(troop.def_id, troop.count);
  });

  return br;
}

export function getArmyLowestSpeed(armyID: number): number {
  const redux = store.getState();
  const troops = redux.armies.troopsByArmy[armyID];

  let lowestSpeed = troops?.reduce<number>((lowestSpeed, troop) => {
    const def = redux.gameDefs.troops[troop.def_id];
    if (lowestSpeed === 0) {
      return def.move;
    } else {
      return Math.min(lowestSpeed, def.move);
    }
  }, 0);

  return lowestSpeed ?? 0;
}

export function getTroopTotalWages(troop: TroopData): number {
  const redux = store.getState();
  const def = redux.gameDefs.troops[troop.def_id];

  return troop.count * def.wage;
}

export function getArmyTotalWages(armyID: number): number {
  const redux = store.getState();
  const troops = redux.armies.troopsByArmy[armyID];

  let wages: number = 0;
  troops?.forEach((troop) => {
    wages += getTroopTotalWages(troop);
  });

  return wages;
}

export function getMaintenanceStatusForArmy(armyId: number): MaintenanceStatus {
  const redux = store.getState();
  const army = redux.armies.armies[armyId];

  const thisMonth = getFirstOfThisMonthDateString();

  if (army.maintenance_date === thisMonth) {
    return MaintenanceStatus.Paid;
  } else {
    return MaintenanceStatus.Unpaid;
  }
}
