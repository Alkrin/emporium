import { ProficiencyData } from "./serverAPI";

export interface RequestBody_CreateCharacter {
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

export interface RequestBody_UpdateProficiencies {
  character_id: number;
  proficiencies: ProficiencyData[];
}
