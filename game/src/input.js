// Dapur Kilat — keyboard + mouse input. Keys are tracked as a live set so the
// playtester can hold keys and measure movement deltas.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // edge-triggered, consumed by the loop
  let mouse = { x: 0, y: 0, clicked: false, down: false };

  function keyName(e) {
    return e.key.toLowerCase();
  }

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    if (!keys.has(k)) pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(keyName(e)));
  window.addEventListener('blur', () => { keys.clear(); });

  function toGame(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 1280,
      y: ((e.clientY - r.top) / r.height) * 720,
    };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = toGame(e);
    mouse = { x: p.x, y: p.y, clicked: true, down: true };
  });
  canvas.addEventListener('pointerup', () => { mouse.down = false; });
  canvas.addEventListener('pointermove', (e) => {
    if (mouse.down) { const p = toGame(e); mouse.x = p.x; mouse.y = p.y; }
  });

  return {
    keys, pressed, mouse,
    consumeClick() { const c = mouse.clicked; mouse.clicked = false; return c ? { x: mouse.x, y: mouse.y } : null; },
    wasPressed(k) { if (pressed.has(k)) { pressed.delete(k); return true; } return false; },
    clearPressed() { pressed.clear(); },
  };
}
