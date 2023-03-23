import { UserRole } from "./redux/userSlice";
import {
  RequestBody_SetXP,
  RequestBody_CreateCharacter,
  RequestBody_EncryptString,
  RequestBody_LogIn,
  RequestBody_SetHP,
  RequestBody_UpdateProficiencies,
} from "./serverRequestTypes";
import { ProficiencySource } from "./staticData/types/abilitiesAndProficiencies";

export interface ServerError {
  error: string;
}

export interface UserData {
  id: number;
  name: string;
  role: UserRole;
}

export type Gender = "m" | "f" | "o";

export interface CharacterData {
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
}

export interface ProficiencyData {
  character_id: number;
  name: string;
  subtype: string;
  source: ProficiencySource;
}

type ServerCharacterData = Omit<CharacterData, "hit_dice"> & { hit_dice: string };

export interface XPChange {
  newXPValue: number;
}

export interface HPChange {
  newHPValue: number;
}

export type LogInResult = ServerError | UserData;
export type CharactersResult = ServerError | CharacterData[];
export type UsersResult = ServerError | UserData[];
export type ProficienciesResult = ServerError | ProficiencyData[];
export type SetHPResult = ServerError | HPChange;
export type SetXPResult = ServerError | XPChange;
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

  async createCharacter(character: CharacterData): Promise<CharactersResult> {
    const requestBody: RequestBody_CreateCharacter = {
      ...character,
      // Stored on the server as a comma separated string.
      hit_dice: character.hit_dice.join(","),
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
}

const ServerAPI = new AServerAPI();
export default ServerAPI;
