import { ActivityResolution, convertActivityOutcomeForServer, convertServerActivityOutcome } from "./lib/activityUtils";
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
  RequestBody_CreateStorage,
  RequestBody_CreateItem,
  ItemMoveParams,
  RequestBody_MoveItems,
  RequestBody_MergeBundleItems,
  RequestBody_SplitBundleItems,
  RequestBody_CreateSpellDef,
  RequestBody_EditSpellDef,
  RequestBody_AddToSpellbook,
  RequestBody_RemoveFromSpellbook,
  RequestBody_DeleteCharacter,
  RequestBody_AddToRepertoire,
  RequestBody_RemoveFromRepertoire,
  RequestBody_SetHenchmaster,
  RequestBody_SetMoney,
  RequestBody_CreateOrEditEquipmentSet,
  RequestField_StartingEquipmentData,
  RequestBody_CreateActivity,
  RequestBody_EditActivity,
  RequestBody_ResolveActivity,
  RequestBody_KillOrReviveCharacter,
  RequestBody_AddOrRemoveInjury,
  RequestBody_CreateMap,
  RequestBody_EditMap,
  RequestBody_CreateMapHex,
  RequestBody_EditMapHex,
  RequestBody_CreateLocation,
  RequestBody_EditLocation,
  RequestBody_CreateTroopDef,
  RequestBody_EditTroopDef,
  RequestBody_CreateTroop,
  RequestBody_EditTroop,
  RequestBody_DeleteSingleEntry,
  RequestBody_CreateTroopInjury,
  RequestBody_EditTroopInjury,
  RequestBody_CreateArmy,
  RequestBody_EditArmy,
  RequestBody_DeleteArmy,
  RequestBody_SetCharacterLocation,
  RequestBody_SetCharacterRemainingCXPDeductible,
  RequestBody_EditStorage,
  RequestBody_DeleteStorage,
  RequestBody_DeleteItems,
  RequestBody_CreateStructure,
  RequestBody_EditStructure,
  RequestBody_CreateStructureComponent,
  RequestBody_EditStructureComponent,
  RequestBody_CreateStructureComponentDef,
  RequestBody_EditStructureComponentDef,
  RequestBody_PayCharacterMaintenance,
  RequestBody_PayArmyMaintenance,
  RequestBody_PayStructureMaintenance,
  RequestBody_CreateContract,
  RequestBody_EditContract,
  RequestBody_ExerciseContract as RequestBody_ExerciseContracts,
  RequestBody_PayCostOfLiving,
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

export type ServerItemDefData = Omit<ItemDefData, "storage_filters" | "tags"> & {
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
  money: number;
}

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
  remaining_cxp_deductible: number;
  cxp_deductible_date: string;
  dead: boolean;
  location_id: number;
  maintenance_date: string;
  maintenance_paid: number;
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

export type ServerSpellDefData = Omit<SpellDefData, "tags" | "type_levels"> & {
  tags: string;
  type_levels: string;
};

export type ServerCharacterData = Omit<CharacterData, "hit_dice"> & { hit_dice: string };

export interface ActivityData {
  id: number;
  user_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: ActivityAdventurerParticipant[];
  army_participants: ActivityArmyParticipant[];
  lead_from_behind_id: number;
}

export type ServerActivityData = Omit<ActivityData, "participants" | "army_participants"> & {
  participants: string;
  army_participants: string;
};

export interface ActivityAdventurerParticipant {
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

export interface ActivityArmyParticipant {
  armyId: number;
  // key: troop def id, value: count of that troop present at the start of the activity
  troopCounts: Dictionary<number>;
}

export function ActivityData_StringToArmyParticipants(s: string): ActivityArmyParticipant[] {
  if (s.length === 0) {
    return [];
  }

  // Army strings are separated by '|'
  const armyStrings = s.split("|");

  const armyParticipants: ActivityArmyParticipant[] = armyStrings.map((armyString) => {
    const troopCounts: Dictionary<number> = {};
    const stringIds = armyString.split(",");

    // Pop off the armyId first.
    const armyId = +(stringIds.shift() ?? "0");

    // Everything after that is paired troop def ids and troop counts.
    stringIds.forEach((sid) => {
      const [troopDefId, count] = sid.split(":");
      troopCounts[+troopDefId] = (troopCounts[+troopDefId] ?? 0) + +count;
    });

    const p: ActivityArmyParticipant = {
      armyId,
      troopCounts,
    };
    return p;
  });

  return armyParticipants;
}

export function ActivityData_ArmyParticipantToString(armyParticipant: ActivityArmyParticipant): string {
  return (
    `${armyParticipant.armyId},` +
    Object.entries(armyParticipant.troopCounts)
      .map(([troopDefIdString, count]) => {
        return `${troopDefIdString}:${count}`;
      })
      .join(",")
  );
}
export function ActivityData_ArmyParticipantsToString(participants: ActivityArmyParticipant[]): string {
  return participants
    .map((p) => {
      return ActivityData_ArmyParticipantToString(p);
    })
    .join("|");
}

export function ActivityData_StringToParticipants(s: string): ActivityAdventurerParticipant[] {
  if (s.length === 0) {
    return [];
  }
  const stringIds = s.split(",");
  return stringIds.map((sid) => {
    const [pid, level, isArcane, isDivine, canTurnUndead, canSneak, canFindTraps, hasMagicWeapons, hasSilverWeapons] =
      sid.split(":");
    const p: ActivityAdventurerParticipant = {
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

export function ActivityData_ParticipantToString(participant: ActivityAdventurerParticipant): string {
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
export function ActivityData_ParticipantsToString(participants: ActivityAdventurerParticipant[]): string {
  return participants
    .map((p) => {
      return ActivityData_ParticipantToString(p);
    })
    .join(",");
}

export enum ActivityOutcomeType {
  Invalid = "---",
  ChangeLocation = "ChangeLocation",
  Description = "Description",
  InjuriesAndDeaths = "InjuriesAndDeaths",
  LootAndXP = "LootAndXP",
}
export const SortedActivityOutcomeTypes = Object.values(ActivityOutcomeType).sort();
export const UniqueActivityOutcomeTypes = [
  ActivityOutcomeType.ChangeLocation,
  ActivityOutcomeType.Description,
  ActivityOutcomeType.InjuriesAndDeaths,
  ActivityOutcomeType.LootAndXP,
];

export interface ActivityOutcomeData {
  id: number;
  activity_id: number;
  type: ActivityOutcomeType;
}

export function ActivityOutcomeData_StringToType(s: string): ActivityOutcomeType {
  switch (s) {
    case ActivityOutcomeType.ChangeLocation:
      return ActivityOutcomeType.ChangeLocation;
    case ActivityOutcomeType.Description:
      return ActivityOutcomeType.Description;
    case ActivityOutcomeType.InjuriesAndDeaths:
      return ActivityOutcomeType.InjuriesAndDeaths;
    case ActivityOutcomeType.LootAndXP:
      return ActivityOutcomeType.LootAndXP;
    default:
      return ActivityOutcomeType.Invalid;
  }
}

export interface ServerActivityOutcomeData {
  id: number;
  activity_id: number;
  type: string;
  data: string;
}

export interface ActivityOutcomeData_ChangeLocation extends ActivityOutcomeData {
  type: ActivityOutcomeType.ChangeLocation;
  locationId: number;
}

export interface ActivityOutcomeData_Description extends ActivityOutcomeData {
  type: ActivityOutcomeType.Description;
  description: string;
}

export interface ActivityOutcomeData_InjuriesAndDeaths extends ActivityOutcomeData {
  type: ActivityOutcomeType.InjuriesAndDeaths;
  // Character deaths and injures are inter-related.  Dead characters generally aren't ALSO injured.
  deadCharacterIds: number[];
  // Injuries state.  Key: characterId, value: injuryIds.
  characterInjuries: Dictionary<string[]>;
  // First key: armyId, second key: troopDefId, value: number of injuries.
  troopInjuriesByArmy: Dictionary<Dictionary<number>>;
  // First key: armyId, second key: troopDefId, value: number of deaths.
  troopDeathsByArmy: Dictionary<Dictionary<number>>;
}

export interface ActivityOutcomeData_LootAndXP extends ActivityOutcomeData {
  type: ActivityOutcomeType.LootAndXP;
  goldWithXP: number;
  goldWithoutXP: number;
  combatXP: number;
  campaignXP: number;
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

export interface LocationData {
  id: number;
  name: string;
  description: string;
  map_id: number;
  hex_id: number;
  is_public: boolean;
  viewer_ids: number[];
  type: string;
  icon_url: string;
}

type ServerLocationData = Omit<LocationData, "viewer_ids"> & {
  viewer_ids: string;
};

export interface LocationCityData {
  id: number;
  location_id: number;
  market_class: number;
}

export interface LocationLairData {
  id: number;
  location_id: number;
  monster_level: number;
  num_encounters: number;
}

export interface TroopDefData {
  id: number;
  name: string;
  description: string;
  ac: number;
  move: number;
  morale: number;
  individual_br: number;
  platoon_br: number;
  platoon_size: number;
  wage: number;
}

export interface ArmyData {
  id: number;
  name: string;
  location_id: number;
  user_id: number;
  /** The last month for which maintenance has been paid. */
  maintenance_date: string;
}

export interface TroopData {
  id: number;
  army_id: number;
  def_id: number;
  count: number;
}

export interface TroopInjuryData {
  id: number;
  troop_id: number;
  count: number;
  recovery_date: string;
}

export interface StructureData {
  id: number;
  name: string;
  description: string;
  /** Structures are owned by Characters, if they are owned at all. */
  owner_id: number;
  location_id: number;
  /** The last month for which maintenance has been paid. */
  maintenance_date: string;
}

export interface StructureComponentDefData {
  id: number;
  name: string;
  description: string;
  /** Base construction cost in GP. */
  cost: number;
}

export interface StructureComponentData {
  id: number;
  structure_id: number;
  component_id: number;
  /** Partial components are permitted.  e.g. Stone walls are counted by 100' segments, but you can have 50' of wall if quantity is 0.5. */
  quantity: number;
}

export interface ContractData {
  id: number;
  def_id: number;
  party_a_id: number;
  party_b_id: number;
  target_a_id: number;
  target_b_id: number;
  value: number;
  exercise_date: string;
}

export function StringToNumbers(s: string): number[] {
  return s.split(",").map((s2) => {
    return +s2;
  });
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
export type ExpectedOutcomesResult = ServerError | ActivityOutcomeData[];
export type ActivityOutcomesResult = ServerError | ActivityOutcomeData[];
export type CharactersResult = ServerError | CharacterData[];
export type EquipmentSetsResult = ServerError | EquipmentSetData[];
export type EquipmentSetItemsResult = ServerError | EquipmentSetItemData[];
export type ItemDefsResult = ServerError | ItemDefData[];
export type ItemsResult = ServerError | ItemData[];
export type UsersResult = ServerError | UserData[];
export type StructureComponentDefsResult = ServerError | StructureComponentDefData[];
export type StructureComponentsResult = ServerError | StructureComponentData[];
export type StructuresResult = ServerError | StructureData[];
export type StoragesResult = ServerError | StorageData[];
export type SpellDefsResult = ServerError | SpellDefData[];
export type ProficienciesResult = ServerError | ProficiencyData[];
export type SpellbooksResult = ServerError | SpellbookEntryData[];
export type RepertoiresResult = ServerError | RepertoireEntryData[];
export type MapsResult = ServerError | MapData[];
export type MapHexesResult = ServerError | MapHexData[];
export type LocationsResult = ServerError | ServerLocationData[];
export type LocationCitiesResult = ServerError | LocationCityData[];
export type LocationLairsResult = ServerError | LocationLairData[];
export type TroopDefsResult = ServerError | TroopDefData[];
export type ArmiesResult = ServerError | ArmyData[];
export type ContractsResult = ServerError | ContractData[];
export type TroopsResult = ServerError | TroopData[];
export type TroopInjuriesResult = ServerError | TroopInjuryData[];
export type SetHPResult = ServerError | HPChange;
export type SetMoneyResult = ServerError | MoneyChange;
export type SetXPResult = ServerError | XPChange;
export type GetURLsResult = ServerError | string[];
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
          army_participants: ActivityData_StringToArmyParticipants(sActivityData.army_participants),
        });
      });

      return activityData;
    }
  }

  async fetchExpectedOutcomes(): Promise<ExpectedOutcomesResult> {
    const res = await fetch("/api/fetchExpectedOutcomes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | ServerActivityOutcomeData[] = await res.json();
    if ("error" in data) {
      return data;
    } else {
      const outcomes: ActivityOutcomeData[] = [];
      data.forEach((sod) => {
        const data = convertServerActivityOutcome(sod);
        if (data) {
          outcomes.push(data);
        } else {
          console.error(`Found invalid ServerActivityOutcomeData in expected_outcomes.`, sod);
          return { error: "Found invalid ServerActivityOutcomeData in expected_outcomes." };
        }
      });
      return outcomes;
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
      const outcomes: ActivityOutcomeData[] = [];
      data.forEach((sod) => {
        const data = convertServerActivityOutcome(sod);
        if (data) {
          outcomes.push(data);
        } else {
          console.error(`Found invalid ServerActivityOutcomeData in activity_outcomes.`, sod);
          return { error: "Found invalid ServerActivityOutcomeData in activity_outcomes." };
        }
      });
      return outcomes;
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

  async fetchStructureComponentDefs(): Promise<StructureComponentDefsResult> {
    const res = await fetch("/api/fetchStructureComponentDefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | StructureComponentDefData[] = await res.json();
    return data;
  }

  async fetchStructureComponents(): Promise<StructureComponentsResult> {
    const res = await fetch("/api/fetchStructureComponents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | StructureComponentData[] = await res.json();
    return data;
  }

  async fetchStructures(): Promise<StructuresResult> {
    const res = await fetch("/api/fetchStructures", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | StructureData[] = await res.json();
    return data;
  }

  async fetchStorages(): Promise<StoragesResult> {
    const res = await fetch("/api/fetchStorages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ServerError | StorageData[] = await res.json();
    return data;
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

  async setHenchmaster(
    masterCharacterId: number,
    minionCharacterId: number,
    percentLoot: number
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_SetHenchmaster = {
      masterCharacterId,
      minionCharacterId,
      percentLoot,
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

  async deleteItems(item_ids: number[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteItems = {
      item_ids,
    };
    const res = await fetch("/api/deleteItems", {
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

  async editStorage(storage: StorageData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditStorage = {
      ...storage,
    };
    const res = await fetch("/api/editStorage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteStorage(storageId: number, itemIds: number[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteStorage = {
      id: storageId,
      item_ids: itemIds,
    };
    const res = await fetch("/api/deleteStorage", {
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

  async deleteItemDef(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async deleteSpellDef(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async fetchLocations(): Promise<LocationsResult> {
    const res = await fetch("/api/fetchLocations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchLocationCities(): Promise<LocationCitiesResult> {
    const res = await fetch("/api/fetchLocationCities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchLocationLairs(): Promise<LocationLairsResult> {
    const res = await fetch("/api/fetchLocationLairs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchTroopDefs(): Promise<TroopDefsResult> {
    const res = await fetch("/api/fetchTroopDefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchArmies(): Promise<ArmiesResult> {
    const res = await fetch("/api/fetchArmies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchContracts(): Promise<ContractsResult> {
    const res = await fetch("/api/fetchContracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchTroops(): Promise<TroopsResult> {
    const res = await fetch("/api/fetchTroops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  }

  async fetchTroopInjuries(): Promise<TroopInjuriesResult> {
    const res = await fetch("/api/fetchTroopInjuries", {
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

  async setMoney(storageId: number, gp: number): Promise<SetMoneyResult> {
    const requestBody: RequestBody_SetMoney = {
      storageId,
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

  async setCharacterLocation(characterId: number, locationId: number): Promise<EditRowResult> {
    const requestBody: RequestBody_SetCharacterLocation = {
      characterId,
      locationId,
    };
    const res = await fetch("/api/setCharacterLocation", {
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

  async setCharacterRemainingCXPDeductible(
    characterId: number,
    remainingCXPDeductible: number
  ): Promise<EditRowResult> {
    const requestBody: RequestBody_SetCharacterRemainingCXPDeductible = {
      characterId,
      remainingCXPDeductible,
    };
    const res = await fetch("/api/setCharacterRemainingCXPDeductible", {
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

  async deleteSpellbook(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async deleteEquipmentSet(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async createActivity(
    activity: ActivityData,
    expectedOutcomes: ServerActivityOutcomeData[]
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_CreateActivity = {
      ...activity,
      participants: ActivityData_ParticipantsToString(activity.participants),
      army_participants: ActivityData_ArmyParticipantsToString(activity.army_participants),
      expectedOutcomes,
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

  async editActivity(
    activity: ActivityData,
    expectedOutcomes: ServerActivityOutcomeData[]
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_EditActivity = {
      ...activity,
      participants: ActivityData_ParticipantsToString(activity.participants),
      army_participants: ActivityData_ArmyParticipantsToString(activity.army_participants),
      expectedOutcomes,
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

  async deleteActivity(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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
    outcomes: ActivityOutcomeData[],
    resolution: ActivityResolution
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_ResolveActivity = {
      activity,
      outcomes: outcomes.map(convertActivityOutcomeForServer),
      resolution,
    };
    const res = await fetch("/api/resolveActivity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async exerciseContracts(contracts: ContractData[], gp: number[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_ExerciseContracts = { contracts, gp };
    const res = await fetch("/api/exerciseContracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async payCostOfLiving(characters: CharacterData[], gp: number[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_PayCostOfLiving = { characters, gp };
    const res = await fetch("/api/payCostOfLiving", {
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

  async deleteMap(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async deleteMapHex(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
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

  async createLocation(
    location: LocationData,
    city: LocationCityData,
    lair: LocationLairData
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_CreateLocation = {
      ...location,
      city,
      lair,
    };
    const res = await fetch("/api/createLocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editLocation(
    location: LocationData,
    city: LocationCityData,
    lair: LocationLairData
  ): Promise<MultiModifyResult> {
    const requestBody: RequestBody_EditLocation = {
      ...location,
      city,
      lair,
    };
    const res = await fetch("/api/editLocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteLocation(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteLocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async getMapIconURLs(): Promise<GetURLsResult> {
    const res = await fetch("/api/getMapIconURLs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (res.status === 200) {
      return await res.json();
    }
    return [];
  }

  async createTroopDef(def: TroopDefData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateTroopDef = {
      ...def,
    };
    const res = await fetch("/api/createTroopDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editTroopDef(def: TroopDefData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditTroopDef = {
      ...def,
    };
    const res = await fetch("/api/editTroopDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteTroopDef(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteTroopDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createArmy(data: ArmyData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateArmy = {
      ...data,
    };
    const res = await fetch("/api/createArmy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editArmy(data: ArmyData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditArmy = {
      ...data,
    };
    const res = await fetch("/api/editArmy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteArmy(id: number, troop_ids: number[]): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteArmy = {
      id,
      troop_ids,
    };
    const res = await fetch("/api/deleteArmy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createContract(data: ContractData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateContract = {
      ...data,
    };
    const res = await fetch("/api/createContract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editContract(data: ContractData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditContract = {
      ...data,
    };
    const res = await fetch("/api/editContract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteContract(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteContract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createTroop(data: TroopData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateTroop = {
      ...data,
    };
    const res = await fetch("/api/createTroop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editTroop(data: TroopData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditTroop = {
      ...data,
    };
    const res = await fetch("/api/editTroop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteTroop(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteTroop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createTroopInjury(data: TroopInjuryData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateTroopInjury = {
      ...data,
    };
    const res = await fetch("/api/createTroopInjury", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editTroopInjury(data: TroopInjuryData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditTroopInjury = {
      ...data,
    };
    const res = await fetch("/api/editTroopInjury", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteTroopInjury(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteTroopInjury", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createStructure(data: StructureData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateStructure = {
      ...data,
    };
    const res = await fetch("/api/createStructure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editStructure(data: StructureData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditStructure = {
      ...data,
    };
    const res = await fetch("/api/editStructure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteStructure(id: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteStructure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createStructureComponent(data: StructureComponentData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateStructureComponent = {
      ...data,
    };
    const res = await fetch("/api/createStructureComponent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editStructureComponent(data: StructureComponentData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditStructureComponent = {
      ...data,
    };
    const res = await fetch("/api/editStructureComponent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteStructureComponent(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteStructureComponent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async createStructureComponentDef(data: StructureComponentDefData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateStructureComponentDef = {
      ...data,
    };
    const res = await fetch("/api/createStructureComponentDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async editStructureComponentDef(data: StructureComponentDefData): Promise<EditRowResult> {
    const requestBody: RequestBody_EditStructureComponentDef = {
      ...data,
    };
    const res = await fetch("/api/editStructureComponentDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async deleteStructureComponentDef(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteSingleEntry = {
      id,
    };
    const res = await fetch("/api/deleteStructureComponentDef", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async payCharacterMaintenance(characterId: number, storageId: number, gp: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_PayCharacterMaintenance = {
      characterId,
      storageId,
      gp,
    };
    const res = await fetch("/api/payCharacterMaintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async payArmyMaintenance(armyId: number, storageId: number, gp: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_PayArmyMaintenance = {
      armyId,
      storageId,
      gp,
    };
    const res = await fetch("/api/payArmyMaintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async payStructureMaintenance(structureId: number, storageId: number, gp: number): Promise<MultiModifyResult> {
    const requestBody: RequestBody_PayStructureMaintenance = {
      structureId,
      storageId,
      gp,
    };
    const res = await fetch("/api/payStructureMaintenance", {
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
