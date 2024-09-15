import { ActivityResolution } from "./lib/activityUtils";
import {
  ActivityData,
  ArmyData,
  CharacterData,
  CharacterEquipmentData,
  ContractData,
  EquipmentSetData,
  EquipmentSetItemData,
  ItemData,
  LocationCityData,
  LocationData,
  LocationLairData,
  MapData,
  ProficiencyData,
  ServerAbilityDefData,
  ServerActivityData,
  ServerActivityOutcomeData,
  ServerItemData,
  ServerItemDefData,
  ServerMapHexData,
  ServerSpellDefData,
  StorageData,
  StructureComponentData,
  StructureComponentDefData,
  StructureData,
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

export interface RequestBody_DeleteStorage {
  id: number;
  item_ids: number[];
}

export interface RequestBody_DeleteItems {
  item_ids: number[];
}

export interface RequestBody_SellItem {
  item: ItemData;
  sellCount: number;
  activity: ActivityData;
  outcome: ServerActivityOutcomeData;
  resolution: ActivityResolution;
  storageId: number;
  gpGained: number;
}

export interface RequestBody_SetHenchmaster {
  masterCharacterId: number;
  minionCharacterId: number;
  percentLoot: number;
}

export interface RequestBody_CreateItem {
  item: ServerItemData;
}

export interface RequestBody_EditItem {
  item: ServerItemData;
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

export interface RequestBody_SetXPReserve {
  characterId: number;
  xp_reserve: number;
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

export interface RequestBody_PayCharacterMaintenance {
  characterId: number;
  storageId: number;
  gp: number;
}

export interface RequestBody_PayArmyMaintenance {
  armyId: number;
  storageId: number;
  gp: number;
}

export interface RequestBody_PayStructureMaintenance {
  structureId: number;
  storageId: number;
  gp: number;
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
  srcItem: ItemData;
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
  outcomes: ServerActivityOutcomeData[];
  resolution: ActivityResolution;
}

export interface RequestBody_ExerciseContract {
  contracts: ContractData[];
  gp: number[];
}

export interface RequestBody_PayCostOfLiving {
  characters: CharacterData[];
  gp: number[];
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

// AbilityDef
export type RequestBody_CreateAbilityDef = Omit<ServerAbilityDefData, "id">;
export type RequestBody_EditAbilityDef = ServerAbilityDefData;
// Activity
export type RequestBody_CreateActivity = Omit<ServerActivityData, "id"> & {
  expectedOutcomes: ServerActivityOutcomeData[];
};
export type RequestBody_EditActivity = ServerActivityData & {
  expectedOutcomes: ServerActivityOutcomeData[];
};
// Army
export type RequestBody_CreateArmy = Omit<ArmyData, "id">;
export type RequestBody_EditArmy = ArmyData;
// Contract
export type RequestBody_CreateContract = Omit<ContractData, "id">;
export type RequestBody_EditContract = ContractData;
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
export type RequestBody_CreateMapHex = Omit<ServerMapHexData, "id">;
export type RequestBody_EditMapHex = ServerMapHexData;
// SpellDef
export type RequestBody_CreateSpellDef = Omit<ServerSpellDefData, "id">;
export type RequestBody_EditSpellDef = ServerSpellDefData;
// Storage
export type RequestBody_CreateStorage = Omit<StorageData, "id">;
export type RequestBody_EditStorage = StorageData;
// Structure
export type RequestBody_CreateStructure = Omit<StructureData, "id">;
export type RequestBody_EditStructure = StructureData;
// StructureComponent
export type RequestBody_CreateStructureComponent = Omit<StructureComponentData, "id">;
export type RequestBody_EditStructureComponent = StructureComponentData;
// StructureComponentDef
export type RequestBody_CreateStructureComponentDef = Omit<StructureComponentDefData, "id">;
export type RequestBody_EditStructureComponentDef = StructureComponentDefData;
// Troop
export type RequestBody_CreateTroop = Omit<TroopData, "id">;
export type RequestBody_EditTroop = TroopData;
// TroopDef
export type RequestBody_CreateTroopDef = Omit<TroopDefData, "id">;
export type RequestBody_EditTroopDef = TroopDefData;
// TroopInjury
export type RequestBody_CreateTroopInjury = Omit<TroopInjuryData, "id">;
export type RequestBody_EditTroopInjury = TroopInjuryData;
