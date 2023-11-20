import { getAllCharacterAssociatedItemIds } from "./lib/characterUtils";
import { Dictionary } from "./lib/dictionary";
import { UserRole } from "./redux/userSlice";
import {
  RequestBody_SetXP,
  RequestBody_CreateOrEditCharacter as RequestBody_CreateOrEditCharacter,
  RequestBody_EncryptString,
  RequestBody_LogIn,
  RequestBody_SetHP,
  RequestBody_UpdateProficiencies,
  RequestBody_CreateItemDef,
  RequestBody_EditItemDef,
  RequestBody_DeleteItemDef,
  RequestBody_CreateStorage,
  RequestBody_CreateItem,
  ItemMoveParams,
  RequestBody_MoveItems,
  RequestBody_MergeBundleItems,
  RequestBody_SplitBundleItems,
  RequestBody_CreateSpellDef,
  RequestBody_EditSpellDef,
  RequestBody_DeleteSpellDef,
  RequestBody_AddToSpellbook,
  RequestBody_RemoveFromSpellbook,
  RequestBody_DeleteSpellbook,
  RequestBody_DeleteCharacter,
  RequestBody_AddToRepertoire,
  RequestBody_RemoveFromRepertoire,
  RequestBody_SetHenchmaster,
  RequestBody_SetMoney,
  RequestBody_CreateOrEditEquipmentSet,
  RequestBody_DeleteEquipmentSet,
  RequestField_StartingEquipmentData,
  RequestBody_CreateActivity,
  RequestBody_EditActivity,
  RequestBody_DeleteActivity,
  RequestBody_ResolveActivity,
  RequestBody_KillOrReviveCharacter,
  RequestBody_AddOrRemoveInjury,
  RequestBody_CreateMap,
  RequestBody_EditMap,
  RequestBody_DeleteMap,
  RequestBody_CreateMapHex,
  RequestBody_EditMapHex,
  RequestBody_DeleteMapHex,
} from "./serverRequestTypes";
import { ProficiencySource } from "./staticData/types/abilitiesAndProficiencies";
import { SpellType } from "./staticData/types/characterClasses";

export interface ServerError {
  error: string;
}

export interface UserData {
  id: number;
  name: string;
  role: UserRole;
}

export interface ItemDefData {
  id: number;
  name: string;
  description: string;
  stones: number;
  sixth_stones: number;
  storage_stones: number;
  storage_sixth_stones: number;
  storage_filters: string[];
  bundleable: boolean;
  number_per_stone: number;
  ac: number;
  damage_die: number;
  damage_dice: number;
  damage_die_2h: number;
  damage_dice_2h: number;
  range_increment: number;
  fixed_weight: boolean;
  magic_bonus: number;
  conditional_magic_bonus: number;
  conditional_magic_bonus_type: string;
  max_cleaves: number;
  tags: string[];
  purchase_quantity: number;
  cost_gp: number;
  cost_sp: number;
  cost_cp: number;
}

type ServerItemDefData = Omit<ItemDefData, "storage_filters" | "tags"> & {
  storage_filters: string;
  tags: string;
};

export interface ItemData {
  id: number;
  def_id: number;
  count: number;
  container_id: number;
  storage_id: number;
}

export interface StorageData {
  id: number;
  name: string;
  capacity: number;
  location_id: number;
  owner_id: number;
  group_ids: number[];
}
type ServerStorageData = Omit<StorageData, "group_ids"> & {
  group_ids: string;
};

export interface SpellbookEntryData {
  id: number;
  spellbook_id: number;
  spell_id: number;
}

export interface RepertoireEntryData {
  id: number;
  character_id: number;
  spell_id: number;
  spell_type: SpellType;
  spell_level: number;
}

export type Gender = "m" | "f" | "o";

export interface CharacterEquipmentData {
  // Slots contain an item id or a zero for no item equipped.
  slot_armor: number;
  slot_backpack: number;
  slot_bandolier1: number;
  slot_bandolier2: number;
  slot_cloak: number;
  slot_eyes: number;
  slot_feet: number;
  slot_hands: number;
  slot_head: number;
  slot_melee1: number;
  slot_melee2: number;
  slot_necklace: number;
  slot_pouch1: number;
  slot_pouch2: number;
  slot_ranged: number;
  slot_ring1: number;
  slot_ring2: number;
  slot_shield: number;
  slot_waist: number;
  slot_wrists: number;
}

export const emptyEquipmentData: CharacterEquipmentData = {
  slot_armor: 0,
  slot_backpack: 0,
  slot_bandolier1: 0,
  slot_bandolier2: 0,
  slot_cloak: 0,
  slot_eyes: 0,
  slot_feet: 0,
  slot_hands: 0,
  slot_head: 0,
  slot_melee1: 0,
  slot_melee2: 0,
  slot_necklace: 0,
  slot_pouch1: 0,
  slot_pouch2: 0,
  slot_ranged: 0,
  slot_ring1: 0,
  slot_ring2: 0,
  slot_shield: 0,
  slot_waist: 0,
  slot_wrists: 0,
};
export const CharacterEquipmentSlots = Object.keys(emptyEquipmentData) as (keyof CharacterEquipmentData)[];

export interface CharacterData extends CharacterEquipmentData {
  id: number;
  user_id: number;
  name: string;
  gender: Gender;
  portrait_url: string;
  class_name: string;
  level: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  xp: number;
  hp: number;
  hit_dice: number[];
  henchmaster_id: number;
  /** Whole gp, decimal sp/cp. */
  money: number;
  remaining_cxp_deductible: number;
  cxp_deductible_date: string;
  dead: boolean;
}

export interface ProficiencyData {
  character_id: number;
  feature_id: string;
  subtype: string;
  source: ProficiencySource;
}

export interface SpellTableColumn {
  title: string;
  legend: string;
  values: string[];
}

export interface SpellDefData {
  id: number;
  name: string;
  description: string;
  spell_range: string;
  duration: string;
  tags: string[];
  type_levels: { [type in SpellType]?: number };
  table_image: string;
}

export interface EquipmentSetData {
  id: number;
  name: string;
  class_name: string;
}

export interface EquipmentSetItemData {
  set_id: number;
  /** These are pseudo-item ids, used internally to the equipment set to track container contents. */
  item_id: number;
  /** Matches an item def. */
  def_id: number;
  /** Either matches an equipment slot from CharacterEquipmentData (e.g. slot_armor), or is "Container#"
   * where # matches to the item_id from another EquipmentSetItemData from the same equipment set.  */
  slot_name: string;
}

export function SpellDefData_TypeLevelsToString(type_levels: { [type in SpellType]?: number }): string {
  return Object.entries(type_levels)
    .map(([type, level]) => {
      return `${type}:${level}`;
    })
    .join(",");
}
export function SpellDefData_StringToTypeLevels(text: string): { [type in SpellType]?: number } {
  const type_levels: Dictionary<number> = {};
  text
    .split(",") // Gives us an array of things like "Arcane:1"
    .map((tl) => {
      return tl.split(":"); // Gives us tuples like ["Arcane","1"]
    })
    .forEach(([type, level]) => {
      type_levels[type] = +level; // Sets the SpellType as key and the spell's level as value.
    });
  return type_levels;
}

type ServerSpellDefData = Omit<SpellDefData, "tags" | "type_levels"> & {
  tags: string;
  type_levels: string;
};

type ServerCharacterData = Omit<CharacterData, "hit_dice"> & { hit_dice: string };

export interface ActivityData {
  id: number;
  user_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: ActivityParticipant[];
  resolution_text: string;
}

type ServerActivityData = Omit<ActivityData, "participants"> & {
  participants: string;
};

export interface ActivityParticipant {
  characterId: number;
  characterLevel: number;
  isArcane: boolean;
  isDivine: boolean;
  canTurnUndead: boolean;
  canSneak: boolean;
  canFindTraps: boolean;
  hasMagicWeapons: boolean;
  hasSilverWeapons: boolean;
}

export function ActivityData_StringToParticipants(s: string): ActivityParticipant[] {
  if (s.length === 0) {
    return [];
  }
  const stringIds = s.split(",");
  return stringIds.map((sid) => {
    const [pid, level, isArcane, isDivine, canTurnUndead, canSneak, canFindTraps, hasMagicWeapons, hasSilverWeapons] =
      sid.split(":");
    const p: ActivityParticipant = {
      characterId: +pid,
      characterLevel: +level,
      isArcane: isArcane === "T",
      isDivine: isDivine === "T",
      canTurnUndead: canTurnUndead === "T",
      canSneak: canSneak === "T",
      canFindTraps: canFindTraps === "T",
      hasMagicWeapons: hasMagicWeapons === "T",
      hasSilverWeapons: hasSilverWeapons === "T",
    };
    return p;
  });
}

export function ActivityData_ParticipantToString(participant: ActivityParticipant): string {
  return (
    `${participant.characterId}:` +
    `${participant.characterLevel}:` +
    `${participant.isArcane ? "T" : "F"}:` +
    `${participant.isDivine ? "T" : "F"}:` +
    `${participant.canTurnUndead ? "T" : "F"}:` +
    `${participant.canSneak ? "T" : "F"}:` +
    `${participant.canFindTraps ? "T" : "F"}:` +
    `${participant.hasMagicWeapons ? "T" : "F"}:` +
    `${participant.hasSilverWeapons ? "T" : "F"}`
  );
}
export function ActivityData_ParticipantsToString(participants: ActivityParticipant[]): string {
  return participants
    .map((p) => {
      return ActivityData_ParticipantToString(p);
    })
    .join(",");
}

export enum ActivityOutcomeType {
  Invalid = "Invalid",
  XP = "XP",
  Gold = "Gold",
  Item = "Item",
  CXPDeductible = "CXPDeductible",
  CXPDeductibleReset = "CXPDeductibleReset",
  Injury = "Injury",
  Death = "Death",
  Relocate = "Relocate", // Character changed to a new location.
}
export interface ActivityOutcomeData {
  id: number;
  activity_id: number;
  type: ActivityOutcomeType;
  target_id: number;
  quantity: number;
  extra: string;
}

export interface MapData {
  id: number;
  name: string;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

export interface MapHexData {
  id: number;
  map_id: number;
  x: number;
  y: number;
  type: string;
}

type ServerActivityOutcomeData = Omit<ActivityOutcomeData, "type"> & {
  type: string;
};

export function ActivityOutcomeData_StringToType(s: string): ActivityOutcomeType {
  switch (s) {
    case ActivityOutcomeType.XP:
      return ActivityOutcomeType.XP;
    case ActivityOutcomeType.Gold:
      return ActivityOutcomeType.Gold;
    case ActivityOutcomeType.Item:
      return ActivityOutcomeType.Item;
    case ActivityOutcomeType.CXPDeductible:
      return ActivityOutcomeType.CXPDeductible;
    case ActivityOutcomeType.CXPDeductibleReset:
      return ActivityOutcomeType.CXPDeductibleReset;
    case ActivityOutcomeType.Injury:
      return ActivityOutcomeType.Injury;
    case ActivityOutcomeType.Death:
      return ActivityOutcomeType.Death;
    case ActivityOutcomeType.Relocate:
      return ActivityOutcomeType.Relocate;
    default:
      return ActivityOutcomeType.Invalid;
  }
}

export interface XPChange {
  newXPValue: number;
}

export interface HPChange {
  newHPValue: number;
}

export interface MoneyChange {
  newMoneyValue: number;
}

export interface RowAdded {
  insertId: number;
}

export interface RowEdited {
  changedRows: number;
}

export interface RowDeleted {
  affectedRows: number;
}

export type LogInResult = ServerError | UserData;
export type ActivitiesResult = ServerError | ActivityData[];
export type ActivityOutcomesResult = ServerError | ActivityOutcomeData[];
export type CharactersResult = ServerError | CharacterData[];
export type EquipmentSetsResult = ServerError | EquipmentSetData[];
export type EquipmentSetItemsResult = ServerError | EquipmentSetItemData[];
export type ItemDefsResult = ServerError | ItemDefData[];
export type ItemsResult = ServerError | ItemData[];
export type UsersResult = ServerError | UserData[];
export type StoragesResult = ServerError | StorageData[];
export type SpellDefsResult = ServerError | SpellDefData[];
export type ProficienciesResult = ServerError | ProficiencyData[];
export type SpellbooksResult = ServerError | SpellbookEntryData[];
export type RepertoiresResult = ServerError | RepertoireEntryData[];
export type MapsResult = ServerError | MapData[];
export type MapHexesResult = ServerError | MapHexData[];
export type SetHPResult = ServerError | HPChange;
export type SetMoneyResult = ServerError | MoneyChange;
export type SetXPResult = ServerError | XPChange;
export type MultiModifyResult = ServerError | (ServerError | EditRowResult | InsertRowResult | DeleteRowResult)[];
export type InsertRowResult = ServerError | RowAdded;
export type EditRowResult = ServerError | RowEdited;
export type DeleteRowResult = ServerError | RowDeleted;
export type NoDataResult = ServerError | {};

class AServerAPI {
  async encryptString(text: string): Promise<string> {
    const requestBody: RequestBody_EncryptString = {
      text,
    };
    const res = await fetch("/api/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (res.status === 200) {
      return await res.json();
    }
    return "";
  }

  async logIn(name: string, pass: string): Promise<LogInResult> {
    const requestBody: RequestBody_LogIn = {
      name,
      pass,
    };
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async fetchActivities(): Promise<ActivitiesResult> {
    const res = await fetch("/api/fetchActivities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerActivityData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      const activityData: ActivityData[] = [];
      data.forEach((sActivityData) => {
        activityData.push({
          ...sActivityData,
          participants: ActivityData_StringToParticipants(sActivityData.participants),
        });
      });

      return activityData;
    }
  }

  async fetchActivityOutcomes(): Promise<ActivityOutcomesResult> {
    const res = await fetch("/api/fetchActivityOutcomes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerActivityOutcomeData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      const outcomeData: ActivityOutcomeData[] = [];
      data.forEach((sOutcomeData) => {
        outcomeData.push({
          ...sOutcomeData,
          type: ActivityOutcomeData_StringToType(sOutcomeData.type),
        });
      });

      return outcomeData;
    }
  }

  async fetchCharacters(): Promise<CharactersResult> {
    const res = await fetch("/api/fetchCharacters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerCharacterData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      // hit_dice is stored in the db as a comma separated string, but in Redux as a number array,
      // so we have to convert it before passing the results along.
      const charData: CharacterData[] = [];
      data.forEach((sCharData) => {
        charData.push({
          ...sCharData,
          hit_dice: sCharData.hit_dice.split(",").map((stringHP) => {
            return +stringHP;
          }),
        });
      });

      return charData;
    }
  }

  async fetchItemDefs(): Promise<ItemDefsResult> {
    const res = await fetch("/api/fetchItemDefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerItemDefData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      // tags and storage_filters are stored in the db as comma separated strings, but in Redux as a number array,
      // so we have to convert before passing the results along.
      const itemData: ItemDefData[] = [];
      data.forEach((sItemData) => {
        sItemData.storage_filters = sItemData.storage_filters.trim();
        itemData.push({
          ...sItemData,
          tags: sItemData.tags.length > 0 ? sItemData.tags.split(",") : [],
          storage_filters: sItemData.storage_filters.length > 0 ? sItemData.storage_filters.split(",") : [],
        });
      });

      return itemData;
    }
  }

  async fetchItems(): Promise<ItemsResult> {
    const res = await fetch("/api/fetchItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ItemData[] = await res.json();
    return data;
  }

  async fetchSpellbooks(): Promise<SpellbooksResult> {
    const res = await fetch("/api/fetchSpellbooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | SpellbookEntryData[] = await res.json();
    return data;
  }

  async fetchRepertoires(): Promise<RepertoiresResult> {
    const res = await fetch("/api/fetchRepertoires", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | RepertoireEntryData[] = await res.json();
    return data;
  }

  async fetchStorages(): Promise<StoragesResult> {
    const res = await fetch("/api/fetchStorages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerStorageData[] = await res.json();

    if ("error" in data) {
      return data;
    } else {
      // group_ids is stored in the db as comma separated strings, but in Redux as a number array,
      // so we have to convert before passing the results along.
      const storageData: StorageData[] = [];
      data.forEach((storage) => {
        storageData.push({
          ...storage,
          group_ids:
            storage.group_ids.length > 0
              ? storage.group_ids.split(",").map((str) => {
                  return +str;
                })
              : [],
        });
      });
      return storageData;
    }
  }

  async fetchSpellDefs(): Promise<SpellDefsResult> {
    const res = await fetch("/api/fetchSpellDefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerSpellDefData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      // tags and type_levels are stored in the db as comma separated strings,
      // so we have to convert before passing the results along.
      const spellData: SpellDefData[] = [];
      data.forEach((sSpellData) => {
        const type_levels = SpellDefData_StringToTypeLevels(sSpellData.type_levels);

        spellData.push({
          ...sSpellData,
          tags: sSpellData.tags.length > 0 ? sSpellData.tags.split(",") : [],
          type_levels,
        });
      });

      return spellData;
    }
  }

  async fetchEquipmentSets(): Promise<EquipmentSetsResult> {
    const res = await fetch("/api/fetchEquipmentSets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  }

  async fetchEquipmentSetItems(): Promise<EquipmentSetItemsResult> {
    const res = await fetch("/api/fetchEquipmentSetItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  }

  async createCharacter(
    character: CharacterData,
    selected_class_features: [string, string, number][],
    equipment: RequestField_StartingEquipmentData[]
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_CreateOrEditCharacter = {
      ...character,
      // Stored on the server as a comma separated string.
      hit_dice: character.hit_dice.join(","),
      selected_class_features,
      equipment,
    };
    const res = await fetch("/api/createCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editCharacter(
    character: CharacterData,
    selected_class_features: [string, string, number][]
  ): Promise<EditRowResult> {
    const requestBody: RequestBody_CreateOrEditCharacter = {
      ...character,
      // Stored on the server as a comma separated string.
      hit_dice: character.hit_dice.join(","),
      selected_class_features,
    };
    const res = await fetch("/api/editCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteCharacter(character: CharacterData): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteCharacter = {
      id: character.id,
      item_ids: getAllCharacterAssociatedItemIds(character.id),
    };
    const res = await fetch("/api/deleteCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async setHenchmaster(masterCharacterId: number, minionCharacterId: number): Promise<EditRowResult> {
    const requestBody: RequestBody_SetHenchmaster = {
      masterCharacterId,
      minionCharacterId,
    };
    const res = await fetch("/api/setHenchmaster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createItem(data: ItemData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateItem = {
      ...data,
    };
    const res = await fetch("/api/createItem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createItemDef(def: ItemDefData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateItemDef = {
      ...def,
      // Stored on the server as a comma separated string.
      storage_filters: def.storage_filters.join(","),
      tags: def.tags.join(","),
    };
    const res = await fetch("/api/createItemDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createStorage(storage: StorageData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateStorage = {
      ...storage,
    };
    const res = await fetch("/api/createStorage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editItemDef(def: ItemDefData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditItemDef = {
      ...def,
      // Stored on the server as a comma separated string.
      storage_filters: def.storage_filters.join(","),
      tags: def.tags.join(","),
    };
    const res = await fetch("/api/editItemDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteItemDef(itemDefId: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteItemDef = {
      itemDefId,
    };
    const res = await fetch("/api/deleteItemDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createSpellDef(def: SpellDefData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateSpellDef = {
      ...def,
      // Stored on the server as a comma separated string.
      tags: def.tags.join(","),
      type_levels: SpellDefData_TypeLevelsToString(def.type_levels),
    };
    const res = await fetch("/api/createSpellDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editSpellDef(def: SpellDefData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditSpellDef = {
      ...def,
      // Stored on the server as a comma separated string.
      tags: def.tags.join(","),
      type_levels: SpellDefData_TypeLevelsToString(def.type_levels),
    };
    const res = await fetch("/api/editSpellDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteSpellDef(spellDefId: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSpellDef = {
      spellDefId,
    };
    const res = await fetch("/api/deleteSpellDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async fetchProficiencies(): Promise<ProficienciesResult> {
    const res = await fetch("/api/fetchProficiencies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchUsers(): Promise<UsersResult> {
    const res = await fetch("/api/fetchUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchMaps(): Promise<MapsResult> {
    const res = await fetch("/api/fetchMaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchMapHexes(): Promise<MapHexesResult> {
    const res = await fetch("/api/fetchMapHexes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async setHP(characterId: number, hp: number): Promise<SetHPResult> {
    const requestBody: RequestBody_SetHP = {
      characterId,
      hp,
    };
    const res = await fetch("/api/setHP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async setMoney(characterId: number, gp: number): Promise<SetMoneyResult> {
    const requestBody: RequestBody_SetMoney = {
      characterId,
      gp,
    };
    const res = await fetch("/api/setMoney", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async setXP(characterId: number, xp: number): Promise<SetXPResult> {
    const requestBody: RequestBody_SetXP = {
      characterId,
      xp,
    };
    const res = await fetch("/api/setXP", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async updateProficiencies(character_id: number, proficiencies: ProficiencyData[]): Promise<NoDataResult> {
    const requestBody: RequestBody_UpdateProficiencies = {
      character_id,
      proficiencies,
    };
    const res = await fetch("/api/updateProficiencies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async moveItems(moves: ItemMoveParams[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_MoveItems = { moves };
    const res = await fetch("/api/moveItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async mergeBundleItems(
    srcItemId: number,
    destItemId: number,
    count: number,
    srcCharacterId?: number,
    srcEquipmentSlot?: keyof CharacterEquipmentData
  ): Promise<NoDataResult> {
    const requestBody: RequestBody_MergeBundleItems = {
      srcItemId,
      destItemId,
      count,
      srcCharacterId,
      srcEquipmentSlot,
    };
    const res = await fetch("/api/mergeBundleItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  /** Whichever of destContainerId and destStorageId is wrong, set to zero.  Returns the id of the newly created bundle item. */
  async splitBundleItems(
    srcItemId: number,
    destContainerId: number,
    destStorageId: number,
    count: number,
    itemDefId: number
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_SplitBundleItems = { srcItemId, destContainerId, destStorageId, count, itemDefId };
    const res = await fetch("/api/splitBundleItems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async addToSpellbook(spellbook_id: number, spell_id: number): Promise<InsertRowResult> {
    const requestBody: RequestBody_AddToSpellbook = {
      spellbook_id,
      spell_id,
    };
    const res = await fetch("/api/addToSpellbook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async removeFromSpellbook(entry_id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_RemoveFromSpellbook = {
      entry_id,
    };
    const res = await fetch("/api/removeFromSpellbook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteSpellbook(spellbook_id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSpellbook = {
      spellbook_id,
    };
    const res = await fetch("/api/deleteSpellbook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async addToRepertoire(
    character_id: number,
    spell_id: number,
    spell_type: SpellType,
    spell_level: number
  ): Promise<InsertRowResult> {
    const requestBody: RequestBody_AddToRepertoire = {
      character_id,
      spell_id,
      spell_type,
      spell_level,
    };
    const res = await fetch("/api/addToRepertoire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async removeFromRepertoire(entry_id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_RemoveFromRepertoire = {
      entry_id,
    };
    const res = await fetch("/api/removeFromRepertoire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createEquipmentSet(setData: EquipmentSetData, itemData: EquipmentSetItemData[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_CreateOrEditEquipmentSet = {
      setData,
      itemData,
    };
    const res = await fetch("/api/createEquipmentSet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editEquipmentSet(setData: EquipmentSetData, itemData: EquipmentSetItemData[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_CreateOrEditEquipmentSet = {
      setData,
      itemData,
    };
    const res = await fetch("/api/editEquipmentSet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteEquipmentSet(setId: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteEquipmentSet = {
      setId,
    };
    const res = await fetch("/api/deleteEquipmentSet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createActivity(activity: ActivityData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateActivity = {
      ...activity,
      participants: ActivityData_ParticipantsToString(activity.participants),
    };
    const res = await fetch("/api/createActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editActivity(activity: ActivityData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditActivity = {
      ...activity,
      participants: ActivityData_ParticipantsToString(activity.participants),
    };
    const res = await fetch("/api/editActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteActivity(activityId: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteActivity = {
      activityId,
    };
    const res = await fetch("/api/deleteActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async resolveActivity(
    activity: ActivityData,
    resolution_text: string,
    outcomes: ActivityOutcomeData[]
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_ResolveActivity = { activity, resolution_text, outcomes };
    const res = await fetch("/api/resolveActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async reviveCharacter(characterId: number): Promise<EditRowResult> {
    const requestBody: RequestBody_KillOrReviveCharacter = {
      characterId,
    };
    const res = await fetch("/api/reviveCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async killCharacter(characterId: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_KillOrReviveCharacter = {
      characterId,
    };
    const res = await fetch("/api/killCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async addInjury(characterId: number, injuryId: string): Promise<InsertRowResult> {
    const requestBody: RequestBody_AddOrRemoveInjury = {
      characterId,
      injuryId,
    };
    const res = await fetch("/api/addInjury", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async removeInjury(characterId: number, injuryId: string): Promise<DeleteRowResult> {
    const requestBody: RequestBody_AddOrRemoveInjury = {
      characterId,
      injuryId,
    };
    const res = await fetch("/api/removeInjury", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createMap(map: MapData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateMap = {
      ...map,
    };
    const res = await fetch("/api/createMap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editMap(map: MapData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditMap = {
      ...map,
    };
    const res = await fetch("/api/editMap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteMap(mapId: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteMap = {
      mapId,
    };
    const res = await fetch("/api/deleteMap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createMapHex(hex: MapHexData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateMapHex = {
      ...hex,
    };
    const res = await fetch("/api/createMapHex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editMapHex(hex: MapHexData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditMapHex = {
      ...hex,
    };
    const res = await fetch("/api/editMapHex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteMapHex(hexId: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteMapHex = {
      hexId,
    };
    const res = await fetch("/api/deleteMapHex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }
}

const ServerAPI = new AServerAPI();
export default ServerAPI;
