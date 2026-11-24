import * as THREE from 'three';
import { createRenderer } from './renderer.js';
import { buildWorld } from './world.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';

const canvas = document.getElementById('game');
const gfx = createRenderer(canvas);
const input = createInput(canvas);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, gfx.aspect(), 0.1, 120);

const world = buildWorld(scene);
const player = createPlayer(scene, world);

window.addEventListener('resize', () => {
  camera.aspect = gfx.aspect();
  camera.updateProjectionMatrix();
});

const clock = new THREE.Clock();
gfx.renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  player.update(dt, t, input, camera);
  world.update(dt, t);
  gfx.render(scene, camera, t);
  input.endFrame();
});
