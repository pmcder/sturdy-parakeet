import * as THREE from 'three';
import { createRenderer } from './renderer.js';
import { buildWorld } from './world.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { ITEMS, createPickups } from './items.js';
import { createInventory, mountInventoryUI } from './inventory.js';
import { createPreview } from './previewScene.js';
import { setSlot } from './player.js';

const canvas = document.getElementById('game');
const gfx = createRenderer(canvas);
const input = createInput(canvas);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, gfx.aspect(), 0.1, 120);

const world = buildWorld(scene);
const player = createPlayer(scene, world);
const pickups = createPickups(scene, world.pickupSpots);

const inventory = createInventory();
const invRoot = document.getElementById('inventory');
const preview = createPreview(mountInventoryUI(invRoot, inventory).canvas);
const prompt = document.getElementById('prompt');

// Keep the in-world avatar and the preview in sync with inventory changes.
inventory.onChange(() => {
  for (const slot of ['head', 'torso', 'rightHand']) {
    const item = inventory.equippedIn(slot);
    setSlot(player.avatar, slot, item ? item.buildMesh() : null);
  }
  preview.show(inventory);
});

let mode = 'play'; // 'play' | 'inventory'
function setMode(next) {
  mode = next;
  invRoot.hidden = next !== 'inventory';
  if (next === 'inventory') {
    input.releasePointer();
    preview.resize();
    preview.show(inventory);
  }
}
window.addEventListener('resize', () => mode === 'inventory' && preview.resize());

window.addEventListener('resize', () => {
  camera.aspect = gfx.aspect();
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
gfx.renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  if (input.wasPressed('KeyI') || input.wasPressed('Tab')) setMode(mode === 'play' ? 'inventory' : 'play');
  else if (mode === 'inventory' && input.wasPressed('Escape')) setMode('play');

  if (mode === 'play') {
    player.update(dt, t, input, camera);
    const near = pickups.nearest(player.position);
    prompt.textContent = near ? `[E] pick up ${ITEMS[near.id].name}` : '';
    if (near && input.wasPressed('KeyE')) { inventory.add(near.id); pickups.remove(near); }
  } else {
    prompt.textContent = '';
    preview.render(t);
  }
  pickups.update(t);
  world.update(dt, t);
  gfx.render(scene, camera, t);
  input.endFrame();
});
