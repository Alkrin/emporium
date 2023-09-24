import store from "../redux/store";
import { CharacterData, CharacterEquipmentData, CharacterEquipmentSlots, SpellDefData } from "../serverAPI";
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
import { GeneralProficienciesAt, ProficiencySource } from "../staticData/types/abilitiesAndProficiencies";
import { WeaponStyle, CharacterStat, SpellType } from "../staticData/types/characterClasses";
import { WeaponCategory, WeaponType } from "../staticData/types/items";
import { Dictionary } from "./dictionary";
import { Stones } from "./itemUtils";
import { Tag } from "./tags";
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
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyArmorTraining.id)) {
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
        // If the character class doesn't support this weapon category, only proficiencies can save it.
        !characterClass.weaponCategoryPermissions?.includes(weaponCategory) &&
        // So... do we have the proficiency that lets you use this even when your class says no?
        !isProficiencyUnlockedForCharacter(characterId, ProficiencyMartialTraining.id, weaponType ?? "None")
      ) {
        // Looks like this is not an improvised weapon, the character class forbids it, and the character
        // didn't get special training.  So nope!  Can't use it.
        return false;
      }

      // Supported weapon type?
      if (
        // If no weapon type, this is an improvised weapon, which anyone can use.
        weaponType &&
        // If the character class doesn't support this weapon type, only proficiencies can save it.
        !characterClass.weaponTypePermissions?.includes(weaponType) &&
        // So... do we have the proficiency that lets you use this even when your class says no?
        !isProficiencyUnlockedForCharacter(characterId, ProficiencyMartialTraining.id, weaponType ?? "None")
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

export function isProficiencyUnlockedForCharacter(
  characterId: number,
  proficiencyId: string,
  subtype?: string
): boolean {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return false;
  } else {
    const characterClass = AllClasses[character.class_name];

    // Is this an unlocked class feature?
    const feature = characterClass.classFeatures.find((abilityFilter) => {
      const isSameBaseAbility = abilityFilter.def.id === proficiencyId;
      const isMatchingSubtype = !subtype || abilityFilter.subtypes?.includes(subtype);
      return isSameBaseAbility && isMatchingSubtype;
    });
    if (feature) {
      return true;
    }

    // Is this an assigned, unlocked proficiency?
    const proficiencies = redux.proficiencies.proficienciesByCharacterId[characterId];
    const pdata = proficiencies?.find((p) => {
      const isSameBaseAbility = p.feature_id === proficiencyId;
      const isMatchingSubtype = !subtype || p.subtype === subtype;
      return isSameBaseAbility && isMatchingSubtype;
    });
    if (pdata) {
      const minLevelForSource: Dictionary<number> = {
        [ProficiencySource.Selectable1]: 1,
        [ProficiencySource.Selectable2]: 1,
        [ProficiencySource.Selectable3]: 1,
        [ProficiencySource.Selectable4]: 1,
        [ProficiencySource.Extra]: 1,
        [ProficiencySource.General1]: GeneralProficienciesAt[0] ?? 99,
        [ProficiencySource.General2]: GeneralProficienciesAt[1] ?? 99,
        [ProficiencySource.General3]: GeneralProficienciesAt[2] ?? 99,
        [ProficiencySource.General4]: GeneralProficienciesAt[3] ?? 99,
        [ProficiencySource.Class1]: characterClass.classProficienciesAt[0] ?? 99,
        [ProficiencySource.Class2]: characterClass.classProficienciesAt[1] ?? 99,
        [ProficiencySource.Class3]: characterClass.classProficienciesAt[2] ?? 99,
        [ProficiencySource.Class4]: characterClass.classProficienciesAt[3] ?? 99,
        [ProficiencySource.Class5]: characterClass.classProficienciesAt[4] ?? 99,
      };

      if (character.level >= minLevelForSource[pdata.source]) {
        return true;
      }
    }

    return false;
  }
}

export interface BonusCalculations {
  totalBonus: number;
  // We use arrays to preserve ordering.
  sources: [string, number][];
  conditionalSources: [string, number][];
}

export function getInitiativeBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.totalBonus = getBonusForStat(character.dexterity);
    calc.sources.push(["Dex Bonus", calc.totalBonus]);

    // Is the character wielding a weapon with an initiative penalty tag?  (e.g. Great Axe)
    if (getWeaponTagsForCharacter(characterId).includes(Tag.InitiativeMinusOne)) {
      calc.sources.push(["Slow Weapon", -1]);
      calc.totalBonus -= 1;
    }

    // Is the character wielding a spear/polearm with the matching proficiency?
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Pole Weapon")) {
      const weapon1 = redux.items.allItems[character.slot_melee1];
      const weapon2 = redux.items.allItems[character.slot_melee2];
      const def1 = redux.gameDefs.items[weapon1?.def_id];
      const def2 = redux.gameDefs.items[weapon2?.def_id];
      if (def1?.tags.includes(WeaponCategory.SpearPoleArm) || def2?.tags.includes(WeaponCategory.SpearPoleArm)) {
        calc.sources.push(["Fighting Style: Pole Weapon", 1]);
        calc.totalBonus += 1;
      }
    }

    if (isProficiencyUnlockedForCharacter(characterId, BladeDancerMobility.id)) {
      calc.sources.push(["Blade Dancer Mobility", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, SharedAnimalReflexes.id)) {
      calc.sources.push(["Animal Reflexes", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticSpeedOfThought.id)) {
      calc.sources.push(["Speed Of Thought", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
    }

    return calc;
  }
}

export function getArmorBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.totalBonus = getBonusForStat(character.dexterity);
    calc.sources.push(["Dex Bonus", calc.totalBonus]);

    const equippedArmor = redux.gameDefs.items[redux.items.allItems[character?.slot_armor]?.def_id];
    if (equippedArmor) {
      const equippedArmorAC = (equippedArmor?.ac ?? 0) + (equippedArmor?.magic_bonus ?? 0);
      calc.totalBonus += equippedArmorAC;
      calc.sources.push([equippedArmor.name, equippedArmorAC]);
    }

    const equippedShield = redux.gameDefs.items[redux.items.allItems[character?.slot_shield]?.def_id];
    if (equippedShield) {
      const equippedShieldAC = (equippedShield?.ac ?? 0) + (equippedShield?.magic_bonus ?? 0);
      calc.totalBonus += equippedShieldAC;
      calc.sources.push([equippedShield.name, equippedShieldAC]);
    }

    // Proficiencies and abilities that grant armor.
    if (
      equippedShield &&
      isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Weapon and Shield")
    ) {
      calc.sources.push(["Fighting Style (Weapon and Shield)", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, BladeDancerMobility.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push(["Blade Dancer, Mobility", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, WildHarvesterNaturalTactics.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push(["Wild Harvester, Natural Tactics", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticGracefulFightingStyle.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push(["Mystic, Graceful Fighting Style", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, ProficiencySwashbuckling.id)) {
      let mBonus = 1;
      if (character.level >= 7) ++mBonus;
      if (character.level >= 13) ++mBonus;

      calc.sources.push(["Swashbuckling", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, DwarvenFuryFleshRunes.id)) {
      let mBonus = 2;
      if (character.level >= 7) mBonus += 2;
      if (character.level >= 13) mBonus += 2;

      calc.sources.push(["Dwarven Fury, Flesh Runes", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, BattlegoatGatecrasherRuneCarvedHorns.id)) {
      let mBonus = 2;
      if (character.level >= 7) mBonus += 2;
      if (character.level >= 13) mBonus += 2;

      calc.sources.push(["Battlegoat Gatecrasher, Rune-carved Horns", mBonus]);
      calc.totalBonus += mBonus;
    }

    if (isProficiencyUnlockedForCharacter(characterId, BattlegoatGatecrasherSteelWool.id)) {
      calc.sources.push(["Battlegoat Gatecrasher, Steel Wool", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, AntiPaladinAuraOfProtection.id)) {
      calc.conditionalSources.push(["Is target Good-aligned?", 1]);
    }

    if (isProficiencyUnlockedForCharacter(characterId, PaladinAuraOfProtection.id)) {
      calc.conditionalSources.push(["Is source Evil-aligned?", 1]);
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
    }

    return calc;
  }
}

export function getSavingThrowBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyDivineBlessing.id)) {
      calc.sources.push(["Divine Blessing", 2]);
      calc.totalBonus += 2;
    }

    if (isProficiencyUnlockedForCharacter(characterId, AntiPaladinAuraOfProtection.id)) {
      calc.conditionalSources.push(["Is source Good-aligned?", 1]);
    }

    if (isProficiencyUnlockedForCharacter(characterId, PaladinAuraOfProtection.id)) {
      calc.conditionalSources.push(["Is source Evil-aligned?", 1]);
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
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

export function getMeleeHitCalculationsForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    const characterClass = AllClasses[character.class_name];
    // What is equipped?
    const weapon1 = redux.items.allItems[character.slot_melee1];
    const weapon2 = redux.items.allItems[character.slot_melee2];
    const def1 = redux.gameDefs.items[weapon1?.def_id];
    const def2 = redux.gameDefs.items[weapon2?.def_id];

    // By default, you get the Strength bonus to hit.
    calc.totalBonus = getBonusForStat(character.strength);
    calc.sources = [["Str Bonus", calc.totalBonus]];
    // If the character has Weapon Finesse and is wielding 1h weapon(s), they can use the greater of Dex and Str bonus.
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyWeaponFinesse.id)) {
      if ((def1 && def2) || def1?.damage_dice || def2?.damage_dice) {
        const dexBonus = getBonusForStat(character.dexterity);
        if (dexBonus > calc.totalBonus) {
          calc.totalBonus = dexBonus;
          calc.sources[0] = ["Dex Bonus (Weapon Finesse)", dexBonus];
        }
      }
    }

    // Level-based bonus.
    const lbb = characterClass.toHitBonus[character.level - 1];
    if (lbb > 0) {
      calc.sources.push(["Level Bonus", lbb]);
      calc.totalBonus += lbb;
    }

    // Magic weapon bonus/penalty.
    if (def1 && def1.magic_bonus !== 0) {
      calc.sources.push([def1.name, def1.magic_bonus]);
      calc.totalBonus += def1.magic_bonus;
    }
    if (def2 && def2.magic_bonus !== 0) {
      calc.sources.push([def2.name, def2.magic_bonus]);
      calc.totalBonus += def2.magic_bonus;
    }

    // Dual-wielding grants +1 to hit.
    if (def1 && def2) {
      calc.sources.push(["Dual Wielding", 1]);
      calc.totalBonus += 1;

      // Fighting Style (Two Weapons) grants an extra +1 to hit.
      if (isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Two Weapons")) {
        calc.sources.push(["Fighting Style (Two Weapons)", 1]);
        calc.totalBonus += 1;
      }
    }

    // Fighting Style (Single Weapon) grants +1 to hit.
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Single Weapon")) {
      if ((def1 && !def2) || (def2 && !def1)) {
        calc.sources.push(["Fighting Style (Single Weapon)", 1]);
        calc.totalBonus += 1;
      }
    }

    if (isProficiencyUnlockedForCharacter(characterId, SharedMeleeAccuracyBonus.id)) {
      calc.sources.push(["Class Melee Accuracy Bonus", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
    }

    return calc;
  }
}

interface WeaponDamageCalculations {
  weaponName: string;
  numDice: number;
  sizeDice: number;
  bonuses: [string, number][];
  rangeIncrement: number;
}
export function getMeleeDamageCalculationsForCharacter(characterId: number): WeaponDamageCalculations {
  const calc: WeaponDamageCalculations = {
    weaponName: "Unarmed Strike",
    numDice: 1,
    sizeDice: 2,
    bonuses: [],
    rangeIncrement: 0,
  };

  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return calc;
  } else {
    // Strength bonus.
    const strBonus = getBonusForStat(character.strength);
    if (strBonus !== 0) {
      calc.bonuses.push(["Str Bonus", strBonus]);
    }

    // Class melee damage bonus.
    if (isProficiencyUnlockedForCharacter(characterId, SharedMeleeDamageBonus.id)) {
      if (character.level >= 12) calc.bonuses.push(["Class Melee Damage Bonus", 5]);
      else if (character.level >= 9) calc.bonuses.push(["Class Melee Damage Bonus", 4]);
      else if (character.level >= 6) calc.bonuses.push(["Class Melee Damage Bonus", 3]);
      else if (character.level >= 3) calc.bonuses.push(["Class Melee Damage Bonus", 2]);
      else calc.bonuses.push(["Class Melee Damage Bonus", 1]);
    }

    // Does this character have a melee weapon equipped?
    const weapon1 = redux.items.allItems[character.slot_melee1];
    const weapon2 = redux.items.allItems[character.slot_melee2];
    const def1 = redux.gameDefs.items[weapon1?.def_id];
    const def2 = redux.gameDefs.items[weapon2?.def_id];

    // If no weapon equipped, we will show unarmed combat.
    // If both weapons equipped, show dual wield data.
    if (def1 && def2) {
      const outputOne = def1.damage_dice * def1.damage_die + def1.magic_bonus;
      const outputTwo = def2.damage_dice * def2.damage_die + def2.magic_bonus;
      if (outputTwo > outputOne) {
        // Weapon two is better.
        calc.numDice = def2.damage_dice;
        calc.sizeDice = def2.damage_die;
        if (def2.magic_bonus !== 0) {
          calc.bonuses.push([def2.name, def2.magic_bonus]);
        }
      } else {
        // Weapon one is equal/better.
        calc.numDice = def1.damage_dice;
        calc.sizeDice = def1.damage_die;
        if (def1.magic_bonus !== 0) {
          calc.bonuses.push([def1.name, def1.magic_bonus]);
        }
      }
      calc.weaponName = `${def1.name} & ${def2.name}`;
    }
    // If one weapon equipped, show single attack data.
    else if (def1 || def2) {
      const def = def1 ?? def2;
      if (def.damage_dice_2h) {
        calc.numDice = def.damage_dice_2h;
        calc.sizeDice = def.damage_die_2h;
        // Fighting Style (Two-handed Weapon) gives +1 damage.
        if (isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Two-handed Weapon")) {
          if ((def1 && !def2) || (def2 && !def1)) {
            calc.bonuses.push(["Fighting Style (Two-handed Weapon)", 1]);
          }
        }
      } else {
        calc.numDice = def.damage_dice;
        calc.sizeDice = def.damage_die;
      }
      if (def.magic_bonus !== 0) {
        calc.bonuses.push([def.name, def.magic_bonus]);
      }
      calc.weaponName = def.name;
    }

    // TODO: How to do conditional bonuses?

    return calc;
  }
}

export function getRangedHitCalculationsForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    const characterClass = AllClasses[character.class_name];

    // What is equipped?
    const weapon = redux.items.allItems[character.slot_ranged];
    const def = redux.gameDefs.items[weapon?.def_id];

    // By default, you get the Dexterity bonus to hit.
    calc.totalBonus = getBonusForStat(character.dexterity);
    calc.sources = [["Dex Bonus", calc.totalBonus]];

    // Level-based bonus.
    const lbb = characterClass.toHitBonus[character.level - 1];
    if (lbb > 0) {
      calc.sources.push(["Level Bonus", lbb]);
      calc.totalBonus += lbb;
    }

    // Magic weapon bonus/penalty.
    if (def && def.magic_bonus !== 0) {
      calc.sources.push([def.name, def.magic_bonus]);
      calc.totalBonus += def.magic_bonus;
    }

    // Fighting Style (Missile Weapon) grants +1 to hit.
    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyFightingStyle.id, "Missile Weapon")) {
      calc.sources.push(["Fighting Style (Missile Weapon)", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, SharedRangedAccuracyBonus.id)) {
      calc.sources.push(["Class Ranged Accuracy Bonus", 1]);
      calc.totalBonus += 1;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
      calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
    }

    return calc;
  }
}

export function getRangedDamageCalculationsForCharacter(characterId: number): WeaponDamageCalculations {
  const calc: WeaponDamageCalculations = {
    weaponName: "Improvised Projectile",
    numDice: 1,
    sizeDice: 2,
    bonuses: [],
    rangeIncrement: 10,
  };

  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  if (!character) {
    return calc;
  } else {
    // Class ranged damage bonus.
    if (isProficiencyUnlockedForCharacter(characterId, SharedRangedDamageBonus.id)) {
      if (character.level >= 12) calc.bonuses.push(["Class Ranged Damage Bonus", 5]);
      else if (character.level >= 9) calc.bonuses.push(["Class Ranged Damage Bonus", 4]);
      else if (character.level >= 6) calc.bonuses.push(["Class Ranged Damage Bonus", 3]);
      else if (character.level >= 3) calc.bonuses.push(["Class Ranged Damage Bonus", 2]);
      else calc.bonuses.push(["Class Ranged Damage Bonus", 1]);
    }

    // Does this character have a ranged weapon equipped?
    const weapon = redux.items.allItems[character.slot_ranged];
    const def = redux.gameDefs.items[weapon?.def_id];

    // If no weapon equipped, we will show improvised weapons (throw a rock).
    // If one weapon equipped, show single attack data.
    if (def) {
      calc.numDice = def.damage_dice;
      calc.sizeDice = def.damage_die;
      if (def.magic_bonus !== 0) {
        calc.bonuses.push([def.name, def.magic_bonus]);
      }
      calc.weaponName = def.name;
      calc.rangeIncrement = def.range_increment;
    }

    // TODO: How to do conditional bonuses?

    return calc;
  }
}

export function getMaxMinionCountForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    calc.totalBonus = 4;
    calc.sources.push(["Base Value", 4]);

    const chaBonus = getBonusForStat(character.charisma);
    calc.totalBonus += chaBonus;
    calc.sources.push(["Charisma Bonus", chaBonus]);

    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyLeadership.id)) {
      calc.sources.push(["Proficiency: Leadership", 1]);
      calc.totalBonus += 1;
    }

    // if (isProficiencyUnlockedForCharacter(characterId, MysticMeditativeFocus.id)) {
    //   calc.conditionalSources.push(["Is Mediative Focus active?", 1]);
    // }

    return calc;
  }
}

export function getRecruitmentRollBonusForCharacter(characterId: number): BonusCalculations {
  const redux = store.getState();
  const character = redux.characters.characters[characterId];
  const calc: BonusCalculations = { totalBonus: 0, sources: [], conditionalSources: [] };
  if (!character) {
    return calc;
  } else {
    const chaBonus = getBonusForStat(character.charisma);
    calc.totalBonus = chaBonus;
    calc.sources.push(["Charisma Bonus", chaBonus]);

    if (isProficiencyUnlockedForCharacter(characterId, ProficiencyMysticAura.id)) {
      calc.sources.push(["Proficiency: Mystic Aura", 2]);
      calc.totalBonus += 2;
    }

    if (isProficiencyUnlockedForCharacter(characterId, MysticCommandOfVoice.id)) {
      calc.sources.push(["Mystic, Command Of Voice", 2]);
      calc.totalBonus += 2;
    }

    if (isProficiencyUnlockedForCharacter(characterId, ProficiencySeduction.id)) {
      calc.conditionalSources.push(["Is henchman of opposite gender?", 1]);
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
