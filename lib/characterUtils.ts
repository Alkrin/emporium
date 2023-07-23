import store from "../redux/store";
import { CharacterData, CharacterEquipmentSlots } from "../serverAPI";
import { AllClasses } from "../staticData/characterClasses/AllClasses";
import { Stones } from "./itemUtils";

export type StatBonus = 3 | 2 | 1 | 0 | -1 | -2 | -3;
export function getBonusForStat(value: number): StatBonus {
  if (value <= 3) return -3;
  if (value <= 5) return -2;
  if (value <= 8) return -1;
  if (value <= 12) return 0;
  if (value <= 15) return 1;
  if (value <= 17) return 2;
  if (value <= 18) return 3;

  return 0;
}

export function getCharacterMaxHP(character: CharacterData): number {
  const characterClass = AllClasses[character.class_name];
  let maxHP = 0;
  // Only count hitdice up to the character's current level.  That way we can still have records
  // of previous values if the player gets de-leveled by a vampire or something.
  for (let i = 0; i < character.level; ++i) {
    maxHP += character.hit_dice[i] ?? 0;
  }

  // Add Con bonus for all levels up to 9.
  const conBonus = getBonusForStat(character.constitution);
  maxHP += Math.min(character.level, 9) * conBonus;

  // Add hp step bonus for all levels 10+.
  if (character.level > 9) {
    maxHP = (character.level - 9) * characterClass.hpStep;
  }

  return maxHP;
}

export function getCharacterMaxEncumbrance(character: CharacterData): Stones {
  return [20 + getBonusForStat(character.strength), 0];
}

export function getAllCharacterAssociatedItemIds(characterId: number): number[] {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return [];
  }

  const finalItemIds: number[] = [];

  // Root items.
  // All equipped items.
  CharacterEquipmentSlots.forEach((slotId) => {
    if (character[slotId]) {
      finalItemIds.push(character[slotId]);
    }
  });
  // All items in storages owned by the character.
  Object.values(redux.items.allItems).forEach((item) => {
    if (item.storage_id && redux.storages.allStorages[item.storage_id]?.owner_id === characterId) {
      finalItemIds.push(item.id);
    }
  });

  // Contained items.
  // Bread First Search to find all nested items.
  let activeItemIds: number[] = [...finalItemIds];
  while (activeItemIds.length > 0) {
    // Find all items contained inside the active items.
    const containedItems = Object.values(redux.items.allItems).filter((item) => {
      return activeItemIds.includes(item.container_id);
    });
    // Save this layer of items and dig down to the next.
    activeItemIds = containedItems.map((i) => {
      return i.id;
    });
    finalItemIds.push(...activeItemIds);
  }

  return finalItemIds;
}
