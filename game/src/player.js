// Dapur Kilat — player movement with simple station collision.
import { PLAYER_SPEED, PLAYER_R, STATIONS } from './config.js';

function collide(p) {
  // Keep inside the kitchen floor (below the order rail).
  const minX = 24 + PLAYER_R, maxX = 1280 - 24 - PLAYER_R;
  const minY = 128 + PLAYER_R, maxY = 720 - 16 - PLAYER_R;
  p.x = Math.max(minX, Math.min(maxX, p.x));
  p.y = Math.max(minY, Math.min(maxY, p.y));
  // Push out of solid station rectangles.
  const solids = [
    ...STATIONS.crates,
    STATIONS.board, STATIONS.stove, STATIONS.sauce, STATIONS.plate, STATIONS.window, STATIONS.trash,
  ];
  for (const r of solids) {
    const cx = Math.max(r.x, Math.min(p.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(p.y, r.y + r.h));
    const dx = p.x - cx, dy = p.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 < PLAYER_R * PLAYER_R) {
      if (d2 === 0) { p.y = r.y + r.h + PLAYER_R; continue; }
      const d = Math.sqrt(d2);
      p.x = cx + (dx / d) * PLAYER_R;
      p.y = cy + (dy / d) * PLAYER_R;
    }
  }
}

export function updatePlayer(state, dt, input) {
  const p = state.player;
  let ax = 0, ay = 0;
  const k = input.keys;
  if (k.has('a') || k.has('arrowleft')) ax -= 1;
  if (k.has('d') || k.has('arrowright')) ax += 1;
  if (k.has('w') || k.has('arrowup')) ay -= 1;
  if (k.has('s') || k.has('arrowdown')) ay += 1;
  if (p.moveTarget && (ax || ay)) p.moveTarget = null; // keys override click-to-move
  if (!ax && !ay && p.moveTarget) {
    const dx = p.moveTarget.x - p.x, dy = p.moveTarget.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) { p.moveTarget = null; }
    else { ax = dx / d; ay = dy / d; }
  }
  if (ax || ay) {
    const len = Math.hypot(ax, ay) || 1;
    p.x += (ax / len) * PLAYER_SPEED * dt;
    p.y += (ay / len) * PLAYER_SPEED * dt;
    p.dir = ax < 0 ? -1 : ax > 0 ? 1 : p.dir;
    p.moving = true;
  } else {
    p.moving = false;
  }
  collide(p);
}
