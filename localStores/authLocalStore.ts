import { LocalStore } from "../lib/localStore";

const keyLastAuthedPlayerName = "lastAuthedPlayerName";

class AuthLocalStore extends LocalStore {
  constructor() {
    super("auth");
  }

  getLastAuthedPlayerName(): string {
    const lastNameRaw = this.getItem(keyLastAuthedPlayerName) ?? "";

    try {
      return JSON.parse(lastNameRaw);
    } catch (error) {
      return "";
    }
  }

  setLastAuthedPlayerName(name: string): void {
    this.setItem(keyLastAuthedPlayerName, name);
  }
}

export const authLocalStore = new AuthLocalStore();
