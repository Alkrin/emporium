import { LocalStore } from "../lib/localStore";

const keyDashboardCharacterId = "dashboardCharacterId";

class DashboardLocalStore extends LocalStore {
  constructor() {
    super("dashboard");
  }

  getDashboardCharacterId(): number {
    const characterId = this.getItem<number>(keyDashboardCharacterId) ?? 0;
    return characterId;
  }

  setDashboardCharacterId(id: number): void {
    this.setItem(keyDashboardCharacterId, id);
  }
}

export const dashboardLocalStore = new DashboardLocalStore();
