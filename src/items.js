import * as THREE from 'three';

const glow = (color) => new THREE.MeshBasicMaterial({ color });
const dark = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.4 });

function part(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

// slot: where on the avatar the item attaches (see createAvatar in player.js).
export const ITEMS = {
  sword: {
    id: 'sword', name: 'Plasma Blade', slot: 'rightHand',
    desc: 'Monofilament edge, humming cyan. Illegal in three districts.',
    buildMesh() {
      const g = new THREE.Group();
      g.add(part(new THREE.BoxGeometry(0.07, 1.0, 0.025), glow(0x19f3ff), 0, 0.6, 0));
      g.add(part(new THREE.BoxGeometry(0.3, 0.06, 0.08), dark(0x333355), 0, 0.08, 0));
      g.add(part(new THREE.BoxGeometry(0.06, 0.26, 0.06), dark(0x222233), 0, -0.08, 0));
      g.rotation.x = Math.PI / 2; // point the blade forward from the hand
      return g;
    },
  },
  visor: {
    id: 'visor', name: 'Neon Visor', slot: 'head',
    desc: 'Overlays the street with a magenta HUD nobody asked for.',
    buildMesh() {
      const g = new THREE.Group();
      g.add(part(new THREE.BoxGeometry(0.52, 0.13, 0.1), glow(0xff2bd6), 0, 0.02, 0.22));
      g.add(part(new THREE.BoxGeometry(0.5, 0.05, 0.5), dark(0x222233), 0, 0.2, 0));
      return g;
    },
  },
  jacket: {
    id: 'jacket', name: 'Chrome Jacket', slot: 'torso',
    desc: 'Reflective shell with amber piping. Rain beads right off.',
    buildMesh() {
      const g = new THREE.Group();
      g.add(part(new THREE.BoxGeometry(0.8, 0.7, 0.5), dark(0x7a2a8a), 0, 0.1, 0));
      g.add(part(new THREE.BoxGeometry(0.82, 0.05, 0.52), glow(0xffb02e), 0, -0.2, 0));
      return g;
    },
  },
};

export const ITEM_IDS = Object.keys(ITEMS);

// Glowing floating pickups placed at the given spots (one item per spot).
export function createPickups(scene, spots) {
  const list = ITEM_IDS.slice(0, spots.length).map((id, i) => {
    const group = new THREE.Group();
    const orb = part(new THREE.OctahedronGeometry(0.35), glow(0xffb02e), 0, 1, 0);
    const beam = part(new THREE.BoxGeometry(0.05, 2, 0.05), glow(0xffb02e), 0, 1, 0);
    beam.material.transparent = true; beam.material.opacity = 0.35;
    group.add(orb, beam);
    group.position.copy(spots[i]);
    scene.add(group);
    const light = new THREE.PointLight(0xffb02e, 6, 6, 2);
    light.position.set(0, 1, 0);
    group.add(light);
    return { id, group, orb };
  });

  return {
    update(t) {
      for (const p of list) {
        p.orb.rotation.y = t * 2;
        p.orb.position.y = 1 + Math.sin(t * 2 + p.group.position.x) * 0.15;
      }
    },
    // Nearest pickup within `range` of pos, or null.
    nearest(pos, range = 2) {
      let best = null, bestD = range;
      for (const p of list) {
        const d = Math.hypot(p.group.position.x - pos.x, p.group.position.z - pos.z);
        if (d < bestD) { best = p; bestD = d; }
      }
      return best;
    },
    remove(p) {
      scene.remove(p.group);
      list.splice(list.indexOf(p), 1);
    },
  };
}
