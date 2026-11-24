import * as THREE from 'three';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07060f);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 1, 3);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff2bd6, wireframe: true }),
);
scene.add(cube);

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop((t) => {
  cube.rotation.y = t / 1000;
  cube.rotation.x = t / 1700;
  renderer.render(scene, camera);
});
