export interface RequestBody_CreateCharacter {
  userId: number;
  name: string;
  gender: string;
  portraitURL: string;
  className: string;
  level: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  xp: number;
  hp: number;
  hitDice: string;
}

export interface RequestBody_EncryptString {
  text: string;
}

export interface RequestBody_LogIn {
  name: string;
  pass: string;
}
