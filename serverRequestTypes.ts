import { Dictionary } from "./lib/dictionary";
import {
  ActivityData,
  ActivityOutcomeData,
  ArmyData,
  CharacterEquipmentData,
  EquipmentSetData,
  EquipmentSetItemData,
  LocationCityData,
  LocationData,
  LocationLairData,
  MapData,
  MapHexData,
  ProficiencyData,
  ServerActivityData,
  ServerItemDefData,
  ServerSpellDefData,
  TroopData,
  TroopDefData,
  TroopInjuryData,
} from "./serverAPI";
import { SpellType } from "./staticData/types/characterClasses";

export interface RequestBody_AddToRepertoire {
  character_id: number;
  spell_id: number;
  spell_type: SpellType;
  spell_level: number;
}

export interface RequestBody_RemoveFromRepertoire {
  entry_id: number;
}

export interface RequestBody_AddToSpellbook {
  spellbook_id: number;
  spell_id: number;
}

export interface RequestBody_RemoveFromSpellbook {
  entry_id: number;
}

export interface RequestField_StartingEquipmentData extends EquipmentSetItemData {
  count: number;
}
export interface RequestBody_CreateOrEditCharacter {
  id: number;
  user_id: number;
  name: string;
  gender: string;
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
  hit_dice: string;
  location_id: number;
  /** Feature id, subtype, rank. */
  selected_class_features: [string, string, number][];
  equipment?: RequestField_StartingEquipmentData[];
}

export interface RequestBody_DeleteCharacter {
  id: number;
  item_ids: number[];
}

export interface RequestBody_SetHenchmaster {
  masterCharacterId: number;
  minionCharacterId: number;
}

export interface RequestBody_CreateItem {
  def_id: number;
  count: number;
  container_id: number;
  storage_id: number;
}

export interface RequestBody_CreateStorage {
  name: string;
  capacity: number;
  location_id: number;
  owner_id: number;
  group_ids: number[];
  money: number;
}

export interface RequestBody_EncryptString {
  text: string;
}

export interface RequestBody_LogIn {
  name: string;
  pass: string;
}

export interface RequestBody_SetXP {
  characterId: number;
  xp: number;
}

export interface RequestBody_SetHP {
  characterId: number;
  hp: number;
}

export interface RequestBody_SetMoney {
  storageId: number;
  gp: number;
}

export interface RequestBody_SetCharacterLocation {
  characterId: number;
  locationId: number;
}

export interface RequestBody_SetCharacterRemainingCXPDeductible {
  characterId: number;
  remainingCXPDeductible: number;
}

export interface RequestBody_UpdateProficiencies {
  character_id: number;
  proficiencies: ProficiencyData[];
}

export interface ItemMoveParams {
  itemId: number;
  // If the item is coming out of a Container or Storage, we won't set any src params,
  // as the item itself tracks those.
  srcCharacterId?: number;
  srcEquipmentSlot?: string;
  srcSplit?: boolean;
  // Whichever dest is correct should be populated.
  destContainerId?: number;
  destStorageId?: number;
  destCharacterId?: number;
  destEquipmentSlot?: string;
}

export interface RequestBody_MoveItems {
  moves: ItemMoveParams[];
}

export interface RequestBody_MergeBundleItems {
  srcItemId: number;
  destItemId: number;
  count: number;
  /** Only set if the item was equipped on a character. */
  srcCharacterId?: number;
  srcEquipmentSlot?: keyof CharacterEquipmentData;
}

export interface RequestBody_SplitBundleItems {
  srcItemId: number;
  destContainerId: number;
  destStorageId: number;
  count: number;
  itemDefId: number;
}

export interface RequestBody_CreateOrEditEquipmentSet {
  setData: EquipmentSetData;
  itemData: EquipmentSetItemData[];
}

export interface RequestBody_ResolveActivity {
  activity: ActivityData;
  resolution_text: string;
  outcomes: ActivityOutcomeData[];
}

export interface RequestBody_KillOrReviveCharacter {
  characterId: number;
}

export interface RequestBody_AddOrRemoveInjury {
  characterId: number;
  injuryId: string;
}

export interface RequestBody_DeleteArmy {
  id: number;
  troop_ids: number[];
}

export interface RequestBody_DeleteSingleEntry {
  id: number;
}

// Activity
export type RequestBody_CreateActivity = Omit<ServerActivityData, "id" | "resolution_text">;
export type RequestBody_EditActivity = ServerActivityData;
// Army
export type RequestBody_CreateArmy = Omit<ArmyData, "id">;
export type RequestBody_EditArmy = ArmyData;
// ItemDef
export type RequestBody_CreateItemDef = Omit<ServerItemDefData, "id">;
export type RequestBody_EditItemDef = ServerItemDefData;
// Location
interface LocationEx {
  city: LocationCityData;
  lair: LocationLairData;
}
export type RequestBody_CreateLocation = Omit<LocationData, "id"> & LocationEx;
export type RequestBody_EditLocation = LocationData & LocationEx;
// Map
export type RequestBody_CreateMap = Omit<MapData, "id">;
export type RequestBody_EditMap = MapData;
// MapHex
export type RequestBody_CreateMapHex = Omit<MapHexData, "id">;
export type RequestBody_EditMapHex = MapHexData;
// SpellDef
export type RequestBody_CreateSpellDef = Omit<ServerSpellDefData, "id">;
export type RequestBody_EditSpellDef = ServerSpellDefData;
// Troop
export type RequestBody_CreateTroop = Omit<TroopData, "id">;
export type RequestBody_EditTroop = TroopData;
// TroopDef
export type RequestBody_CreateTroopDef = Omit<TroopDefData, "id">;
export type RequestBody_EditTroopDef = TroopDefData;
// TroopInjury
export type RequestBody_CreateTroopInjury = Omit<TroopInjuryData, "id">;
export type RequestBody_EditTroopInjury = TroopInjuryData;
