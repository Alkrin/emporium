import store from "../redux/store";
import { StorageData } from "../serverAPI";

export function getAllStorageAssociatedItemIds(storageId: number): number[] {
  const redux = store.getState();
  const storage = redux.storages.allStorages[storageId];
  if (!storage) {
    return [];
  }

  // Start by getting items directly contained in the storage.
  const finalItemIds: number[] = Object.values(redux.items.allItems)
    .filter((item) => {
      return item.storage_id === storageId;
    })
    .map((item2) => item2.id);

  // Contained items.
  // Breadth First Search to find all nested items.
  let activeItemIds: number[] = [...finalItemIds];
  while (activeItemIds.length > 0) {
    // Find all items contained inside the active items.
    const containedItems = Object.values(redux.items.allItems).filter((item) => {
      return activeItemIds.includes(item.container_id);
    });
    // Save this layer of items and dig down to the next.
    activeItemIds = containedItems.map((i) => {
      return i.id;
    });
    finalItemIds.push(...activeItemIds);
  }

  return finalItemIds;
}

export function getStorageDisplayName(sId: number): string {
  const redux = store.getState();
  const s = redux.storages.allStorages[sId];

  if (!s) {
    return "---";
  }

  const character = redux.characters.characters[s.owner_id];
  return s.name.includes("Personal Pile") ? `${character.name}'s Personal Pile` : s.name;
}
