import * as THREE from 'three';

export const WORLD_HALF = 30; // world spans [-30, 30] on x and z
const NEON = [0xff2bd6, 0x19f3ff, 0xffb02e, 0x8a5bff];

// Small deterministic PRNG so the world is identical every load.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function windowTexture(rand) {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 32, 64);
  for (let y = 2; y < 64; y += 6) {
    for (let x = 2; x < 32; x += 6) {
      if (rand() < 0.45) {
        g.fillStyle = ['#19f3ff', '#ffb02e', '#ff2bd6'][Math.floor(rand() * 3)];
        g.fillRect(x, y, 3, 4);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function buildWorld(scene) {
  const rand = mulberry32(2077);
  const colliders = [];
  const pickupSpots = [];
  const animated = [];

  scene.fog = new THREE.FogExp2(0x0b0818, 0.035);
  scene.background = new THREE.Color(0x0b0818);
  scene.add(new THREE.HemisphereLight(0x4a3a9a, 0x120a24, 0.8));
  const moon = new THREE.DirectionalLight(0x6a7cff, 0.4);
  moon.position.set(-10, 20, 5);
  scene.add(moon);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_HALF * 2 + 20, WORLD_HALF * 2 + 20),
    new THREE.MeshStandardMaterial({ color: 0x0e0c1c, roughness: 0.25, metalness: 0.6 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const addCollider = (x, z, w, d) =>
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

  const winTex = windowTexture(rand);

  function addBuilding(x, z, w, d, h) {
    const tex = winTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 4)));
    const mat = new THREE.MeshStandardMaterial({
      color: 0x15122a, roughness: 0.8, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9,
    });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(x, h / 2, z);
    scene.add(b);
    addCollider(x, z, w, d);
    return b;
  }

  // Perimeter ring of buildings, leaving a plaza in the middle.
  const ring = [];
  for (let i = -2; i <= 2; i++) {
    ring.push([i * 11, -WORLD_HALF + 5], [i * 11, WORLD_HALF - 5]);
    if (i !== 0) ring.push([-WORLD_HALF + 5, i * 11], [WORLD_HALF - 5, i * 11]);
  }
  let signCount = 0;
  for (const [x, z] of ring) {
    const w = 7 + rand() * 3, d = 7 + rand() * 3, h = 8 + rand() * 18;
    addBuilding(x, z, w, d, h);
    // Neon sign facing the plaza
    const color = NEON[Math.floor(rand() * NEON.length)];
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3 + rand() * 2, 0.8, 0.15),
      new THREE.MeshBasicMaterial({ color }),
    );
    const toCenter = new THREE.Vector2(-x, -z).normalize();
    sign.position.set(x + toCenter.x * (d / 2 + 0.2), 4 + rand() * 3, z + toCenter.y * (d / 2 + 0.2));
    sign.lookAt(0, sign.position.y, 0);
    scene.add(sign);
    if (signCount++ % 3 === 0) {
      const light = new THREE.PointLight(color, 25, 16, 2);
      light.position.copy(sign.position).addScaledVector(new THREE.Vector3(toCenter.x, 0, toCenter.y), 1.5);
      scene.add(light);
    }
  }

  // Street lamps and crates inside the plaza
  for (const [x, z] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4, 0.2), new THREE.MeshStandardMaterial({ color: 0x222036 }));
    pole.position.set(x, 2, z);
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), new THREE.MeshBasicMaterial({ color: 0xffb02e }));
    bulb.position.set(x, 4.1, z);
    scene.add(pole, bulb);
    addCollider(x, z, 0.4, 0.4);
  }
  for (let i = 0; i < 8; i++) {
    const s = 1 + rand() * 0.8;
    const x = (rand() - 0.5) * 36, z = (rand() - 0.5) * 36;
    if (Math.hypot(x, z) < 4) continue; // keep spawn clear
    const crate = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), new THREE.MeshStandardMaterial({ color: 0x2a2145, roughness: 0.9 }));
    crate.position.set(x, s / 2, z);
    crate.rotation.y = rand() * Math.PI;
    scene.add(crate);
    addCollider(x, z, s * 1.2, s * 1.2);
    if (i < 3) pickupSpots.push(new THREE.Vector3(x + s, 0, z + s));
  }
  while (pickupSpots.length < 3) pickupSpots.push(new THREE.Vector3(6 + pickupSpots.length * 3, 0, 5));

  // Rain
  const RAIN = 1500;
  const rainPos = new Float32Array(RAIN * 3);
  for (let i = 0; i < RAIN; i++) {
    rainPos[i * 3] = (rand() - 0.5) * 70;
    rainPos[i * 3 + 1] = rand() * 30;
    rainPos[i * 3 + 2] = (rand() - 0.5) * 70;
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x7fd8ff, size: 0.12, transparent: true, opacity: 0.6 }));
  scene.add(rain);
  animated.push((dt) => {
    for (let i = 0; i < RAIN; i++) {
      rainPos[i * 3 + 1] -= dt * 22;
      if (rainPos[i * 3 + 1] < 0) rainPos[i * 3 + 1] = 30;
    }
    rainGeo.attributes.position.needsUpdate = true;
  });

  return {
    colliders,
    pickupSpots,
    spawn: new THREE.Vector3(0, 0, 0),
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}

// Resolve a circle (player) against AABB colliders and world bounds.
export function resolveMovement(pos, radius, colliders) {
  const lim = WORLD_HALF - radius;
  pos.x = Math.max(-lim, Math.min(lim, pos.x));
  pos.z = Math.max(-lim, Math.min(lim, pos.z));
  for (const c of colliders) {
    const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
    const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
    const dx = pos.x - cx, dz = pos.z - cz;
    const dist2 = dx * dx + dz * dz;
    if (dist2 < radius * radius) {
      if (dist2 > 1e-8) {
        const dist = Math.sqrt(dist2);
        pos.x = cx + (dx / dist) * radius;
        pos.z = cz + (dz / dist) * radius;
      } else {
        // Centre is inside the box: push out along the shallowest axis.
        const pushes = [
          [pos.x - c.minX + radius, -1, 0], [c.maxX - pos.x + radius, 1, 0],
          [pos.z - c.minZ + radius, 0, -1], [c.maxZ - pos.z + radius, 0, 1],
        ].sort((a, b) => a[0] - b[0])[0];
        pos.x += pushes[1] * pushes[0];
        pos.z += pushes[2] * pushes[0];
      }
    }
  }
}
