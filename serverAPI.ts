import { UserRole } from "./redux/userSlice";
import {
  RequestBody_SetXP,
  RequestBody_CreateCharacter,
  RequestBody_EncryptString,
  RequestBody_LogIn,
  RequestBody_SetHP,
  RequestBody_UpdateProficiencies,
  RequestBody_CreateItemDef,
  RequestBody_EditItemDef,
  RequestBody_DeleteItemDef,
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
export type CharactersResult = ServerError | CharacterData[];
export type ItemDefsResult = ServerError | ItemDefData[];
export type UsersResult = ServerError | UserData[];
export type ProficienciesResult = ServerError | ProficiencyData[];
export type SetHPResult = ServerError | HPChange;
export type SetXPResult = ServerError | XPChange;
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
        itemData.push({
          ...sItemData,
          tags: sItemData.tags.split(","),
          storage_filters: sItemData.storage_filters.split(","),
        });
      });

      return itemData;
    }
  }

  async createCharacter(character: CharacterData): Promise<NoDataResult> {
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
