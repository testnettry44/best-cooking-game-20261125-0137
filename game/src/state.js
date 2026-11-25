// Dapur Kilat — game state. Seeded RNG keeps ticket order deterministic per seed.
import { SHIFT_SECONDS, PATIENCE_START, SPAWN_START } from './config.js';
import { RECIPES } from './recipes.js';

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function newGame(seed = 20261125) {
  const rng = makeRng(seed);
  return {
    seed,
    rng,
    screen: 'title', // title | play | pause | end
    time: 0,         // seconds elapsed in the shift
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    wrongServes: 0,
    expired: 0,
    burntCount: 0,
    hearts: 3,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    player: { x: 640, y: 470, vx: 0, vy: 0, dir: 1, moving: false, moveTarget: null },
    held: null,      // null | {kind:'item',id} | {kind:'plate',components:[]}
    tickets: [],     // {id, recipeId, patience, patienceMax, born}
    nextTicketId: 1,
    spawnTimer: 4,   // first ticket after 4s
    spawnInterval: SPAWN_START,
    patienceMax: PATIENCE_START,
    board: { item: null, progress: 0 },       // chopping board slot
    burners: [ { item: null, progress: 0 }, { item: null, progress: 0 } ],
    counterPlate: null, // plate resting on the plating counter
    particles: [],
    popups: [],       // {x,y,text,color,life}
    floats: [],
    muted: false,
    shake: 0,
    sizzle: 0,
    fps: 0,
    _fpsFrames: 0,
    _fpsTime: 0,
    endReason: '',
    stats: { chopped: 0, cooked: 0, trashed: 0 },
  };
}

export function spawnTicket(state) {
  const recipe = RECIPES[Math.floor(state.rng() * RECIPES.length)];
  state.tickets.push({
    id: state.nextTicketId++,
    recipeId: recipe.id,
    patience: state.patienceMax,
    patienceMax: state.patienceMax,
    born: state.time,
  });
}

export function difficulty(state) {
  // 0 at shift start -> 1 at shift end. Tickets arrive faster, patience drains faster.
  const p = Math.min(1, state.time / SHIFT_SECONDS);
  state.spawnInterval = SPAWN_START - (SPAWN_START - 8) * p;
  state.patienceMax = PATIENCE_START - (PATIENCE_START - 28) * p;
  return p;
}

export function addPopup(state, x, y, text, color) {
  state.popups.push({ x, y, text, color: color || '#ffffff', life: 1.4 });
  if (state.popups.length > 12) state.popups.shift();
}

export function addParticles(state, x, y, color, n) {
  for (let i = 0; i < (n || 8); i++) {
    state.particles.push({
      x, y,
      vx: (state.rng() - 0.5) * 220, vy: -40 - state.rng() * 160,
      life: 0.5 + state.rng() * 0.4, max: 0.9, color, size: 2 + state.rng() * 4,
    });
  }
  if (state.particles.length > 220) state.particles.splice(0, state.particles.length - 220);
}
