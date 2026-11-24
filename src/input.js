// Keyboard and mouse state. Pointer lock gives mouse-look while playing.
export function createInput(canvas) {
  const down = new Set();
  const pressed = new Set(); // edge-triggered, cleared each frame
  let lookX = 0, lookY = 0;

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') e.preventDefault();
    if (!e.repeat) pressed.add(e.code);
    down.add(e.code);
  });
  window.addEventListener('keyup', (e) => down.delete(e.code));
  window.addEventListener('blur', () => down.clear());

  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
  });
  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) { lookX += e.movementX; lookY += e.movementY; }
  });

  return {
    isDown: (code) => down.has(code),
    wasPressed: (code) => pressed.has(code),
    // Accumulated mouse delta since last call.
    consumeLook() { const r = { x: lookX, y: lookY }; lookX = lookY = 0; return r; },
    releasePointer() { if (document.pointerLockElement) document.exitPointerLock(); },
    endFrame() { pressed.clear(); },
  };
}
