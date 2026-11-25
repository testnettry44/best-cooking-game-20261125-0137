// Dapur Kilat — canvas rendering of the kitchen, stations, player and food.
// All art is drawn with canvas shapes: no images, no external assets.
import { W, H, STATIONS, COLORS, TICKET_W, TICKET_H } from './config.js';
import { COMPONENTS, RECIPES, recipeById, isPlate } from './recipes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawComponentIcon(ctx, id, x, y, size) {
  const c = COMPONENTS[id];
  if (!c) return;
  const s = size || 26;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = c.color;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  if (c.shape === 'egg') {
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 0.42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (c.shape === 'chili') {
    ctx.beginPath(); ctx.moveTo(-s * 0.5, 0); ctx.quadraticCurveTo(0, s * 0.55, s * 0.5, -s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.1, -s * 0.5, 0); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2a9d8f'; ctx.beginPath(); ctx.moveTo(s * 0.42, -s * 0.3); ctx.lineTo(s * 0.6, -s * 0.55); ctx.stroke();
  } else if (c.shape === 'drum') {
    ctx.beginPath(); ctx.arc(-s * 0.1, 0, s * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#f5f0e1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(s * 0.18, s * 0.08); ctx.lineTo(s * 0.55, s * 0.4); ctx.stroke();
  } else if (c.shape === 'noodle') {
    ctx.strokeStyle = c.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-s * 0.5, i * s * 0.22); ctx.quadraticCurveTo(0, i * s * 0.22 - s * 0.25, s * 0.5, i * s * 0.22); ctx.stroke(); }
  } else if (c.shape === 'leaf') {
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.3, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(s * 0.15, -s * 0.1, s * 0.35, s * 0.2, 0.4, 0, Math.PI * 2); ctx.fill();
  } else if (c.shape === 'drop') {
    ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.quadraticCurveTo(s * 0.45, s * 0.1, 0, s * 0.5);
    ctx.quadraticCurveTo(-s * 0.45, s * 0.1, 0, -s * 0.5); ctx.fill(); ctx.stroke();
  } else if (c.shape === 'bits') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.fillRect(Math.cos(a) * s * 0.28 - 3, Math.sin(a) * s * 0.28 - 3, 7, 7);
    }
  } else if (c.shape === 'burnt') {
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.2); ctx.lineTo(s * 0.3, s * 0.25); ctx.stroke();
  } else { // grain
    ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.arc(-s * 0.15, -s * 0.1, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.15, s * 0.12, s * 0.1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPlate(ctx, x, y, components, scale) {
  const s = scale || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e9e2d0'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 17, 0, 0, Math.PI * 2); ctx.fill();
  if (components) {
    components.forEach((id, i) => {
      const a = (i / Math.max(1, components.length)) * Math.PI * 2 - Math.PI / 2;
      drawComponentIcon(ctx, id, Math.cos(a) * 12, Math.sin(a) * 8, 18);
    });
  }
  ctx.restore();
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.save();
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(frac * 100) + '%', x, y);
  ctx.restore();
}

export function drawKitchen(ctx, state, t) {
  // Floor tiles.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 112, W, H - 112);
  ctx.fillStyle = COLORS.floorAlt;
  for (let y = 112; y < H; y += 64) for (let x = 0; x < W; x += 64) {
    if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 64, 64);
  }
  // Wall strip under the rail.
  ctx.fillStyle = COLORS.wall; ctx.fillRect(0, 112, W, 10);

  // Ingredient crates (left).
  for (const c of STATIONS.crates) {
    ctx.fillStyle = '#a4713e'; rr(ctx, c.x, c.y, c.w, c.h, 8); ctx.fill();
    ctx.fillStyle = '#c89b6a'; rr(ctx, c.x + 5, c.y + 5, c.w - 10, c.h - 10, 6); ctx.fill();
    drawComponentIcon(ctx, c.id, c.x + 30, c.y + c.h / 2, 30);
    ctx.fillStyle = '#3a2417'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(c.label, c.x + 56, c.y + c.h / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.font = '11px sans-serif';
    ctx.fillText('crate', c.x + 56, c.y + c.h / 2 + 16);
  }

  // Chopping board.
  const b = STATIONS.board;
  ctx.fillStyle = '#7c4a21'; rr(ctx, b.x - 6, b.y - 6, b.w + 12, b.h + 12, 10); ctx.fill();
  ctx.fillStyle = COLORS.board; rr(ctx, b.x, b.y, b.w, b.h, 8); ctx.fill();
  ctx.fillStyle = '#3a2417'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('CHOPPING BOARD', b.x + b.w / 2, b.y + 18);
  ctx.font = '12px sans-serif'; ctx.fillText('hold SPACE to chop', b.x + b.w / 2, b.y + b.h - 12);
  if (state.board.item) {
    drawComponentIcon(ctx, state.board.item, b.x + b.w / 2, b.y + b.h / 2 + 6, 44);
    drawProgressRing(ctx, b.x + b.w - 30, b.y + 34, 20, Math.min(1, state.board.progress), '#2a9d8f');
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = '13px sans-serif';
    ctx.fillText('bring chili / chicken / veg', b.x + b.w / 2, b.y + b.h / 2 + 8);
  }

  // Stove with 2 burners.
  const s = STATIONS.stove;
  ctx.fillStyle = COLORS.stove; rr(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
  ctx.fillStyle = '#2b2b31'; rr(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 16, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('STOVE', s.x + s.w / 2, s.y + 24);
  state.burners.forEach((burner, i) => {
    const bx = s.x + 58 + i * 104, by = s.y + 78;
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(bx, by, 36, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(bx, by, 36, 0, Math.PI * 2); ctx.stroke();
    if (burner.item) {
      const frac = Math.min(1, burner.progress);
      const col = burner.item === 'burnt' ? '#e63946' : burner.progress >= 1 ? '#ffb703' : '#f4a261';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 26, 0, Math.PI * 2); ctx.fill();
      if (burner.item !== 'burnt') drawComponentIcon(ctx, burner.item, bx, by, 30);
      else { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('BURNT', bx, by); }
      drawProgressRing(ctx, bx, by, 42, frac, burner.item === 'burnt' ? '#e63946' : '#ffb703');
      if (burner.progress >= 1 && burner.item !== 'burnt') {
        ctx.fillStyle = '#ffb703'; ctx.font = 'bold 12px sans-serif';
        ctx.fillText('READY!', bx, by - 52);
      }
      if (state.sizzle > 0 && burner.progress < 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '16px sans-serif';
        ctx.fillText('~', bx + 18, by - 30 - (t * 20 % 10));
      }
    } else {
      ctx.fillStyle = '#666'; ctx.font = '12px sans-serif'; ctx.fillText('empty', bx, by);
    }
  });

  // Sauce station.
  const sa = STATIONS.sauce;
  ctx.fillStyle = '#6d4c41'; rr(ctx, sa.x, sa.y, sa.w, sa.h, 10); ctx.fill();
  ctx.fillStyle = '#8b4513'; ctx.beginPath(); ctx.arc(sa.x + sa.w / 2, sa.y + 48, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5d2f0e'; ctx.fillRect(sa.x + sa.w / 2 - 8, sa.y + 14, 16, 18);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SAUCE', sa.x + sa.w / 2, sa.y + sa.h - 14);

  // Plating counter.
  const pl = STATIONS.plate;
  ctx.fillStyle = '#cbb98f'; rr(ctx, pl.x, pl.y, pl.w, pl.h, 10); ctx.fill();
  ctx.fillStyle = COLORS.counter; rr(ctx, pl.x + 6, pl.y + 6, pl.w - 12, pl.h - 12, 8); ctx.fill();
  ctx.fillStyle = '#3a2417'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PLATING COUNTER', pl.x + pl.w / 2, pl.y + 20);
  if (state.counterPlate) {
    drawPlate(ctx, pl.x + pl.w / 2, pl.y + 58, state.counterPlate.components, 1);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.font = '12px sans-serif';
    ctx.fillText('press E for a clean plate', pl.x + pl.w / 2, pl.y + 58);
  }

  // Serving window.
  const wn = STATIONS.window;
  ctx.fillStyle = '#8a5a3b'; rr(ctx, wn.x, wn.y, wn.w, wn.h, 10); ctx.fill();
  ctx.fillStyle = COLORS.window; rr(ctx, wn.x + 8, wn.y + 8, wn.w - 16, wn.h - 16, 8); ctx.fill();
  ctx.fillStyle = '#3a2417'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SERVE HERE', wn.x + wn.w / 2, wn.y + 28);
  ctx.font = '13px sans-serif'; ctx.fillText('bring the finished plate', wn.x + wn.w / 2, wn.y + wn.h - 16);
  ctx.fillStyle = '#fff8dc'; ctx.fillRect(wn.x + 30, wn.y + 48, wn.w - 60, 46);
  ctx.fillStyle = '#3a2417'; ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ORDER UP!', wn.x + wn.w / 2, wn.y + 76);

  // Trash bin.
  const tr = STATIONS.trash;
  ctx.fillStyle = COLORS.trash; rr(ctx, tr.x, tr.y, tr.w, tr.h, 10); ctx.fill();
  ctx.fillStyle = '#565d6e'; rr(ctx, tr.x + 12, tr.y + 12, tr.w - 24, tr.h - 24, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('TRASH', tr.x + tr.w / 2, tr.y + tr.h - 14);
  ctx.fillStyle = '#9aa0a6'; ctx.font = '20px sans-serif'; ctx.fillText('🗑', tr.x + tr.w / 2, tr.y + 44);

  // Particles.
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  drawPlayer(ctx, state, t);
}

export function drawPlayer(ctx, state, t) {
  const p = state.player;
  const bob = p.moving ? Math.sin(t * 14) * 2 : 0;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 20 - bob, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Body (chef whites + apron).
  ctx.fillStyle = '#ffffff'; rr(ctx, -18, -8, 36, 30, 10); ctx.fill();
  ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 2; rr(ctx, -18, -8, 36, 30, 10); ctx.stroke();
  ctx.fillStyle = '#2a9d8f'; ctx.fillRect(-18, 4, 36, 16);
  // Head + toque.
  ctx.fillStyle = '#f2c89b'; ctx.beginPath(); ctx.arc(0, -18, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-7, -30, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -33, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -30, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-13, -30, 26, 8);
  // Eyes look in facing direction.
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(p.dir * 3 - 4, -18, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.dir * 3 + 5, -18, 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Held item above the head.
  const held = state.held;
  if (held) {
    ctx.save();
    ctx.translate(p.x, p.y - 52);
    if (isPlate(held)) drawPlate(ctx, 0, 0, held.components, 0.85);
    else drawComponentIcon(ctx, held.id, 0, 0, 34);
    ctx.restore();
  }
}

export function drawPopups(ctx, state) {
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.life);
    ctx.font = 'bold 20px sans-serif';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
}

export { drawPlate, drawComponentIcon, drawProgressRing, rr };
