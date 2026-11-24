import * as THREE from 'three';
import { createRenderer } from './renderer.js';

const gfx = createRenderer(document.getElementById('game'));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07060f);
const camera = new THREE.PerspectiveCamera(60, gfx.aspect(), 0.1, 100);
camera.position.set(0, 1, 3);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff2bd6, wireframe: true }),
);
scene.add(cube);

window.addEventListener('resize', () => {
  camera.aspect = gfx.aspect();
  camera.updateProjectionMatrix();
});

gfx.renderer.setAnimationLoop((t) => {
  cube.rotation.y = t / 1000;
  cube.rotation.x = t / 1700;
  gfx.render(scene, camera, t / 1000);
});
