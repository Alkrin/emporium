import store from "../redux/store";
import { CharacterData, CharacterEquipmentSlots, ItemData, ItemDefData } from "../serverAPI";
import { addCommasToNumber } from "./characterUtils";
import { Dictionary } from "./dictionary";
import { EquipmentSlotTag, WeaponCategoryTag, WeaponTypeTag } from "./tags";

const kAccuracy = 10000;

/** Values: 1gp or less, 2-10gp, 11-100gp, 101-1000gp, 1001-10000gp, 10000+gp */
export const ItemAvailabilityByMarketClass: Record<number, number[]> = {
  0: [2750, 300, 20, 7, 2, 0.25],
  1: [2750, 300, 20, 7, 2, 0.25],
  2: [700, 70, 5, 2, 1, 0.1],
  3: [425, 35, 2, 1, 0.25, 0.03],
  4: [100, 10, 1, 0.25, 0.1, 0.01],
  5: [35, 3, 0.25, 0.1, 0.05, 0],
  6: [15, 1, 0.1, 0.05, 0.01, 0, 0],
};

export function getItemAvailabilityText(marketClass: number, priceIndex: number): string {
  const value = ItemAvailabilityByMarketClass[marketClass][priceIndex];
  if (value <= 0) {
    return "---";
  } else if (value < 1) {
    return `${value * 100}%`;
  } else {
    return addCommasToNumber(value);
  }
}

export type Stones = [number, number];
// Converts a Stones value to an easily comparable number.
export function StonesToSixths(s: Stones): number {
  return s[0] * 6 + s[1];
}
export function StonesAPlusB(a: Stones, b: Stones): Stones {
  const raw = StonesToSixths(a) + StonesToSixths(b);
  const sixths = raw % 6;
  const stones = (raw - sixths) / 6; // Should always be an integer.
  return [stones, sixths];
}
export function StonesAMinusB(a: Stones, b: Stones): Stones {
  const raw = StonesToSixths(a) - StonesToSixths(b);
  const sixths = raw % 6;
  const stones = (raw - sixths) / 6; // Should always be an integer.
  return [stones, sixths];
}

export function getBundleWeight(def: ItemDefData, count: number): Stones {
  if (def.number_per_stone > 0) {
    // Weights not in stones/sixths may have rounding errors during calculation, so we temporarily inflate the count
    // in order to make sure the rounding errors occur in digits that we can safely ignore.
    const rawStones = Math.floor((count * kAccuracy) / def.number_per_stone);
    const justStones = Math.floor(rawStones / kAccuracy);
    const justSixths = Math.ceil(((rawStones - justStones * kAccuracy) * 6) / kAccuracy);
    return [justStones, justSixths];
  } else {
    let stones: Stones = [def.stones * count, def.sixth_stones * count];
    // Adding [0,0] will convert excessive sixths to stones for us.
    stones = StonesAPlusB(stones, [0, 0]);
    return stones;
  }
}

export function getItemTotalWeight(
  itemId: number,
  allItems: Dictionary<ItemData>,
  allItemDefs: Dictionary<ItemDefData>,
  itemIdsToIgnore: number[]
): Stones {
  let stones: Stones = [0, 0];

  // If this item is to be ignored, return zero now!
  if (itemIdsToIgnore.includes(itemId)) {
    return [0, 0];
  }

  const item = allItems[itemId];
  const def = allItemDefs[item?.def_id];
  if (def && item) {
    // Add the item's own weight.
    const bundleWeight = getBundleWeight(def, item.count);
    stones = StonesAPlusB(stones, bundleWeight);

    // If this is a container (and not something like a bag of holding), add the weight of contained items.
    if ((def.storage_stones > 0 || def.storage_sixth_stones > 0) && !def.fixed_weight) {
      const containedStones = getItemContainedWeight(itemId, allItems, allItemDefs, itemIdsToIgnore);
      stones = StonesAPlusB(stones, containedStones);
    }
  }

  return stones;
}

export function getItemContainedWeight(
  containerId: number,
  allItems: Dictionary<ItemData>,
  allItemDefs: Dictionary<ItemDefData>,
  itemIdsToIgnore: number[]
): Stones {
  let stones: Stones = [0, 0];

  const containedItems = Object.values(allItems).filter((item) => {
    return item.container_id === containerId;
  });

  containedItems.forEach((contained) => {
    const itemStones = getItemTotalWeight(contained.id, allItems, allItemDefs, itemIdsToIgnore);
    stones = StonesAPlusB(stones, itemStones);
  });

  return stones;
}

export function isContainerAInContainerB(
  containerIdA: number,
  containerIdB: number,
  allItems: Dictionary<ItemData>
): boolean {
  const containerB = allItems[containerIdB];
  // If B doesn't exist, there's nothing in it.
  if (!containerB) return false;

  const itemIdsInContainerB = Object.values(allItems)
    .filter((item) => {
      return item.container_id === containerIdB;
    })
    .map((item) => {
      return item.id;
    });
  // If there's NOTHING in B, then obviously A isn't in it.
  if (itemIdsInContainerB.length === 0) return false;

  let isInside: boolean = false;
  itemIdsInContainerB.forEach((itemId) => {
    if (!isInside) {
      // Is this item A?
      isInside = itemId === containerIdA;
      if (!isInside) {
        // If this isn't item A, does it contain item A?
        isInside = isContainerAInContainerB(containerIdA, itemId, allItems);
      }
    }
  });

  return isInside;
}

export function getAvailableRoomForContainer(
  containerId: number,
  allItems: Dictionary<ItemData>,
  allItemDefs: Dictionary<ItemDefData>,
  itemIdsToIgnore: number[]
): Stones {
  const container = allItems[containerId];
  const containerDef = allItemDefs[container?.def_id];
  if (containerDef) {
    // Start by seeing how much room is left in this container.
    const containedWeight = getItemContainedWeight(containerId, allItems, allItemDefs, itemIdsToIgnore);
    const maxWeight: Stones = [containerDef.storage_stones, containerDef.storage_sixth_stones];
    let room: Stones = StonesAMinusB(maxWeight, containedWeight);

    // If this is inside another container, get that container's available room.
    if (container.container_id > 0) {
      const parentRoom = getAvailableRoomForContainer(container.container_id, allItems, allItemDefs, itemIdsToIgnore);
      if (StonesToSixths(parentRoom) < StonesToSixths(room)) {
        room = parentRoom;
      }
    }
    return room;
  } else {
    return [0, 0];
  }
}

export function getItemNameText(item?: ItemData, def?: ItemDefData): string {
  // Show a count for ChargedItems and anything with more than one item in it.
  if (def && item) {
    if (def.has_charges) {
      return `${def.name}, ${item.count} charge${item.count > 1 ? "s" : ""}`;
    } else if (item.count > 1) {
      return `${def.name} x${item.count}`;
    }
  }
  return def?.name ?? "";
}

export function getMaxBundleItemsForRoom(def: ItemDefData, room: Stones): number {
  const [stones, sixthStones] = room;
  const rawStones = stones + sixthStones / 6;
  const singleWeight = def.number_per_stone > 0 ? 1 / def.number_per_stone : def.stones + def.sixth_stones / 6;

  const guessBundleSize = Math.round(rawStones / singleWeight);
  // Even accounting for floating point errors, the calculated result should be within one of the actual value.
  // For efficiency, we'll start at the biggest guess and move backward until we find a good one.
  if (StonesToSixths(getBundleWeight(def, guessBundleSize + 1)) <= StonesToSixths(room)) {
    return guessBundleSize + 1;
  }
  if (StonesToSixths(getBundleWeight(def, guessBundleSize)) <= StonesToSixths(room)) {
    return guessBundleSize;
  }
  if (StonesToSixths(getBundleWeight(def, guessBundleSize - 1)) <= StonesToSixths(room)) {
    return guessBundleSize - 1;
  }

  return 0;
}

export function getTotalEquippedWeight(
  character: CharacterData,
  allItems: Dictionary<ItemData>,
  allItemDefs: Dictionary<ItemDefData>
): Stones {
  let weight: Stones = [0, 0];

  CharacterEquipmentSlots.forEach((key) => {
    const itemId = character[key];
    const itemWeight = getItemTotalWeight(itemId, allItems, allItemDefs, []);
    weight = StonesAPlusB(weight, itemWeight);
  });

  return weight;
}

export function doesItemGrantMagicDamageBonus(itemId: number): boolean {
  const redux = store.getState();
  const item = redux.items.allItems[itemId];
  const def = redux.gameDefs.items[item.def_id];

  // Magic weapons that use ammo only provide a to-hit bonus.
  if (def.tags.includes(EquipmentSlotTag.Ranged)) {
    if (def.tags.includes(WeaponCategoryTag.BowCrossbow) || def.tags.includes(WeaponTypeTag.Sling)) {
      return false;
    }
  }

  return true;
}

export function canItemsBeStacked(a: ItemData, b: ItemData, allItemDefs: Dictionary<ItemDefData>): boolean {
  // Must have same def.
  if (a.def_id !== b.def_id) {
    return false;
  }

  // Charged items never stack because their charge count uses the `count` field on ItemData.
  if (allItemDefs[a.def_id]?.has_charges || allItemDefs[b.def_id]?.has_charges) {
    return false;
  }

  // Must have same associated spells. e.g. can't stack Potions of Flight and Invisibility together.
  if (a.spell_ids.length !== b.spell_ids.length || !!a.spell_ids.find((asid) => !b.spell_ids.includes(asid))) {
    return false;
  }

  return true;
}
