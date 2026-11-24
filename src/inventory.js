import { ITEMS } from './items.js';

// Inventory state. Pure data and callbacks; no DOM here.
export function createInventory() {
  const owned = [];            // item ids in pickup order
  const equipped = {};         // slot -> item id
  let selectedId = null;
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  return {
    onChange(fn) { listeners.add(fn); },
    items: () => owned.map((id) => ITEMS[id]),
    selected: () => (selectedId ? ITEMS[selectedId] : null),
    equippedIn: (slot) => (equipped[slot] ? ITEMS[equipped[slot]] : null),
    isEquipped: (id) => equipped[ITEMS[id].slot] === id,
    equippedSlots: () => Object.keys(equipped),
    add(id) {
      if (owned.includes(id)) return;
      owned.push(id);
      if (!selectedId) selectedId = id;
      emit();
    },
    select(id) { if (owned.includes(id)) { selectedId = id; emit(); } },
    toggleEquip(id) {
      const slot = ITEMS[id].slot;
      if (equipped[slot] === id) delete equipped[slot];
      else equipped[slot] = id;
      emit();
    },
  };
}
