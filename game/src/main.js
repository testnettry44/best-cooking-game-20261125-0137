// Dapur Kilat — boot and main loop. Exposes window.__game for playtesting:
// snapshot(), stage(name), start(), state, interact().
import { W, H } from './config.js';
import { newGame } from './state.js';
import { createInput } from './input.js';
import { updatePlayer } from './player.js';
import { interact, update, nearestStation, ratingFor } from './kitchen.js';
import { drawKitchen, drawPopups } from './render.js';
import { drawHUD, drawTitle, drawPause, drawEnd } from './hud.js';
import { sfx, setMuted } from './audio.js';
import { stage } from './shots.js';
import { itemLabel } from './recipes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

let state = newGame(20261125);
let last = performance.now();
let errors = [];
window.addEventListener('error', (e) => errors.push(String(e.message || e.error)));

function startGame() {
  state = newGame(20261125);
  state.screen = 'play';
  sfx.unlock();
  sfx.click();
}

function snapshot() {
  return {
    screen: state.screen,
    time: +state.time.toFixed(2),
    timeLeft: +state.timeLeft.toFixed(2),
    score: state.score,
    coins: state.coins,
    served: state.served,
    hearts: state.hearts,
    combo: state.combo,
    player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
    held: itemLabel(state.held),
    heldRaw: state.held,
    tickets: state.tickets.map((t) => ({ id: t.id, recipe: t.recipeId, patience: +t.patience.toFixed(1) })),
    board: { item: state.board.item, progress: +state.board.progress.toFixed(2) },
    burners: state.burners.map((b) => ({ item: b.item, progress: +b.progress.toFixed(2) })),
    counterPlate: state.counterPlate ? state.counterPlate.components : null,
    rating: state.rating || null,
    endReason: state.endReason || '',
    fps: Math.round(state.fps),
    errors: errors.slice(),
    muted: state.muted,
    stats: state.stats,
    expired: state.expired,
    wrongServes: state.wrongServes,
    burntCount: state.burntCount,
  };
}

window.__game = {
  get state() { return state; },
  snapshot,
  stage: (name) => stage(state, name),
  start: startGame,
  interact: () => interact(state),
  errors: () => errors.slice(),
};

function applyStageParam() {
  const q = new URLSearchParams(location.search).get('stage');
  if (q) { state.screen = 'play'; stage(state, q); }
}

function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // FPS tracking.
  state._fpsFrames++; state._fpsTime += dt;
  if (state._fpsTime >= 1) { state.fps = state._fpsFrames / state._fpsTime; state._fpsFrames = 0; state._fpsTime = 0; }

  // Global keys.
  if (input.wasPressed('m')) { state.muted = !state.muted; setMuted(state.muted); }
  if (input.wasPressed('r')) { startGame(); }
  if (input.wasPressed('p') && (state.screen === 'play' || state.screen === 'pause')) {
    state.screen = state.screen === 'play' ? 'pause' : 'play';
    sfx.click();
  }

  const click = input.consumeClick();
  if (state.screen === 'title') {
    if (input.wasPressed('enter') || click) startGame();
  } else if (state.screen === 'play') {
    if (click) {
      // Click a station to interact when near it, else set a move target.
      const st = nearestStation(state);
      const nearClick = st && Math.abs(click.x - (st.rect.x + st.rect.w / 2)) < 130 && Math.abs(click.y - (st.rect.y + st.rect.h / 2)) < 130;
      if (nearClick) interact(state);
      else state.player.moveTarget = { x: click.x, y: click.y };
    }
    if (input.wasPressed('e')) interact(state);
    updatePlayer(state, dt, input);
    update(state, dt, input);
  } else if (state.screen === 'end') {
    if (input.wasPressed('enter') || click) startGame();
  }
  input.clearPressed();

  // Render.
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - 0.5) * state.shake * 30, (Math.random() - 0.5) * state.shake * 30);
  const t = now / 1000;
  if (state.screen === 'title') {
    drawTitle(ctx, state);
  } else {
    drawKitchen(ctx, state, t);
    drawHUD(ctx, state);
    drawPopups(ctx, state);
    if (state.screen === 'pause') drawPause(ctx);
    if (state.screen === 'end') drawEnd(ctx, state);
  }
  ctx.restore();
}

applyStageParam();
requestAnimationFrame(frame);
