import { CharacterData } from "../serverAPI";
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
