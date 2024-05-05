/**
 * Provides auto-prefixed localStorage access.
 * Best practice is to create a subclass of LocalStore and implement well-typed getter/setter functions
 * for the values you want to store and retrieve.
 */
export abstract class LocalStore {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  protected getItem<T>(key: string): T | undefined {
    const raw = localStorage.getItem(this.prefixedKey(key));
    if (!raw) {
      return undefined;
    } else {
      try {
        return JSON.parse(raw) as T;
      } catch (error) {
        return undefined;
      }
    }
  }

  protected setItem(key: string, value: any): void {
    localStorage.setItem(this.prefixedKey(key), JSON.stringify(value));
  }

  protected removeItem(key: string): void {
    localStorage.removeItem(this.prefixedKey(key));
  }

  private prefixedKey(key: string): string {
    return `${this.name}\\${key}`;
  }
}
