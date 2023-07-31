import store from "../redux/store";
import { CharacterData, CharacterEquipmentSlots, SpellDefData } from "../serverAPI";
import { AllClasses } from "../staticData/characterClasses/AllClasses";
import { CharacterStat, SpellType } from "../staticData/types/characterClasses";
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
    maxHP += (character.level - 9) * characterClass.hpStep;
  }

  return maxHP;
}

export function getCharacterStat(character: CharacterData, stat: CharacterStat): number {
  switch (stat) {
    case CharacterStat.Strength:
      return character.strength;
    case CharacterStat.Intelligence:
      return character.intelligence;
    case CharacterStat.Wisdom:
      return character.wisdom;
    case CharacterStat.Dexterity:
      return character.dexterity;
    case CharacterStat.Constitution:
      return character.constitution;
    case CharacterStat.Charisma:
      return character.charisma;
  }
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

export function getCharacterPreparableSpells(
  characterId: number,
  spellTypes: SpellType[],
  spellLevel: number
): SpellDefData[] {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return [];
  }

  const preparableSpells: SpellDefData[] = [];

  // A spell is preparable if it is in a spellbook owned/carried by the character.
  // So first, find any spellbooks!
  const itemIds = getAllCharacterAssociatedItemIds(characterId);
  itemIds.forEach((itemId) => {
    // Is this a spellbook?
    redux.spellbooks.books[itemId]?.forEach((spellbookEntry) => {
      const spellDef = redux.gameDefs.spells[spellbookEntry.spell_id];
      // Does this spell match one of the approved types and level?
      for (let i = 0; i < spellTypes.length; ++i) {
        const approvedSpellType = spellTypes[i];

        if (spellDef.type_levels[approvedSpellType] === spellLevel && !preparableSpells.includes(spellDef)) {
          preparableSpells.push(spellDef);
        }
      }
    });
  });

  return preparableSpells;
}
