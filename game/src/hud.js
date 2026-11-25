// Dapur Kilat — HUD: order rail, timer, score, hearts, combo, held-item readout.
import { W, TICKET_W, TICKET_H, COLORS } from './config.js';
import { RECIPES, recipeById, COMPONENTS, itemLabel } from './recipes.js';
import { drawComponentIcon } from './render.js';

function mmss(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

export function drawHUD(ctx, state) {
  // Order rail.
  ctx.fillStyle = COLORS.rail; ctx.fillRect(0, 0, W, 112);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('DAPUR KILAT — ORDER BOARD', 16, 26);
  ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif';
  ctx.fillText('Serve the exact dish before patience runs out!', 16, 46);

  // Tickets.
  state.tickets.forEach((t, i) => {
    const recipe = recipeById(t.recipeId);
    const x = 330 + i * (TICKET_W + 12), y = 10;
    const frac = Math.max(0, t.patience / t.patienceMax);
    const low = frac < 0.3;
    ctx.save();
    if (low && Math.floor(state.time * 4) % 2 === 0) ctx.globalAlpha = 0.75;
    ctx.fillStyle = low ? '#ffccd0' : '#fff8e7';
    ctx.strokeStyle = low ? '#e63946' : '#c89b6a'; ctx.lineWidth = low ? 3 : 2;
    ctx.beginPath(); ctx.roundRect(x, y, TICKET_W, TICKET_H, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a2417'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(recipe.name, x + 10, y + 22);
    ctx.font = '12px sans-serif'; ctx.fillStyle = '#8a5a3b';
    ctx.fillText(recipe.price + ' coins', x + 10, y + 34);
    recipe.needs.forEach((id, j) => drawComponentIcon(ctx, id, x + 26 + j * 44, y + 64, 26));
    // Patience bar.
    ctx.fillStyle = '#ddd'; ctx.fillRect(x + 10, y + TICKET_H - 12, TICKET_W - 20, 7);
    ctx.fillStyle = frac > 0.5 ? '#2a9d8f' : frac > 0.25 ? '#ffb703' : '#e63946';
    ctx.fillRect(x + 10, y + TICKET_H - 12, (TICKET_W - 20) * frac, 7);
    ctx.restore();
  });
  if (state.tickets.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = 'italic 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('No orders yet — grab ingredients and get ready!', 330, 60);
  }

  // Right side: score, coins, hearts, combo.
  const rx = W - 210;
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('Score ' + state.score, rx + 190, 30);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Coins ' + state.coins, rx + 190, 54);
  ctx.font = '18px sans-serif'; ctx.fillStyle = '#ff6b81';
  ctx.fillText('♥'.repeat(state.hearts) + '♡'.repeat(Math.max(0, 3 - state.hearts)), rx + 190, 80);
  if (state.combo > 1) {
    ctx.fillStyle = '#e63946'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText('COMBO x' + state.combo, rx + 190, 102);
  }

  // Shift timer bar (bottom).
  const barW = 420, barX = (W - barW) / 2, barY = 700;
  const tfrac = state.timeLeft / 180;
  const urgent = state.timeLeft <= 30;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(barX - 6, barY - 6, barW + 12, 26);
  ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barW, 14);
  ctx.fillStyle = urgent ? '#e63946' : '#2a9d8f';
  ctx.fillRect(barX, barY, barW * tfrac, 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('SHIFT  ' + mmss(state.timeLeft), W / 2, barY - 12);
  if (urgent) {
    ctx.fillStyle = '#e63946'; ctx.font = 'bold 15px sans-serif';
    ctx.fillText('RUSH! ' + Math.ceil(state.timeLeft) + 's left', W / 2, barY - 30);
  }

  // Held item readout (bottom-left).
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(12, 668, 300, 40);
  ctx.fillStyle = '#fff'; ctx.font = '15px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Holding: ' + itemLabel(state.held), 22, 693);

  // Controls hint (bottom-right).
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W - 322, 668, 310, 40);
  ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('WASD move · E interact · SPACE chop', W - 22, 685);
  ctx.fillText('P pause · R restart · M mute', W - 22, 701);
}

export function drawTitle(ctx, state) {
  ctx.fillStyle = '#5b3a29'; ctx.fillRect(0, 0, W, 720);
  ctx.fillStyle = '#e8c890'; ctx.fillRect(0, 0, W, 8); ctx.fillRect(0, 712, W, 8);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 72px sans-serif';
  ctx.fillText('DAPUR KILAT', W / 2, 150);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Lightning Kitchen — a fast cooking game', W / 2, 195);
  ctx.font = '18px sans-serif'; ctx.fillStyle = '#ffe8b3';
  ctx.fillText('Take orders, chop, cook, plate and serve before patience runs out!', W / 2, 235);
  // Recipe cards.
  RECIPES.forEach((r, i) => {
    const x = 190 + i * 235, y = 300;
    ctx.fillStyle = '#fff8e7'; ctx.strokeStyle = '#c89b6a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, 210, 150, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a2417'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText(r.name, x + 105, y + 30);
    r.needs.forEach((id, j) => drawComponentIcon(ctx, id, x + 45 + j * 60, y + 70, 36));
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#8a5a3b';
    ctx.fillText(r.needs.map((id) => COMPONENTS[id].label).join(' + '), x + 105, y + 115);
    ctx.fillStyle = '#b8860b'; ctx.font = 'bold 15px sans-serif';
    ctx.fillText(r.price + ' coins', x + 105, y + 138);
  });
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER or click to start your 3-minute shift', W / 2, 510);
  ctx.font = '16px sans-serif'; ctx.fillStyle = '#ffe8b3';
  ctx.fillText('WASD / arrows move  ·  E pick up & place  ·  hold SPACE to chop', W / 2, 545);
  ctx.fillText('Burnt food goes in the trash  ·  P pause  ·  R restart  ·  M mute', W / 2, 572);
  ctx.fillStyle = '#ffd166'; ctx.font = '15px sans-serif';
  ctx.fillText('Tip: chop while the stove cooks — never stand still!', W / 2, 620);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, 720);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PAUSED', W / 2, 340);
  ctx.font = '20px sans-serif';
  ctx.fillText('Press P to resume · R to restart', W / 2, 390);
}

export function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(40,20,10,0.88)'; ctx.fillRect(0, 0, W, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 54px sans-serif';
  ctx.fillText('SHIFT OVER!', W / 2, 130);
  ctx.fillStyle = '#fff'; ctx.font = '26px sans-serif';
  ctx.fillText(state.endReason, W / 2, 175);
  ctx.font = 'bold 34px sans-serif'; ctx.fillStyle = '#ffb703';
  ctx.fillText('Rating: ' + state.rating, W / 2, 235);
  const rows = [
    ['Score', state.score], ['Coins earned', state.coins], ['Dishes served', state.served],
    ['Best combo', 'x' + state.bestCombo], ['Orders expired', state.expired],
    ['Wrong serves', state.wrongServes], ['Burnt dishes', state.burntCount],
    ['Chopped / Cooked', state.stats.chopped + ' / ' + state.stats.cooked],
  ];
  ctx.font = '22px sans-serif';
  rows.forEach((r, i) => {
    const y = 300 + i * 36;
    ctx.fillStyle = '#ffe8b3'; ctx.textAlign = 'right'; ctx.fillText(r[0], W / 2 - 20, y);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(String(r[1]), W / 2 + 20, y);
  });
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('Press R to play again', W / 2, 640);
}
