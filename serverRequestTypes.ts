import { Dictionary } from "./lib/dictionary";
import {
  ActivityData,
  ActivityOutcomeData,
  CharacterEquipmentData,
  EquipmentSetData,
  EquipmentSetItemData,
  ProficiencyData,
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

export interface RequestBody_DeleteSpellbook {
  spellbook_id: number;
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

export interface RequestBody_CreateItemDef {
  name: string;
  description: string;
  stones: number;
  sixth_stones: number;
  storage_stones: number;
  storage_sixth_stones: number;
  storage_filters: string;
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
  tags: string;
  purchase_quantity: number;
  cost_gp: number;
  cost_sp: number;
  cost_cp: number;
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
}

export interface RequestBody_EditItemDef {
  id: number;
  name: string;
  description: string;
  stones: number;
  sixth_stones: number;
  storage_stones: number;
  storage_sixth_stones: number;
  storage_filters: string;
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
  tags: string;
  purchase_quantity: number;
  cost_gp: number;
  cost_sp: number;
  cost_cp: number;
}

export interface RequestBody_DeleteItemDef {
  itemDefId: number;
}

export interface RequestBody_CreateSpellDef {
  name: string;
  description: string;
  spell_range: string;
  duration: string;
  tags: string;
  type_levels: string;
  table_image: string;
}

export interface RequestBody_EditSpellDef {
  id: number;
  name: string;
  description: string;
  spell_range: string;
  duration: string;
  tags: string;
  type_levels: string;
  table_image: string;
}

export interface RequestBody_DeleteSpellDef {
  spellDefId: number;
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
  characterId: number;
  gp: number;
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

export interface RequestBody_DeleteEquipmentSet {
  setId: number;
}

export interface RequestBody_CreateActivity {
  user_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: string;
}

export interface RequestBody_EditActivity {
  id: number;
  user_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  participants: string;
  resolution_text: string;
}

export interface RequestBody_DeleteActivity {
  activityId: number;
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

export interface RequestBody_CreateMap {
  name: string;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

export interface RequestBody_EditMap {
  id: number;
  name: string;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

export interface RequestBody_DeleteMap {
  mapId: number;
}

export interface RequestBody_CreateMapHex {
  map_id: number;
  x: number;
  y: number;
  type: string;
}

export interface RequestBody_EditMapHex {
  id: number;
  map_id: number;
  x: number;
  y: number;
  type: string;
}

export interface RequestBody_DeleteMapHex {
  hexId: number;
}
