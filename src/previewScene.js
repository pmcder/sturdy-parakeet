import * as THREE from 'three';
import { createAvatar, setSlot } from './player.js';

const SLOTS = ['head', 'torso', 'rightHand'];

// Separate scene and renderer showing a rotating avatar for the inventory try-on.
export function createPreview(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 1.5, 5.2);
  camera.lookAt(0, 1.2, 0);

  scene.add(new THREE.HemisphereLight(0x8a7bff, 0x1a0f30, 1.1));
  const key = new THREE.PointLight(0x19f3ff, 40, 20, 2); key.position.set(3, 3, 3);
  const rim = new THREE.PointLight(0xff2bd6, 40, 20, 2); rim.position.set(-3, 2, -2);
  scene.add(key, rim);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.0, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x15122a, emissive: 0x19f3ff, emissiveIntensity: 0.35 }),
  );
  pedestal.position.y = -0.06;
  scene.add(pedestal);

  const avatar = createAvatar();
  scene.add(avatar.group);

  return {
    // Show what's equipped, with `selected` tried on in its slot (overriding that slot).
    show(inventory) {
      const sel = inventory.selected();
      for (const slot of SLOTS) {
        const item = sel && sel.slot === slot ? sel : inventory.equippedIn(slot);
        setSlot(avatar, slot, item ? item.buildMesh() : null);
      }
    },
    resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    render(t) {
      avatar.group.rotation.y = t * 0.8;
      avatar.animate(t, 0);
      renderer.render(scene, camera);
    },
  };
}
