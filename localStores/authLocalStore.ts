import { LocalStore } from "../lib/localStore";

const keyLastAuthedPlayerName = "lastAuthedPlayerName";

class AuthLocalStore extends LocalStore {
  constructor() {
    super("auth");
  }

  getLastAuthedPlayerName(): string {
    const lastName = this.getItem<string>(keyLastAuthedPlayerName) ?? "";
    return lastName;
  }

  setLastAuthedPlayerName(name: string): void {
    this.setItem(keyLastAuthedPlayerName, name);
  }
}

export const authLocalStore = new AuthLocalStore();
