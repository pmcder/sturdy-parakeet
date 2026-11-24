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

// DOM for the inventory screen. `root` is the overlay element; `canvas` is created inside it.
export function mountInventoryUI(root, inv) {
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  const panel = el('div', 'inv-panel');
  const left = el('div', 'inv-left');
  left.append(el('h2', '', '// INVENTORY'));
  const list = el('ul', 'inv-list');
  left.append(list);
  const right = el('div', 'inv-right');
  const canvas = el('canvas', 'inv-preview');
  const name = el('h3', 'inv-name');
  const desc = el('p', 'inv-desc');
  const equipBtn = el('button', 'inv-equip', 'EQUIP');
  const hint = el('p', 'inv-hint', 'I / TAB / ESC to close');
  right.append(canvas, name, desc, equipBtn, hint);
  panel.append(left, right);
  root.append(panel);

  equipBtn.addEventListener('click', () => {
    const sel = inv.selected();
    if (sel) inv.toggleEquip(sel.id);
  });

  function refresh() {
    list.replaceChildren();
    const items = inv.items();
    if (!items.length) list.append(el('li', 'inv-empty', 'Empty. Go find something.'));
    for (const item of items) {
      const li = el('li', 'inv-item' + (inv.selected()?.id === item.id ? ' selected' : ''));
      li.textContent = (inv.isEquipped(item.id) ? '[E] ' : '    ') + item.name;
      li.addEventListener('click', () => inv.select(item.id));
      list.append(li);
    }
    const sel = inv.selected();
    name.textContent = sel ? sel.name : '';
    desc.textContent = sel ? sel.desc : '';
    equipBtn.hidden = !sel;
    if (sel) equipBtn.textContent = inv.isEquipped(sel.id) ? 'UNEQUIP' : 'EQUIP';
  }
  inv.onChange(refresh);
  refresh();
  return { canvas };
}
