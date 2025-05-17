import store from "../redux/store";
import {
  CharacterData,
  CharacterEquipmentData,
  CharacterEquipmentSlots,
  ItemData,
  ItemDefData,
  SpellDefData,
  StorageData,
} from "../serverAPI";
import { AllClasses } from "../staticData/characterClasses/AllClasses";
import { AntiPaladinAuraOfProtection } from "../staticData/classFeatures/AntiPaladinAuraOfProtection";
import { BladeDancerMobility } from "../staticData/classFeatures/BladeDancerDefensiveMobility";
import { PaladinAuraOfProtection } from "../staticData/classFeatures/PaladinAuraOfProtection";
import { SharedAnimalReflexes } from "../staticData/classFeatures/SharedAnimalReflexes";
import { SharedMeleeDamageBonus } from "../staticData/classFeatures/SharedMeleeDamageBonus";
import { SharedRangedDamageBonus } from "../staticData/classFeatures/SharedRangedDamageBonus";
import { SharedRangedAccuracyBonus } from "../staticData/classFeatures/SharedRangedAccuracyBonus";
import { ProficiencyArmorTraining } from "../staticData/proficiencies/ProficiencyArmorTraining";
import { ProficiencyDivineBlessing } from "../staticData/proficiencies/ProficiencyDivineBlessing";
import { ProficiencyFightingStyle } from "../staticData/proficiencies/ProficiencyFightingStyle";
import { ProficiencyMartialTraining } from "../staticData/proficiencies/ProficiencyMartialTraining";
import { ProficiencySwashbuckling } from "../staticData/proficiencies/ProficiencySwashbuckling";
import { ProficiencyWeaponFinesse } from "../staticData/proficiencies/ProficiencyWeaponFinesse";
import {
  AbilityInstancev2,
  GeneralProficienciesAt,
  ProficiencySource,
} from "../staticData/types/abilitiesAndProficiencies";
import {
  WeaponStyle,
  CharacterStat,
  SpellType,
  DieRoll,
  AttackRanges,
  NaturalWeapon,
} from "../staticData/types/characterClasses";
import { WeaponCategory, WeaponType } from "../staticData/types/items";
import { Dictionary } from "./dictionary";
import { Stones, StonesToSixths, getTotalEquippedWeight } from "./itemUtils";
import { EquipmentSlotTag, Tag } from "./tags";
import { DwarvenFuryFleshRunes } from "../staticData/classFeatures/DwarvenFuryFleshRunes";
import { SharedMeleeAccuracyBonus } from "../staticData/classFeatures/SharedMeleeAccuracyBonus";
import { MysticMeditativeFocus } from "../staticData/classFeatures/MysticMeditativeFocus";
import { MysticSpeedOfThought } from "../staticData/classFeatures/MysticSpeedOfThought";
import { MysticGracefulFightingStyle } from "../staticData/classFeatures/MysticGracefulFightingStyle";
import { WildHarvesterNaturalTactics } from "../staticData/classFeatures/WildHarvesterNaturalTactics";
import { BattlegoatGatecrasherRuneCarvedHorns } from "../staticData/classFeatures/BattlegoatGatecrasherRuneCarvedHorns";
import { BattlegoatGatecrasherSteelWool } from "../staticData/classFeatures/BattlegoatGatecrasherSteelWool";
import { ProficiencyLeadership } from "../staticData/proficiencies/ProficiencyLeadership";
import { ProficiencyMysticAura } from "../staticData/proficiencies/ProficiencyMysticAura";
import { MysticCommandOfVoice } from "../staticData/classFeatures/MysticCommandOfVoice";
import { ProficiencySeduction } from "../staticData/proficiencies/ProficiencySeduction";
import { ProficiencyLayOnHands } from "../staticData/proficiencies/ProficiencyLayOnHands";
import { ProficiencyFamiliar } from "../staticData/proficiencies/ProficiencyFamiliar";
import { InjuryBlind } from "../staticData/injuries/InjuryBlind";
import { buildAbilityName, getFirstOfThisMonthDateString } from "./stringUtils";
import { getAllStorageAssociatedItemIds } from "./storageUtils";
import { SharedNaturalAttackPower } from "../staticData/classFeatures/SharedNaturalAttackPower";
import { SharedChitinousCarapace } from "../staticData/classFeatures/SharedChitinousCarapace";
import { ProficiencyRunning } from "../staticData/proficiencies/ProficiencyRunning";
import { TrueTurtleRunicScutes } from "../staticData/classFeatures/TrueTurtleRunicScutes";
import { SharedLoadbearing } from "../staticData/classFeatures/SharedLoadbearing";
import {
  AbilityComponentCharacterStatOverride,
  AbilityComponentCharacterStatOverrideData,
} from "../staticData/abilityComponents/AbilityComponentCharacterStatOverride";
import {
  AbilityComponentCharacterStatBonus,
  AbilityComponentCharacterStatBonusData,
} from "../staticData/abilityComponents/AbilityComponentCharacterStatBonus";
import {
  AbilityComponentLanguageCapability,
  AbilityComponentLanguageCapabilityData,
} from "../staticData/abilityComponents/AbilityComponentLanguageCapability";
import {
  AbilityComponentLanguageCapacityBonus,
  AbilityComponentLanguageCapacityBonusData,
} from "../staticData/abilityComponents/AbilityComponentLanguageCapacityBonus";
import {
  AbilityComponentHenchmanCapacityBonus,
  AbilityComponentHenchmanCapacityBonusData,
} from "../staticData/abilityComponents/AbilityComponentHenchmanCapacityBonus";

export interface ValueSource {
  name: string;
  value: number;
}

export interface ConditionalValueSource extends ValueSource {
  condition: string;
}

export function getAbilityComponentInstanceSourceName(instance: AbilityComponentInstance): string {
  const redux = store.getState();
  const ability = redux.gameDefs.abilities[instance.abilityId];

  if (ability) {
    return buildAbilityName(ability.name, instance.subtype, instance.rank, ability.max_ranks);
  } else {
    // TODO: How to handle non-ability sources?
    return `Unknown`;
  }
}

export type StatBonus = 3 | 2 | 1 | 0 | -1 | -2 | -3;
export function getStatBonusForValue(value: number): StatBonus {
  if (value <= 3) return -3;
  if (value <= 5) return -2;
  if (value <= 8) return -1;
  if (value <= 12) return 0;
  if (value <= 15) return 1;
  if (value <= 17) return 2;
  if (value <= 18) return 3;

  return 0;
}

export function getBonusString(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

export function getCharacterXPMultiplier(character: CharacterData): number {
  let smallestPrimaryStat = 18;
  const characterClass = AllClasses[character.class_name];
  characterClass.primeRequisites.forEach((pr) => {
    const prValue = getCharacterStat(character, pr);
    smallestPrimaryStat = Math.min(smallestPrimaryStat, prValue);
  });
  const bonus = getStatBonusForValue(smallestPrimaryStat);
  switch (bonus) {
    case 1:
      return 1.05;
    case 2:
    case 3:
      return 1.1;
    default:
      return 1;
  }
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
  const conBonus = getStatBonusForValue(character.constitution);
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
    case CharacterStat.Will:
      return character.wisdom;
    case CharacterStat.Dexterity:
      return character.dexterity;
    case CharacterStat.Constitution:
      return character.constitution;
    case CharacterStat.Charisma:
      return character.charisma;
  }
}

export interface CharacterStatData {
  baseValue: number;
  baseValueSources: ValueSource[];
  bonusValue: number;
  bonusValueSources: ValueSource[];
}

export function getCharacterStatv2(
  character: CharacterData,
  stat: CharacterStat,
  activeComponents: Record<string, AbilityComponentInstance[]>,
  outCharacterStatData?: CharacterStatData
): number {
  let statValue = 0;
  switch (stat) {
    case CharacterStat.Strength: {
      statValue = character.strength;
      break;
    }
    case CharacterStat.Intelligence: {
      statValue = character.intelligence;
      break;
    }
    case CharacterStat.Will: {
      statValue = character.wisdom;
      break;
    }
    case CharacterStat.Dexterity: {
      statValue = character.dexterity;
      break;
    }
    case CharacterStat.Constitution: {
      statValue = character.constitution;
      break;
    }
    case CharacterStat.Charisma: {
      statValue = character.charisma;
      break;
    }
  }
  if (outCharacterStatData) {
    outCharacterStatData.baseValue = statValue;
    outCharacterStatData.baseValueSources.push({ name: `Base ${stat}`, value: statValue });
  }

  // Apply stat value overrides (e.g. Ogre/Giant Strength)
  const overrides = (activeComponents[AbilityComponentCharacterStatOverride.id] ?? []).filter((instance) => {
    const instanceData = instance.data as AbilityComponentCharacterStatOverrideData;
    return instanceData.stat === stat;
  });
  if (overrides.length > 0) {
    // Only the highest override applies.  So if you have e.g. Ogre AND Giant strength, you get to be a Giant.
    const bestOverride = overrides.reduce(
      (bestSoFar: AbilityComponentInstance | null, instance: AbilityComponentInstance) => {
        const instanceData = instance.data as AbilityComponentCharacterStatOverrideData;
        if (bestSoFar) {
          const bestSoFarData = bestSoFar.data as AbilityComponentCharacterStatOverrideData;
          return bestSoFarData.value > instanceData.value ? bestSoFar : instance;
        } else {
          return instance;
        }
      },
      null
    );
    if (outCharacterStatData && bestOverride) {
      const overrideData = bestOverride.data as AbilityComponentCharacterStatOverrideData;
      statValue = overrideData.value;
      outCharacterStatData.baseValue = statValue;
      outCharacterStatData.baseValueSources.push({
        name: getAbilityComponentInstanceSourceName(bestOverride),
        value: statValue,
      });
    }
  }

  // Apply stat value bonuses/penalties (e.g. injuries, curses, etc.)
  const bonuses = (activeComponents[AbilityComponentCharacterStatBonus.id] ?? []).filter((instance) => {
    const instanceData = instance.data as AbilityComponentCharacterStatBonusData;
    return instanceData.stat === stat;
  });
  bonuses.forEach((instance: AbilityComponentInstance) => {
    const instanceData = instance.data as AbilityComponentCharacterStatBonusData;
    statValue += instanceData.bonus;

    if (outCharacterStatData) {
      outCharacterStatData.bonusValue += instanceData.bonus;
      outCharacterStatData.bonusValueSources.push({
        name: getAbilityComponentInstanceSourceName(instance),
        value: instanceData.bonus,
      });
    }
  });

  return statValue;
}

export function getCharacterMaxEncumbrance(character: CharacterData): Stones {
  // LoadBearing alters the weight for each encumbrance level.
  const encumbranceReduction = 2 * getProficiencyRankForCharacter(character.id, SharedLoadbearing.id);
  return [20 + getStatBonusForValue(character.strength) + encumbranceReduction, 0];
}

export function getAllCharacterAssociatedItemIds(characterId: number, excludeStorages?: boolean): number[] {
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

  // Contained items (e.g. arrows in your equipped quiver).
  // Breadth First Search to find all nested items.
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

  if (!excludeStorages) {
    // All items in storages owned by the character.
    redux.storages.storagesByCharacterId[characterId]?.forEach((storage) => {
      const containedItemIds = getAllStorageAssociatedItemIds(storage.id);
      finalItemIds.push(...containedItemIds);
    });
  }

  return finalItemIds;
}

export function whereIsItemEquipped(character: CharacterData, itemId: number): keyof CharacterEquipmentData | null {
  let result: keyof CharacterEquipmentData | null = null;
  if (character) {
    CharacterEquipmentSlots.forEach((slotId) => {
      if (character[slotId] === itemId) {
        result = slotId;
      }
    });
  }
  return result;
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

export function getMaxBaseArmorForCharacter(characterId: number): number {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return 0;
  } else {
    const characterClass = AllClasses[character.class_name];
    let maxBaseArmor = characterClass.maxBaseArmor;
    // Armor Training proficiency?
    if (getProficiencyRankForCharacter(characterId, ProficiencyArmorTraining.id)) {
      maxBaseArmor += 2;
    }
    return maxBaseArmor;
  }
}

export function canCharacterEquipShields(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return false;
  } else {
    const characterClass = AllClasses[character.class_name];
    return characterClass.weaponStyles.includes(WeaponStyle.OneHandAndShield);
  }
}

export function canCharacterDualWield(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return false;
  } else {
    const characterClass = AllClasses[character.class_name];
    return characterClass.weaponStyles.includes(WeaponStyle.DualWield);
  }
}

export function isCharacterWielding2hWeapon(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return false;
  } else {
    const weapon1 = redux.items.allItems[character.slot_melee1];
    const weapon2 = redux.items.allItems[character.slot_melee2];

    // If a weapon doesn't have a 1h damage_die, then it is 2h-only.
    if (weapon1) {
      const weaponDef = redux.gameDefs.items[weapon1.def_id];
      if (weaponDef.damage_die === 0) {
        return true;
      }
    }
    if (weapon2) {
      const weaponDef = redux.gameDefs.items[weapon2.def_id];
      if (weaponDef.damage_die === 0) {
        return true;
      }
    }

    return false;
  }
}

export function isCharacterDualWielding(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return false;
  } else {
    return character.slot_melee1 > 0 && character.slot_melee2 > 0;
  }
}

export function canCharacterEquipWeapon(characterId: number, itemId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const item = redux.items.allItems[itemId];
  const itemDef = redux.gameDefs.items[item.def_id];
  if (!itemDef) {
    // Can't equip if there is no item.
    return false;
  } else {
    if (!character) {
      // Can't equip if there is no one to equip it.
      return false;
    } else {
      const characterClass = AllClasses[character.class_name];
      const weaponCategory = itemDef.tags
        .find((tag) => {
          return tag.startsWith("WeaponCategory");
        })
        ?.slice(14) as WeaponCategory;
      const weaponType = itemDef.tags
        .find((tag) => {
          return tag.startsWith("WeaponType");
        })
        ?.slice(10) as WeaponType;

      // Supported weapon category?
      if (
        // If no weapon category, this is an improvised weapon, which anyone can use.
        weaponCategory &&
        (characterClass.weaponCategoryPermissions?.length ?? 0) > 0 &&
        // If the character class doesn't support this weapon category, only proficiencies can save it.
        !characterClass.weaponCategoryPermissions?.includes(weaponCategory) &&
        // So... do we have the proficiency that lets you use this even when your class says no?
        !getProficiencyRankForCharacter(characterId, ProficiencyMartialTraining.id, weaponType ?? "None")
      ) {
        // Looks like this is not an improvised weapon, the character class forbids it, and the character
        // didn't get special training.  So nope!  Can't use it.
        return false;
      }

      // Supported weapon type?
      if (
        // If no weapon type, this is an improvised weapon, which anyone can use.
        weaponType &&
        (characterClass.weaponTypePermissions?.length ?? 0) > 0 &&
        // If the character class doesn't support this weapon type, only proficiencies can save it.
        !characterClass.weaponTypePermissions?.includes(weaponType) &&
        // So... do we have the proficiency that lets you use this even when your class says no?
        !getProficiencyRankForCharacter(characterId, ProficiencyMartialTraining.id, weaponType ?? "None")
      ) {
        // Looks like this is not an improvised weapon, the character class forbids it, and the character
        // didn't get special training.  So nope!  Can't use it.
        return false;
      }

      // Supported weapon style?
      // If this is a 2h-only weapon, the player must be able to equip 2h weapons.
      // In all other cases, it can be wielded one handed... which all classes support.
      if (itemDef.damage_die === 0 && !characterClass.weaponStyles.includes(WeaponStyle.TwoHanded)) {
        return false;
      }

      // That should be all of the limitations.  If you made it here, they could theoretically wield the weapon.
      return true;
    }
  }
}

export function getProficiencyRankForCharacter(
  characterId: number,
  proficiencyId: string,
  subtype?: string,
  levelOverride?: number
): number {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  let ranks = 0;

  if (!character) {
    return ranks;
  } else {
    const characterClass = AllClasses[character.class_name];
    const characterLevel = levelOverride ?? character.level;

    // Is this an unlocked class feature?
    const feature = characterClass.classFeatures.forEach((abilityInstance) => {
      const isSameBaseAbility = abilityInstance.def.id === proficiencyId;
      const isMatchingSubtype = !subtype || abilityInstance.subtype === subtype;
      const meetsMinimumLevel = characterLevel >= abilityInstance.minLevel;
      if (isSameBaseAbility && isMatchingSubtype && meetsMinimumLevel) {
        ranks += abilityInstance.rank;
      }
    });

    // Is this an assigned, unlocked proficiency?
    const proficiencies = redux.proficiencies.proficienciesByCharacterId[characterId];
    proficiencies
      ?.filter((p) => {
        const isSameBaseAbility = p.feature_id === proficiencyId;
        const isMatchingSubtype = !subtype || p.subtype === subtype;
        return isSameBaseAbility && isMatchingSubtype;
      })
      .forEach((pdata) => {
        const minLevelForSource: Dictionary<number> = {
          [ProficiencySource.Selectable1]: 1,
          [ProficiencySource.Selectable2]: 1,
          [ProficiencySource.Selectable3]: 1,
          [ProficiencySource.Selectable4]: 1,
          [ProficiencySource.Extra]: 1,
          [ProficiencySource.Extra1]: 1,
          [ProficiencySource.Extra2]: 1,
          [ProficiencySource.Extra3]: 1,
          [ProficiencySource.Extra4]: 1,
          [ProficiencySource.IntBonus1]: 1,
          [ProficiencySource.IntBonus2]: 1,
          [ProficiencySource.IntBonus3]: 1,
          [ProficiencySource.General1]: GeneralProficienciesAt[0] ?? 99,
          [ProficiencySource.General2]: GeneralProficienciesAt[1] ?? 99,
          [ProficiencySource.General3]: GeneralProficienciesAt[2] ?? 99,
          [ProficiencySource.General4]: GeneralProficienciesAt[3] ?? 99,
          [ProficiencySource.Class1]: characterClass.classProficienciesAt[0] ?? 99,
          [ProficiencySource.Class2]: characterClass.classProficienciesAt[1] ?? 99,
          [ProficiencySource.Class3]: characterClass.classProficienciesAt[2] ?? 99,
          [ProficiencySource.Class4]: characterClass.classProficienciesAt[3] ?? 99,
          [ProficiencySource.Class5]: characterClass.classProficienciesAt[4] ?? 99,
          [ProficiencySource.Injury]: 1,
        };

        if (characterLevel >= minLevelForSource[pdata.source]) {
          ranks += 1;
        }
      });

    return ranks;
  }
}

export interface BonusCalculations {
  bonus: number;
  // We use arrays to preserve ordering.
  sources: ValueSource[];
  conditionalSources: ConditionalValueSource[];
}

export function getInitiativeBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.bonus = getStatBonusForValue(character.dexterity);
    calc.sources.push({ name: "Dex Bonus", value: calc.bonus });

    // Is the character wielding a weapon with an initiative penalty tag?  (e.g. Great Axe)
    if (getWeaponTagsForCharacter(characterId).includes(Tag.InitiativeMinusOne)) {
      calc.sources.push({ name: "Slow Weapon", value: -1 });
      calc.bonus -= 1;
    }

    // Is the character wielding a spear/polearm with the matching proficiency?
    if (getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Pole Weapon")) {
      const weapon1 = redux.items.allItems[character.slot_melee1];
      const weapon2 = redux.items.allItems[character.slot_melee2];
      const def1 = redux.gameDefs.items[weapon1?.def_id];
      const def2 = redux.gameDefs.items[weapon2?.def_id];
      if (def1?.tags.includes(WeaponCategory.SpearPoleArm) || def2?.tags.includes(WeaponCategory.SpearPoleArm)) {
        calc.sources.push({ name: "Fighting Style: Pole Weapon", value: 1 });
        calc.bonus += 1;
      }
    }

    if (getProficiencyRankForCharacter(characterId, BladeDancerMobility.id)) {
      calc.sources.push({ name: "Blade Dancer Mobility", value: 1 });
      calc.bonus += 1;
    }

    if (getProficiencyRankForCharacter(characterId, SharedAnimalReflexes.id)) {
      calc.sources.push({ name: "Animal Reflexes", value: 1 });
      calc.bonus += 1;
    }

    if (getProficiencyRankForCharacter(characterId, MysticSpeedOfThought.id)) {
      calc.sources.push({ name: "Speed Of Thought", value: 1 });
      calc.bonus += 1;
    }

    if (getProficiencyRankForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push({
        name: "Is Meditative Focus active?",
        value: 1,
        condition: "Is Meditative Focus active?",
      });
    }

    return calc;
  }
}

export function getArmorBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.bonus = getStatBonusForValue(character.dexterity);
    calc.sources.push({ name: "Dex Bonus", value: calc.bonus });

    const equippedArmor = redux.gameDefs.items[redux.items.allItems[character?.slot_armor]?.def_id];
    if (equippedArmor) {
      const equippedArmorAC = (equippedArmor?.ac ?? 0) + (equippedArmor?.magic_bonus ?? 0);
      calc.bonus += equippedArmorAC;
      calc.sources.push({ name: equippedArmor.name, value: equippedArmorAC });
    }

    const equippedShield = redux.gameDefs.items[redux.items.allItems[character?.slot_shield]?.def_id];
    if (equippedShield) {
      const equippedShieldAC = (equippedShield?.ac ?? 0) + (equippedShield?.magic_bonus ?? 0);
      calc.bonus += equippedShieldAC;
      calc.sources.push({ name: equippedShield.name, value: equippedShieldAC });
    }

    // Proficiencies and abilities that grant armor.
    if (
      equippedShield &&
      getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Weapon and Shield")
    ) {
      calc.sources.push({ name: "Fighting Style (Weapon and Shield)", value: 1 });
      calc.bonus += 1;
    }

    if (getProficiencyRankForCharacter(characterId, BladeDancerMobility.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push({ name: "Blade Dancer, Mobility", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, WildHarvesterNaturalTactics.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push({ name: "Wild Harvester, Natural Tactics", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, MysticGracefulFightingStyle.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push({ name: "Mystic, Graceful Fighting Style", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, ProficiencySwashbuckling.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push({ name: "Swashbuckling", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, DwarvenFuryFleshRunes.id)) {
      let mBonus = 2;
      if (character.level >= 7) mBonus += 2;
      if (character.level >= 13) mBonus += 2;

      calc.sources.push({ name: "Dwarven Fury, Flesh Runes", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, BattlegoatGatecrasherRuneCarvedHorns.id)) {
      let mBonus = 2;
      if (character.level >= 7) mBonus += 2;
      if (character.level >= 13) mBonus += 2;

      calc.sources.push({ name: "Battlegoat Gatecrasher, Rune-carved Horns", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, TrueTurtleRunicScutes.id)) {
      let mBonus = 2;
      if (character.level >= 7) mBonus += 2;
      if (character.level >= 13) mBonus += 2;

      calc.sources.push({ name: "True Turtle, Runic Scutes", value: mBonus });
      calc.bonus += mBonus;
    }

    if (getProficiencyRankForCharacter(characterId, BattlegoatGatecrasherSteelWool.id)) {
      calc.sources.push({ name: "Battlegoat Gatecrasher, Steel Wool", value: 1 });
      calc.bonus += 1;
    }

    const chitinRank = getProficiencyRankForCharacter(characterId, SharedChitinousCarapace.id);
    if (chitinRank > 0) {
      calc.sources.push({ name: "Chitinous Carapace", value: chitinRank });
      calc.bonus += chitinRank;
    }

    if (getProficiencyRankForCharacter(characterId, AntiPaladinAuraOfProtection.id)) {
      calc.conditionalSources.push({ name: "Is target Good-aligned?", value: 1, condition: "Is target Good-aligned?" });
    }

    if (getProficiencyRankForCharacter(characterId, PaladinAuraOfProtection.id)) {
      calc.conditionalSources.push({ name: "Is target Evil-aligned?", value: 1, condition: "Is target Evil-aligned?" });
    }

    if (getProficiencyRankForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push({
        name: "Is Meditative Focus active?",
        value: 1,
        condition: "Is Meditative Focus active?",
      });
    }

    return calc;
  }
}

export function getSavingThrowBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    if (getProficiencyRankForCharacter(characterId, ProficiencyDivineBlessing.id)) {
      calc.sources.push({ name: "Divine Blessing", value: 2 });
      calc.bonus += 2;
    }

    if (getProficiencyRankForCharacter(characterId, AntiPaladinAuraOfProtection.id)) {
      calc.conditionalSources.push({ name: "Is target Good-aligned?", value: 1, condition: "Is target Good-aligned?" });
    }

    if (getProficiencyRankForCharacter(characterId, PaladinAuraOfProtection.id)) {
      calc.conditionalSources.push({ name: "Is target Evil-aligned?", value: 1, condition: "Is target Evil-aligned?" });
    }

    if (getProficiencyRankForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push({
        name: "Is Meditative Focus active?",
        value: 1,
        condition: "Is Meditative Focus active?",
      });
    }

    if (getProficiencyRankForCharacter(characterId, ProficiencyFamiliar.id)) {
      calc.conditionalSources.push({
        name: "Is Familiar nearby?",
        value: 1,
        condition: "Is Familiar nearby?",
      });
    }

    return calc;
  }
}

export function getWeaponTagsForCharacter(characterId: number): Tag[] {
  const tags: Tag[] = [];

  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (character) {
    const weapon1 = redux.items.allItems[character.slot_melee1];
    const weapon2 = redux.items.allItems[character.slot_melee2];
    const ranged = redux.items.allItems[character.slot_ranged];

    if (weapon1) {
      const def = redux.gameDefs.items[weapon1.def_id];
      def?.tags.forEach((t) => {
        tags.push(t as Tag);
      });
    }

    if (weapon2) {
      const def = redux.gameDefs.items[weapon2.def_id];
      def?.tags.forEach((t) => {
        tags.push(t as Tag);
      });
    }

    if (ranged) {
      const def = redux.gameDefs.items[ranged.def_id];
      def?.tags.forEach((t) => {
        tags.push(t as Tag);
      });
    }
  }

  return tags;
}

export interface AttackData {
  name: string;
  damage: DieRoll;
  toHit: number;
  damageBonuses: [string, number][];
  conditionalDamageBonuses: [string, number][];
  hitBonuses: [string, number][];
  conditionalHitBonuses: [string, number][];
  ranges: AttackRanges;
}

export function getMeleeAttackDataForCharacter(characterId: number): AttackData[] {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  // What is equipped?
  const weapon1 = redux.items.allItems[character.slot_melee1];
  const weapon2 = redux.items.allItems[character.slot_melee2];

  // A character equipped with weaponry gets a single attack with it per round, though this
  // may be repeated via cleave attacks.
  const attacks: AttackData[] = [];

  // No weapons equipped.
  if (!weapon1 && !weapon2) {
    // If there are no melee natural attacks, we add the generic "unarmed strike".
    if (
      !characterClass.naturalWeapons?.find((nw) => {
        return !nw.range || nw.range.long === 0;
      })
    ) {
      attacks.push(generateMeleeAttack(characterId, []));
    }
  } else if (weapon1 && weapon2) {
    attacks.push(generateMeleeAttack(characterId, [weapon1, weapon2]));
  }
  // If one weapon equipped, show single attack data.
  else if (weapon1 || weapon2) {
    const weapon = weapon1 ?? weapon2;
    attacks.push(generateMeleeAttack(characterId, [weapon]));
  }

  // Add any melee Natural Attacks.
  characterClass.naturalWeapons?.forEach((naturalWeapon) => {
    if (!naturalWeapon.range || naturalWeapon.range.long === 0) {
      attacks.push(generateMeleeAttack(characterId, [], naturalWeapon));
    }
  });

  return attacks;
}

export function getRangedAttackDataForCharacter(characterId: number): AttackData[] {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];

  const attacks: AttackData[] = [];

  // What is equipped?
  const rangedWeapon = redux.items.allItems[character.slot_ranged];
  const rangedNaturalAttacks =
    characterClass.naturalWeapons?.filter((nw) => {
      return (nw.range?.long ?? 0) > 0;
    }) ?? [];
  if (rangedWeapon) {
    // Weapon attack.
    attacks.push(generateRangedAttack(characterId, rangedWeapon));
  } else if (rangedNaturalAttacks.length > 0) {
    // Natural attacks.
    rangedNaturalAttacks.forEach((rna) => {
      attacks.push(generateRangedAttack(characterId, rna));
    });
  } else {
    // Improvised projectiles only.
    attacks.push(generateRangedAttack(characterId));
  }

  return attacks;
}

function generateMeleeAttack(characterId: number, weapons: ItemData[], naturalWeapon?: NaturalWeapon): AttackData {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];

  const weapon1 = weapons.length > 0 ? weapons[0] : null;
  const weapon2 = weapons.length > 1 ? weapons[1] : null;
  const def1 = redux.gameDefs.items[weapon1?.def_id ?? 0];
  const def2 = redux.gameDefs.items[weapon2?.def_id ?? 0];

  const data: AttackData = {
    name: naturalWeapon?.name ?? "Unarmed Strike",
    damage: {
      dice: 1,
      die: 2,
      bonus: 0,
    },
    toHit: 0,
    ranges: { short: 0, medium: 0, long: 0 },
    damageBonuses: [],
    conditionalDamageBonuses: [],
    hitBonuses: [],
    conditionalHitBonuses: [],
  };

  if (naturalWeapon) {
    // Natural attacks.
    const progressionIndex = getProficiencyRankForCharacter(
      characterId,
      SharedNaturalAttackPower.id,
      naturalWeapon.name
    );
    data.damage = { ...naturalWeapon.damageProgression[progressionIndex] };
    // If the roll inherently includes a damage bonus, record it.
    if (data.damage.bonus) {
      data.damageBonuses.push(["Base Damage Bonus", data.damage.bonus]);
      // Temporarily zero this.  It will come back when we combine damageBonuses at the end.
      data.damage.bonus = 0;
    }
    // If the attack inherently includes a hit bonus, record it.
    if (naturalWeapon.hitBonus) {
      data.hitBonuses.push(["Base Hit Bonus", naturalWeapon.hitBonus]);
    }
  }

  // Stat bonuses.
  const strBonus = getStatBonusForValue(character.strength);
  const dexBonus = getStatBonusForValue(character.dexterity);

  // Str damage bonus always applies to melee attacks.
  if (strBonus) {
    data.damageBonuses.push(["Str Bonus", strBonus]);
  }
  // Str or Dex adds to hit.
  // If the character has Weapon Finesse and is wielding 1h weapon(s), they can use the greater of Dex and Str bonus.
  let isFinesse = false;
  if (getProficiencyRankForCharacter(characterId, ProficiencyWeaponFinesse.id)) {
    if ((def1 && def2) || def1?.damage_dice || def2?.damage_dice) {
      if (dexBonus > strBonus) {
        isFinesse = true;
        data.hitBonuses.push(["Dex Bonus (Weapon Finesse)", dexBonus]);
      }
    }
  }
  if (!isFinesse) {
    data.hitBonuses.push(["Str Bonus", strBonus]);
  }

  // Level-based hit bonus.
  const lbb = characterClass.toHitBonus[character.level - 1];
  if (lbb > 0) {
    data.hitBonuses.push(["Level Bonus", lbb]);
  }

  // Dual-wielding grants +1 to hit.
  if (def1 && def2) {
    data.hitBonuses.push(["Dual Wielding", 1]);

    // Fighting Style (Two Weapons) grants an extra +1 to hit.
    if (getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Two Weapons")) {
      data.hitBonuses.push(["Fighting Style (Two Weapons)", 1]);
    }
  }

  // Fighting Style (Single Weapon) grants +1 to hit.
  if (getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Single Weapon")) {
    if ((def1 && !def2) || (def2 && !def1)) {
      data.hitBonuses.push(["Fighting Style (Single Weapon)", 1]);
    }
  }

  if (getProficiencyRankForCharacter(characterId, SharedMeleeAccuracyBonus.id)) {
    data.hitBonuses.push(["Class Melee Accuracy Bonus", 1]);
  }

  if (getProficiencyRankForCharacter(characterId, InjuryBlind.id)) {
    data.hitBonuses.push(["Blind", -4]);
  }

  if (getProficiencyRankForCharacter(characterId, MysticMeditativeFocus.id)) {
    data.conditionalHitBonuses.push(["Is Meditative Focus active?", 1]);
  }

  // Class melee damage bonus.
  if (getProficiencyRankForCharacter(characterId, SharedMeleeDamageBonus.id)) {
    if (character.level >= 12) data.damageBonuses.push(["Class Melee Damage Bonus", 5]);
    else if (character.level >= 9) data.damageBonuses.push(["Class Melee Damage Bonus", 4]);
    else if (character.level >= 6) data.damageBonuses.push(["Class Melee Damage Bonus", 3]);
    else if (character.level >= 3) data.damageBonuses.push(["Class Melee Damage Bonus", 2]);
    else data.damageBonuses.push(["Class Melee Damage Bonus", 1]);
  }

  // If both weapons equipped, show dual wield data.
  if (def1 && def2) {
    const outputOne = def1.damage_dice * def1.damage_die + def1.magic_bonus;
    const outputTwo = def2.damage_dice * def2.damage_die + def2.magic_bonus;
    if (outputTwo > outputOne) {
      // Weapon two is better.
      data.damage.dice = def2.damage_dice;
      data.damage.die = def2.damage_die;
      if (def2.magic_bonus !== 0) {
        data.damageBonuses.push([def2.name, def2.magic_bonus]);
      }
    } else {
      // Weapon one is equal/better.
      data.damage.dice = def1.damage_dice;
      data.damage.die = def1.damage_die;
      if (def1.magic_bonus !== 0) {
        data.damageBonuses.push([def1.name, def1.magic_bonus]);
      }
    }
    data.name = `${def1.name} & ${def2.name}`;
  }
  // If one weapon equipped, show single attack data.
  else if (def1 || def2) {
    const def = def1 ?? def2;
    if (def.damage_dice_2h && character.slot_shield === 0) {
      data.damage.dice = def.damage_dice_2h;
      data.damage.die = def.damage_die_2h;
      // Fighting Style (Two-handed Weapon) gives +1 damage.
      if (getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Two-handed Weapon")) {
        if ((def1 && !def2) || (def2 && !def1)) {
          data.damageBonuses.push(["Fighting Style (Two-handed Weapon)", 1]);
        }
      }
    } else {
      data.damage.dice = def.damage_dice;
      data.damage.die = def.damage_die;
    }
    if (def.magic_bonus !== 0) {
      data.damageBonuses.push([def.name, def.magic_bonus]);
    }
    data.name = def.name;
  }

  // At the end, reduce the bonuses to a single number for convenience.
  data.damage.bonus = data.damageBonuses.reduce<number>((total, [source, value]) => total + value, data.damage.bonus);
  data.toHit = data.hitBonuses.reduce<number>((total, [source, value]) => total + value, data.toHit);

  return data;
}

function generateRangedAttack(characterId: number, weapon?: ItemData | NaturalWeapon): AttackData {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];

  function isItem(weapon: ItemData | NaturalWeapon): weapon is ItemData {
    return "def_id" in weapon;
  }
  const data: AttackData = {
    name: "Improvised Projectile",
    damage: {
      dice: 1,
      die: 2,
      bonus: 0,
    },
    toHit: 0,
    ranges: { short: 10, medium: 20, long: 30 },
    damageBonuses: [],
    conditionalDamageBonuses: [],
    hitBonuses: [],
    conditionalHitBonuses: [],
  };
  if (weapon) {
    if (isItem(weapon)) {
      const def = redux.gameDefs.items[weapon?.def_id];
      data.name = def.name;
      data.damage.dice = def.damage_dice;
      data.damage.die = def.damage_die;
      data.ranges = { short: def.range_short, medium: def.range_medium, long: def.range_long };

      // Magic weapon bonus/penalty.
      if (def && def.magic_bonus !== 0) {
        data.damageBonuses.push([def.name, def.magic_bonus]);
        data.hitBonuses.push([def.name, def.magic_bonus]);
      }

      // Fighting Style (Missile Weapon) grants +1 to hit.
      if (getProficiencyRankForCharacter(characterId, ProficiencyFightingStyle.id, "Missile Weapon")) {
        data.hitBonuses.push(["Fighting Style (Missile Weapon)", 1]);
      }

      // TODO: Once we can detect throwable melee weapons, we need to add Str damage bonus.
    } else {
      data.name = weapon.name;
      // Natural attacks.
      const progressionIndex = getProficiencyRankForCharacter(characterId, SharedNaturalAttackPower.id, weapon.name);
      data.damage = { ...weapon.damageProgression[progressionIndex] };
      // If the roll inherently includes a damage bonus, record it.
      if (data.damage.bonus) {
        data.damageBonuses.push(["Base Damage Bonus", data.damage.bonus]);
        // Temporarily zero this.  It will come back when we combine damageBonuses at the end.
        data.damage.bonus = 0;
      }
      // If the attack inherently includes a hit bonus, record it.
      if (weapon.hitBonus) {
        data.hitBonuses.push(["Base Hit Bonus", weapon.hitBonus]);
      }

      // TODO: Abilities/proficiencies specific to natural attacks.
    }
  }

  // By default, you get the Dexterity bonus to hit.
  const dexBonus = getStatBonusForValue(character.dexterity);
  data.hitBonuses.push(["Dex Bonus", dexBonus]);

  // Level-based hit bonus.
  const lbb = characterClass.toHitBonus[character.level - 1];
  if (lbb > 0) {
    data.hitBonuses.push(["Level Bonus", lbb]);
  }

  if (getProficiencyRankForCharacter(characterId, SharedRangedAccuracyBonus.id)) {
    data.hitBonuses.push(["Class Ranged Accuracy Bonus", 1]);
  }

  if (getProficiencyRankForCharacter(characterId, InjuryBlind.id)) {
    data.hitBonuses.push(["Blind", -4]);
  }

  if (getProficiencyRankForCharacter(characterId, MysticMeditativeFocus.id)) {
    data.conditionalHitBonuses.push(["Is Meditative Focus active?", 1]);
  }

  // Class ranged damage bonus.
  if (getProficiencyRankForCharacter(characterId, SharedRangedDamageBonus.id)) {
    if (character.level >= 12) data.damageBonuses.push(["Class Ranged Damage Bonus", 5]);
    else if (character.level >= 9) data.damageBonuses.push(["Class Ranged Damage Bonus", 4]);
    else if (character.level >= 6) data.damageBonuses.push(["Class Ranged Damage Bonus", 3]);
    else if (character.level >= 3) data.damageBonuses.push(["Class Ranged Damage Bonus", 2]);
    else data.damageBonuses.push(["Class Ranged Damage Bonus", 1]);
  }

  // At the end, reduce the bonuses to a single number for convenience.
  data.damage.bonus = data.damageBonuses.reduce<number>((total, [source, value]) => total + value, data.damage.bonus);
  data.toHit = data.hitBonuses.reduce<number>((total, [source, value]) => total + value, data.toHit);

  return data;
}

export function getMaxMinionCountForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.bonus = 4;
    calc.sources.push({ name: "Base Value", value: 4 });

    const chaBonus = getStatBonusForValue(character.charisma);
    calc.bonus += chaBonus;
    calc.sources.push({ name: "Charisma Bonus", value: chaBonus });

    if (getProficiencyRankForCharacter(characterId, ProficiencyLeadership.id)) {
      calc.sources.push({ name: "Proficiency: Leadership", value: 1 });
      calc.bonus += 1;
    }

    return calc;
  }
}

export function getMaxMinionCountForCharacterv2(
  character: CharacterData,
  activeComponents: Record<string, AbilityComponentInstance[]>
): BonusCalculations {
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.bonus = 4;
    calc.sources.push({ name: "Base Value", value: 4 });

    const chaValue = getCharacterStatv2(character, CharacterStat.Charisma, activeComponents);
    const chaBonus = getStatBonusForValue(chaValue);
    calc.bonus += chaBonus;
    calc.sources.push({ name: "Charisma Bonus", value: chaBonus });

    (activeComponents[AbilityComponentHenchmanCapacityBonus.id] ?? []).forEach((instance) => {
      const instanceData = instance.data as AbilityComponentHenchmanCapacityBonusData;
      calc.sources.push({ name: getAbilityComponentInstanceSourceName(instance), value: instanceData.bonus });
      calc.bonus += instanceData.bonus;
    });

    return calc;
  }
}

export function getRecruitmentRollBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { bonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    const chaBonus = getStatBonusForValue(character.charisma);
    calc.bonus = chaBonus;
    calc.sources.push({ name: "Charisma Bonus", value: chaBonus });

    if (getProficiencyRankForCharacter(characterId, ProficiencyMysticAura.id)) {
      calc.sources.push({ name: "Proficiency: Mystic Aura", value: 2 });
      calc.bonus += 2;
    }

    if (getProficiencyRankForCharacter(characterId, MysticCommandOfVoice.id)) {
      calc.sources.push({ name: "Mystic, Command Of Voice", value: 2 });
      calc.bonus += 2;
    }

    if (getProficiencyRankForCharacter(characterId, ProficiencySeduction.id)) {
      calc.conditionalSources.push({
        name: "Is henchman of opposite gender?",
        value: 2,
        condition: "Is henchman of opposite gender?",
      });
    }

    return calc;
  }
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function addCommasToNumber(x: number, decimals: number = -1) {
  if (decimals >= 0) {
    return x.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

export function getEquipmentSlotTagForSlot(slotName: keyof CharacterEquipmentData): EquipmentSlotTag {
  switch (slotName) {
    case "slot_melee1":
    case "slot_melee2":
      return EquipmentSlotTag.Melee;
    case "slot_ranged":
      return EquipmentSlotTag.Ranged;
    case "slot_armor":
      return EquipmentSlotTag.Armor;
    case "slot_shield":
      return EquipmentSlotTag.Shield;
    case "slot_backpack":
      return EquipmentSlotTag.Backpack;
    case "slot_pouch1":
    case "slot_pouch2":
      return EquipmentSlotTag.Pouch;
    case "slot_bandolier1":
    case "slot_bandolier2":
      return EquipmentSlotTag.Bandolier;
    case "slot_cloak":
      return EquipmentSlotTag.Cloak;
    case "slot_eyes":
      return EquipmentSlotTag.Eyes;
    case "slot_feet":
      return EquipmentSlotTag.Feet;
    case "slot_hands":
      return EquipmentSlotTag.Hands;
    case "slot_head":
      return EquipmentSlotTag.Head;
    case "slot_necklace":
      return EquipmentSlotTag.Necklace;
    case "slot_ring1":
    case "slot_ring2":
      return EquipmentSlotTag.Ring;
    case "slot_waist":
      return EquipmentSlotTag.Waist;
    case "slot_wrists":
      return EquipmentSlotTag.Wrists;
  }
}

export function getEquippableItemsForSlot(className: string, slotName: keyof CharacterEquipmentData): ItemDefData[] {
  let items: ItemDefData[] = [];

  const characterClass = AllClasses[className];
  if (characterClass) {
    const redux = store.getState();
    const slotTag = getEquipmentSlotTagForSlot(slotName);
    items = Object.values(redux.gameDefs.items).filter((itemDef) => {
      // Exclude any items that don't match this equipment slot.
      if (!itemDef.tags.includes(slotTag)) {
        return false;
      }

      // If the class can't use shields, exclude all shields.
      if (slotTag === EquipmentSlotTag.Shield && !characterClass.weaponStyles.includes(WeaponStyle.OneHandAndShield)) {
        return false;
      }

      // If the class can't use 2h weapons, exclude all 2h-only weapons.
      if (
        slotTag === EquipmentSlotTag.Melee &&
        !characterClass.weaponStyles.includes(WeaponStyle.TwoHanded) &&
        itemDef.damage_dice === 0
      ) {
        return false;
      }

      // If the class can't dual wield, exclude all items for slot_melee2.
      if (slotName === "slot_melee2" && !characterClass.weaponStyles.includes(WeaponStyle.DualWield)) {
        return false;
      }

      // WeaponType and WeaponCategory filters.
      if (slotTag === EquipmentSlotTag.Melee || slotTag === EquipmentSlotTag.Ranged) {
        // If the item has an unsupported WeaponCategory, exclude it.
        if (characterClass.weaponCategoryPermissions) {
          const catTag = itemDef.tags.find((tag) => {
            return tag.startsWith("WeaponCategory");
          });
          if (catTag) {
            const cat = catTag.slice(14) as WeaponCategory;
            if (!characterClass.weaponCategoryPermissions.includes(cat)) {
              return false;
            }
          }
        }

        // If the item has an unsupported WeaponType, exclude it.
        if (characterClass.weaponTypePermissions) {
          const typeTag = itemDef.tags.find((tag) => {
            return tag.startsWith("WeaponType");
          });
          if (typeTag) {
            const type = typeTag.slice(10) as WeaponType;
            if (!characterClass.weaponTypePermissions.includes(type)) {
              return false;
            }
          }
        }
      }

      // If the armor's base AC is too high, exclude it.
      if (slotTag === EquipmentSlotTag.Armor && itemDef.ac > characterClass.maxBaseArmor) {
        return false;
      }

      return true;
    });

    // Sort alphabetically.
    items.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  return items;
}

export function isCharacterArcane(characterId: number, levelOverride?: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  const characterLevel = levelOverride ?? character.level;
  // Does this character have base arcane capacity at their current level?
  const arcaneCapacity = characterClass.spellcasting.find((sc) => {
    return sc.spellSource === SpellType.Arcane && sc.spellSlots[characterLevel - 1][0] > 0;
  });
  return !!arcaneCapacity;
}

export function isCharacterDivine(characterId: number, levelOverride?: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  const characterLevel = levelOverride ?? character.level;
  // Does this character have base divine capacity at their current level?
  const divineCapacity = characterClass.spellcasting.find((sc) => {
    return sc.spellSource === SpellType.Divine && sc.spellSlots[characterLevel - 1][0] > 0;
  });
  return (
    !!divineCapacity ||
    getProficiencyRankForCharacter(characterId, ProficiencyLayOnHands.id, undefined, characterLevel) > 0
  );
}

export function canCharacterTurnUndead(characterId: number, levelOverride?: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  const characterLevel = levelOverride ?? character.level;
  // Does this character's class have any Turn Undead ability at its current level?
  const turnCapacity = characterClass.levelBasedSkills.find((lbc) => {
    // "-" means the character can't turn at their current level.
    return lbc.name.startsWith("Turn Undead") && lbc.rolls[characterLevel - 1] !== "-";
  });
  return !!turnCapacity;
}

export function canCharacterSneak(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  // Does this character's class have any Sneak ability at its current level?
  const sneakCapacity = characterClass.levelBasedSkills.find((lbc) => {
    return lbc.name === "Move Silently" || lbc.name === "Hide In Shadows";
  });
  return !!sneakCapacity;
}

export function canCharacterFindTraps(characterId: number): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const characterClass = AllClasses[character.class_name];
  // Does this character's class have any Trap ability at its current level?
  const trapCapacity = characterClass.levelBasedSkills.find((lbc) => {
    return lbc.name === "Find Traps" || lbc.name === "Remove Traps";
  });
  return !!trapCapacity;
}

export function doesCharacterHaveMagicWeapons(characterId: number): boolean {
  const redux = store.getState();
  // Does this character have a magic weapon or magic ammo on hand?
  const itemIds = getAllCharacterAssociatedItemIds(characterId, true);
  const magicWeapon = itemIds.find((iid) => {
    const item = redux.items.allItems[iid];
    const def = redux.gameDefs.items[item.def_id];
    return def.tags.includes(Tag.Magic);
  });
  return !!magicWeapon;
}

export function doesCharacterHaveSilverWeapons(characterId: number): boolean {
  const redux = store.getState();
  // Does this character have a silver weapon or silver ammo on hand?
  const itemIds = getAllCharacterAssociatedItemIds(characterId, true);
  const magicWeapon = itemIds.find((iid) => {
    const item = redux.items.allItems[iid];
    const def = redux.gameDefs.items[item.def_id];
    return def.tags.includes(Tag.Silver);
  });
  return !!magicWeapon;
}

export function getCampaignXPDeductibleCapForLevel(level: number): number {
  // Index = character level, value = deductible cap.
  const CXPDeductibles = [
    0, // No deductible for L0 characters.
    25,
    75,
    150,
    300,
    650, // L5
    1250,
    2500,
    5000,
    12000,
    18000, // L10
    40000,
    60000,
    150000,
    425000,
  ];

  return CXPDeductibles[level] ?? 0;
}

export function getPersonalPileName(characterId: number): string {
  return `Personal Pile ${characterId}`;
}

export function getPersonalPile(characterId: number): StorageData {
  const redux = store.getState();

  const pileName = getPersonalPileName(characterId);
  const pile = redux.storages.storagesByCharacterId[characterId]?.find((storage) => {
    return storage.name === pileName;
  }) as StorageData;

  return pile;
}

export function getCXPDeductibleRemainingForCharacter(characterId: number): number {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  const thisMonth = getFirstOfThisMonthDateString();

  if (
    // Never had a deductible before.
    character.cxp_deductible_date.length === 0 ||
    // Or we've rolled into a new month.
    character.cxp_deductible_date !== thisMonth
  ) {
    // So they should still need to make a full payment.
    return getCampaignXPDeductibleCapForLevel(character.level);
  }

  // Otherwise, whatever number is in the record is correct.
  return character.remaining_cxp_deductible;
}

const livingCostsByLevel: number[] = [
  12, // L0
  25,
  50,
  100,
  200,
  400, // L5
  800,
  1600,
  3000,
  7250,
  12000, // L10
  32000,
  50000,
  135000,
  350000, // L14
];
export function getCostOfLivingForCharacterLevel(level: number): number {
  return livingCostsByLevel[level] ?? 0;
}

export function getCostOfLivingForCharacter(characterId: number): number {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  return getCostOfLivingForCharacterLevel(character?.level ?? 0);
}

export enum MaintenanceStatus {
  Unknown = "Unknown",
  Unpaid = "Unpaid",
  Underpaid = "Underpaid",
  Paid = "Paid",
  Overpaid = "Overpaid",
}
export function getMaintenanceStatusForCharacter(characterId: number): MaintenanceStatus {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  const thisMonth = getFirstOfThisMonthDateString();

  const cost = getCostOfLivingForCharacterLevel(character.level);
  const paid = thisMonth === character.maintenance_date ? character.maintenance_paid : 0;

  if (paid === 0) {
    return MaintenanceStatus.Unpaid;
  }
  if (paid < cost) {
    return MaintenanceStatus.Underpaid;
  }
  if (paid === cost) {
    return MaintenanceStatus.Paid;
  }
  if (paid > cost) {
    return MaintenanceStatus.Overpaid;
  }

  return MaintenanceStatus.Unknown;
}

export function getApparentLevelForCharacter(characterId: number): number {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  const lastAmountPaid = character.maintenance_paid;
  let apparentLevel = 0;
  for (
    ;
    lastAmountPaid > livingCostsByLevel[apparentLevel] && apparentLevel < livingCostsByLevel.length;
    ++apparentLevel
  ) {}

  return apparentLevel;
}

export enum EncumbranceLevel {
  None = 0,
  Light = 1,
  Medium = 2,
  Heavy = 3,
  Overloaded = 4,
}

export function getCombatSpeedsForCharacter(characterId: number): Record<EncumbranceLevel, number> {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  let baseSpeed = 40;

  // The thicker your natural armor, the slower you move.
  const chitinRank = getProficiencyRankForCharacter(characterId, SharedChitinousCarapace.id);
  if (chitinRank > 1) {
    baseSpeed -= 10;
    if (chitinRank > 2) {
      baseSpeed -= 10;
    }
  }

  // Running increases your base speed if your armor isn't too heavy.
  if (getProficiencyRankForCharacter(characterId, ProficiencyRunning.id)) {
    const equippedArmor = redux.gameDefs.items[redux.items.allItems[character?.slot_armor]?.def_id];
    if ((equippedArmor?.ac ?? 0) <= 4) {
      baseSpeed += 10;
    }
  }

  // TODO: Thrassians are always at 20' or less?

  return [baseSpeed, Math.max(0, baseSpeed - 10), Math.max(0, baseSpeed - 20), Math.max(0, baseSpeed - 30), 0];
}

export function getEncumbranceLevelForCharacter(characterId: number): EncumbranceLevel {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];

  // Calculate encumbrance based on equipment slots.
  const encumbrance = getTotalEquippedWeight(character, redux.items.allItems, redux.gameDefs.items);
  const maxEncumbrance: Stones = getCharacterMaxEncumbrance(character);
  // LoadBearing alters the weight for each encumbrance level.
  const encumbranceReduction = 2 * getProficiencyRankForCharacter(characterId, SharedLoadbearing.id);

  let encumbranceLevel = EncumbranceLevel.None;
  if (StonesToSixths(encumbrance) > StonesToSixths(maxEncumbrance)) {
    encumbranceLevel = EncumbranceLevel.Overloaded;
  } else if (StonesToSixths(encumbrance) > StonesToSixths([10 + encumbranceReduction, 0])) {
    encumbranceLevel = EncumbranceLevel.Heavy;
  } else if (StonesToSixths(encumbrance) > StonesToSixths([7 + encumbranceReduction, 0])) {
    encumbranceLevel = EncumbranceLevel.Medium;
  } else if (StonesToSixths(encumbrance) > StonesToSixths([5 + encumbranceReduction, 0])) {
    encumbranceLevel = EncumbranceLevel.Light;
  }

  return encumbranceLevel;
}

export interface AbilityComponentInstance {
  abilityId: number;
  abilityComponentId: string;
  subtype: string;
  data: Record<string, any>;
  // Active component power is based on either a rank or a character level.
  // Proficiency Rolls grant an ability based on how many ranks of the proficiency are active,
  // and a Fireball spell-like ability might explicitly cast at a given caster level.
  rank: number;
  characterLevel: number;
}

// First key is abilityDefIds.  Second key is subtype or empty string if no subtype.  Final value is rank.
export function getActiveAbilityRanksForCharacter(character: CharacterData): Record<number, Record<string, number>> {
  const redux = store.getState();

  const abilityRanks: Record<number, Record<string, number>> = {};

  // Abilities from class and subclass.
  const characterClass = redux.gameDefs.characterClasses[character.class_id];
  const characterSubclass = characterClass?.subclasses?.find((sc) => sc.name === character.subclass_id);

  function adjustRanksForAbilityInstance(instance: AbilityInstancev2): void {
    // Abilities are activated at specific levels, so make sure we qualify.
    if (character.level < instance.minLevel) {
      return;
    }

    const abilityDef = redux.gameDefs.abilities[instance.abilityDefId];
    // Make sure there is somewhere to track ranks.
    if (!abilityRanks[instance.abilityDefId]) {
      abilityRanks[instance.abilityDefId] = {};
    }
    const subtype = instance.subtype ?? "";
    const earnedRank = character.level >= instance.minLevel ? instance.rank : 0;
    const totalRank = (abilityRanks[instance.abilityDefId][subtype] ?? 0) + earnedRank;
    // Cap at max rank for the ability.
    abilityRanks[instance.abilityDefId][subtype] = Math.min(totalRank, abilityDef.max_ranks);
  }

  characterClass.class_features.forEach(adjustRanksForAbilityInstance);
  characterSubclass?.class_features.forEach(adjustRanksForAbilityInstance);

  // TODO: Abilities from assigned proficiencies.  Note that at least in v1, "selectable class features" fall in this category.
  // TODO: I think that I need to rewrite how assigned proficiencies are tracked.  Not sure they deserve their own table in the DB.
  // TODO: Might be better to have them as a Record field on the character instance, stored as JSON.

  return abilityRanks;
}

// Result maps AbilityComponentIds to arrays of all component instances with that id.
export function getActiveAbilityComponentsForCharacter(
  character: CharacterData
): Record<string, AbilityComponentInstance[]> {
  const redux = store.getState();

  const allComponents: Record<string, AbilityComponentInstance[]> = {};

  // Maps the id of the ability to the total number of active ranks (capped by max rank).
  const abilityRanks = getActiveAbilityRanksForCharacter(character);
  Object.entries(abilityRanks).forEach(([abilityDefIdString, subtypes]) => {
    const abilityDef = redux.gameDefs.abilities[+abilityDefIdString];

    Object.entries(subtypes).forEach(([subtype, rank]) => {
      Object.values(abilityDef.components).forEach((component) => {
        const instance: AbilityComponentInstance = {
          abilityId: abilityDef.id,
          abilityComponentId: component.componentId,
          subtype,
          data: component.data,
          rank,
          characterLevel: character.level,
        };
        if (!allComponents[component.componentId]) {
          allComponents[component.componentId] = [];
        }
        allComponents[component.componentId].push(instance);
      });
    });
  });

  // TODO: Components from equipped / carried gear.
  // TODO: Note that those won't necessarily use character.level.  They might have an explicit level.

  // TODO: Here's where we should filter the list of allComponents.
  // TODO: For instance, some component types might not stack, or we might need to combine some?  I'm thinking of the weird
  //       ranger proficiency that combines with Friend of Birds and Beasts.  Both proficiencies can only be had at one rank,
  //       but they need to combine to have two component ranks...  They're extra weird for sure.
  // TODO: In the meantime, though, I'm not sure if that would happen here or at point of use.

  return allComponents;
}

export function getCharacterSupportsV2(character: CharacterData): boolean {
  const redux = store.getState();
  return !!redux.gameDefs.characterClasses[character.class_id];
}

export function getCharacterGrantedLanguages(
  character: CharacterData,
  activeComponents: Record<string, AbilityComponentInstance[]>
): string[] {
  // De-dupe.
  const uniqueLanguageCapabilities = (activeComponents[AbilityComponentLanguageCapability.id] ?? []).reduce<string[]>(
    (soFar: string[], instance: AbilityComponentInstance) => {
      const instanceData = instance.data as AbilityComponentLanguageCapabilityData;
      if (!soFar.includes(instanceData.language)) {
        soFar.push(instanceData.language);
      }
      return soFar;
    },
    []
  );
  return uniqueLanguageCapabilities;
}

export function getCharacterLanguageCapacity(
  character: CharacterData,
  activeComponents: Record<string, AbilityComponentInstance[]>
): number {
  let capacity = 0;

  // Intelligence grants extra slots equal to the stat bonus, but never reduces slot count.
  const intValue = getCharacterStatv2(character, CharacterStat.Intelligence, activeComponents);
  capacity += Math.max(0, getStatBonusForValue(intValue));

  // Language Capability grants the slot that it also fills.
  const grantedLanguages = getCharacterGrantedLanguages(character, activeComponents);
  capacity += grantedLanguages.length;

  // Language Capacity grants slots by ability rank.
  (activeComponents[AbilityComponentLanguageCapacityBonus.id] ?? []).forEach((instance) => {
    const instanceData = instance.data as AbilityComponentLanguageCapacityBonusData;
    capacity += instanceData.bonus_by_rank[instance.rank - 1];
  });

  return capacity;
}

export function getCharacterKnownLanguages(
  character: CharacterData,
  activeComponents: Record<string, AbilityComponentInstance[]>
): string[] {
  // Ability/Item-granted languages (may have duplicates).
  const languages: string[] = getCharacterGrantedLanguages(character, activeComponents);

  // Custom selected languages from the character data.
  // These may duplicate granted languages, which allows the character to retain language knowledge if a granting item is removed.
  character.languages.forEach((language) => {
    if (language && language.length > 0 && !languages.includes(language)) {
      languages.push(language);
    }
  });

  return languages;
}

export function rollDice(num: number, max: number): number {
  let result: number = 0;
  for (let i = 0; i < num; ++i) {
    result += randomInt(1, max);
  }
  return result;
}

export function rollFactorialDie(max: number): number {
  let result: number = randomInt(1, max);

  if (result === max) {
    result += rollFactorialDie(max);
  }

  return result;
}
