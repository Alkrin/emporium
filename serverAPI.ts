import { UserRole } from "./redux/userSlice";
import {
  RequestBody_CreateCharacter,
  RequestBody_EncryptString,
  RequestBody_LogIn,
} from "./serverRequestTypes";

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
  userId: number;
  name: string;
  gender: Gender;
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
  hitDice: number[];
}

export type LogInResult = ServerError | UserData;
export type CharactersResult = ServerError | CharacterData[];

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
    return await res.json();
  }

  async createCharacter(character: CharacterData): Promise<CharactersResult> {
    const requestBody: RequestBody_CreateCharacter = {
      ...character,
      // Stored on the server as a comma separated string.
      hitDice: character.hitDice.join(","),
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
}

const ServerAPI = new AServerAPI();
export default ServerAPI;
