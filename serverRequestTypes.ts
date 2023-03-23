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
