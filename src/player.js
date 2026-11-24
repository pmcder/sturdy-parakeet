import * as THREE from 'three';
import { resolveMovement } from './world.js';

const SKIN = new THREE.MeshStandardMaterial({ color: 0xd9a88a, roughness: 0.8 });
const SUIT = new THREE.MeshStandardMaterial({ color: 0x2a2a4a, roughness: 0.7 });
const TRIM = new THREE.MeshBasicMaterial({ color: 0x19f3ff });

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

// Blocky avatar. Items attach to the named slot groups.
// Slots: head (top of head), torso (centre of chest), rightHand (grip point).
export function createAvatar() {
  const group = new THREE.Group();
  const torsoMesh = box(0.7, 0.9, 0.4, SUIT, 0, 1.25, 0);
  const head = box(0.45, 0.45, 0.45, SKIN, 0, 1.95, 0);
  const legL = box(0.28, 0.8, 0.3, SUIT, -0.18, 0.4, 0);
  const legR = box(0.28, 0.8, 0.3, SUIT, 0.18, 0.4, 0);
  const armL = new THREE.Group(); armL.position.set(-0.5, 1.6, 0);
  armL.add(box(0.22, 0.8, 0.25, SUIT, 0, -0.4, 0));
  const armR = new THREE.Group(); armR.position.set(0.5, 1.6, 0);
  armR.add(box(0.22, 0.8, 0.25, SUIT, 0, -0.4, 0));
  group.add(torsoMesh, head, legL, legR, armL, armR, box(0.7, 0.06, 0.41, TRIM, 0, 1.0, 0));

  const slots = {
    head: new THREE.Group(),
    torso: new THREE.Group(),
    rightHand: new THREE.Group(),
  };
  slots.head.position.set(0, 1.95, 0);
  slots.torso.position.set(0, 1.25, 0);
  slots.rightHand.position.set(0, -0.85, 0.1); // end of the right arm
  group.add(slots.head, slots.torso);
  armR.add(slots.rightHand);

  // Idle/walk animation; speed01 in [0, 1].
  function animate(t, speed01) {
    const s = Math.sin(t * 9) * 0.7 * speed01;
    legL.rotation.x = s; legR.rotation.x = -s;
    armL.rotation.x = -s;
    armR.rotation.x = s * 0.6 - (slots.rightHand.children.length ? 0.3 : 0);
    group.position.y = Math.abs(Math.sin(t * 9)) * 0.05 * speed01;
  }
  return { group, slots, animate };
}

// Replace whatever is in a slot with the given mesh (or nothing).
export function setSlot(avatar, slot, mesh) {
  const g = avatar.slots[slot];
  g.clear();
  if (mesh) g.add(mesh);
}

export function createPlayer(scene, world) {
  const avatar = createAvatar();
  scene.add(avatar.group);
  const pos = avatar.group.position;
  pos.copy(world.spawn);

  let yaw = 0, pitch = 0.35, facing = 0, speed01 = 0;
  const RADIUS = 0.45, SPEED = 6;
  const camTarget = new THREE.Vector3();

  return {
    avatar,
    position: pos,
    update(dt, t, input, camera) {
      const look = input.consumeLook();
      yaw -= look.x * 0.0025;
      pitch = Math.max(0.05, Math.min(1.1, pitch + look.y * 0.0025));
      if (input.isDown('ArrowLeft')) yaw += 2 * dt;
      if (input.isDown('ArrowRight')) yaw -= 2 * dt;

      let fx = 0, fz = 0;
      if (input.isDown('KeyW')) fz -= 1;
      if (input.isDown('KeyS')) fz += 1;
      if (input.isDown('KeyA')) fx -= 1;
      if (input.isDown('KeyD')) fx += 1;
      const moving = fx !== 0 || fz !== 0;
      if (moving) {
        const len = Math.hypot(fx, fz);
        fx /= len; fz /= len;
        const sin = Math.sin(yaw), cos = Math.cos(yaw);
        const wx = fx * cos + fz * sin;
        const wz = -fx * sin + fz * cos;
        pos.x += wx * SPEED * dt;
        pos.z += wz * SPEED * dt;
        resolveMovement(pos, RADIUS, world.colliders);
        const target = Math.atan2(wx, wz);
        let diff = target - facing;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        facing += diff * Math.min(1, dt * 14);
      }
      speed01 += ((moving ? 1 : 0) - speed01) * Math.min(1, dt * 10);
      avatar.group.rotation.y = facing;
      avatar.animate(t, speed01);

      // Third-person follow camera
      const dist = 6;
      camTarget.set(pos.x, 1.6, pos.z);
      camera.position.set(
        pos.x + Math.sin(yaw) * Math.cos(pitch) * dist,
        1.6 + Math.sin(pitch) * dist,
        pos.z + Math.cos(yaw) * Math.cos(pitch) * dist,
      );
      camera.lookAt(camTarget);
    },
  };
}
