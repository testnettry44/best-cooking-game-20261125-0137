// Dapur Kilat — kitchen logic: stations, chopping, cooking, plating, serving, trash,
// ticket timers, difficulty ramp, shift end.
import { STATIONS, CHOP_SECONDS, COOK_SECONDS, BURN_AT, MAX_TICKETS, COMBO_WINDOW, SHIFT_SECONDS } from './config.js';
import { CHOP_MAP, COOK_MAP, RECIPES, recipeById, plateMatches, isPlate, makePlate, makeItem, COMPONENTS } from './recipes.js';
import { spawnTicket, difficulty, addPopup, addParticles } from './state.js';
import { sfx } from './audio.js';

export function rectCenter(r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
export function nearRect(p, r, pad) {
  const d = pad || 46;
  return p.x > r.x - d && p.x < r.x + r.w + d && p.y > r.y - d && p.y < r.y + r.h + d;
}
export function nearestStation(state) {
  const p = state.player;
  const candidates = [];
  for (const c of STATIONS.crates) if (nearRect(p, c)) candidates.push({ kind: 'crate', id: c.id, rect: c });
  for (const key of ['board', 'stove', 'sauce', 'plate', 'window', 'trash']) {
    if (nearRect(p, STATIONS[key])) candidates.push({ kind: key, rect: STATIONS[key] });
  }
  if (!candidates.length) return null;
  // Closest station centre wins (crate zones overlap at the edges).
  let best = candidates[0], bestD = Infinity;
  for (const c of candidates) {
    const ctr = rectCenter(c.rect);
    const d = Math.hypot(p.x - ctr.x, p.y - ctr.y);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

// E / click interaction with the nearest station.
export function interact(state) {
  const st = nearestStation(state);
  if (!st) return 'nothing near';
  const held = state.held;

  if (st.kind === 'crate') {
    if (held) return 'hands full';
    state.held = makeItem(st.id);
    sfx.pickup();
    return 'picked ' + st.id;
  }
  if (st.kind === 'sauce') {
    if (isPlate(held)) {
      if (held.components.length >= 3) return 'plate full';
      if (held.components.includes('sauce')) return 'sauce already on plate';
      held.components.push('sauce'); sfx.place(); return 'sauce on plate';
    }
    if (held) return 'hands full';
    state.held = makeItem('sauce'); sfx.pickup(); return 'picked sauce';
  }
  if (st.kind === 'board') {
    if (state.board.item) return 'board busy';
    if (held && held.kind === 'item' && CHOP_MAP[held.id]) {
      state.board.item = held.id; state.board.progress = 0; state.held = null;
      sfx.place(); return 'placed ' + state.board.item + ' on board';
    }
    return held ? 'cannot chop that' : 'need a choppable ingredient';
  }
  if (st.kind === 'stove') {
    // Take a finished burner first (including burnt food, which must be binned).
    for (const b of state.burners) {
      if (b.item === 'burnt') {
        if (held) return 'hands full';
        state.held = makeItem('burnt'); b.item = null; b.progress = 0;
        sfx.pickup(); return 'took burnt food — bin it!';
      }
      if (b.item && b.progress >= 1 && b.progress < BURN_AT) {
        if (held) return 'hands full';
        state.held = makeItem(COOK_MAP[b.item]); b.item = null; b.progress = 0;
        state.stats.cooked++; sfx.pickup(); return 'took cooked food';
      }
    }
    if (held && held.kind === 'item' && COOK_MAP[held.id]) {
      const free = state.burners.find((b) => !b.item);
      if (!free) return 'stove full';
      free.item = held.id; free.progress = 0; state.held = null;
      sfx.place(); return 'cooking ' + free.item;
    }
    if (held) return 'cannot cook that';
    return 'need a cookable ingredient';
  }
  if (st.kind === 'plate') {
    if (isPlate(held)) { state.counterPlate = held; state.held = null; sfx.place(); return 'plate on counter'; }
    if (state.counterPlate && held && held.kind === 'item') {
      if (state.counterPlate.components.length >= 3) return 'plate full';
      if (state.counterPlate.components.includes(held.id)) return 'already on plate';
      state.counterPlate.components.push(held.id); state.held = null; sfx.place();
      return 'added ' + held.id + ' to plate';
    }
    if (state.counterPlate && !held) { state.held = state.counterPlate; state.counterPlate = null; sfx.pickup(); return 'picked up plate'; }
    if (!held) { state.held = makePlate(); sfx.pickup(); return 'took a clean plate'; }
    return 'nothing to do here';
  }
  if (st.kind === 'window') {
    if (!isPlate(held)) return 'need a finished plate to serve';
    return servePlate(state);
  }
  if (st.kind === 'trash') {
    if (!held) return 'nothing to throw away';
    state.held = null; state.stats.trashed++; sfx.trash();
    addPopup(state, state.player.x, state.player.y - 40, 'Trashed', '#9aa0a6');
    return 'trashed';
  }
  return 'nothing';
}

function servePlate(state) {
  const plate = state.held;
  const c = rectCenter(STATIONS.window);
  for (const t of state.tickets) {
    const recipe = recipeById(t.recipeId);
    if (plateMatches(plate.components, recipe)) {
      state.tickets = state.tickets.filter((x) => x.id !== t.id);
      state.served++;
      state.combo++;
      state.comboTimer = COMBO_WINDOW;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const patienceBonus = Math.round(60 * (t.patience / t.patienceMax));
      const comboBonus = (state.combo - 1) * 15;
      const earned = recipe.price + patienceBonus + comboBonus;
      state.score += earned; state.coins += earned;
      state.held = null;
      sfx.serve();
      addPopup(state, c.x - 60, c.y - 30, '+' + earned + ' coins!', '#ffb703');
      if (state.combo > 1) addPopup(state, c.x - 60, c.y - 60, 'COMBO x' + state.combo, '#e63946');
      addParticles(state, c.x, c.y, '#ffd166', 16);
      return 'served ' + recipe.name + ' +' + earned;
    }
  }
  state.wrongServes++;
  state.combo = 0; state.comboTimer = 0;
  state.shake = 0.35;
  sfx.reject();
  addPopup(state, c.x - 60, c.y - 30, 'Wrong dish!', '#e63946');
  return 'wrong dish — no ticket wants this plate';
}

// Per-frame update while playing.
export function update(state, dt, input) {
  difficulty(state);
  state.time += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.time);

  // Spawn tickets.
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.tickets.length < MAX_TICKETS) {
    spawnTicket(state);
    state.spawnTimer = state.spawnInterval;
  }

  // Ticket patience drains; faster late in the shift.
  const drain = 1 + difficulty(state) * 0.9;
  let alarm = false;
  for (const t of state.tickets) {
    t.patience -= dt * drain;
    if (t.patience < 12) alarm = true;
  }
  if (alarm && Math.floor(state.time * 2) !== Math.floor((state.time - dt) * 2)) sfx.alarm();
  const expiredList = state.tickets.filter((t) => t.patience <= 0);
  for (const t of expiredList) {
    state.tickets = state.tickets.filter((x) => x.id !== t.id);
    state.expired++;
    state.hearts = Math.max(0, state.hearts - 1);
    state.combo = 0; state.comboTimer = 0;
    sfx.expire();
    addPopup(state, 640, 130, 'Order expired! -1 heart', '#e63946');
    if (state.hearts <= 0) { endShift(state, 'Out of hearts'); return; }
  }

  // Combo decay.
  if (state.comboTimer > 0) { state.comboTimer -= dt; if (state.comboTimer <= 0) state.combo = 0; }

  // Chopping: hold Space while an item sits on the board.
  if (state.board.item && input.keys.has(' ')) {
    state.board.progress += dt / CHOP_SECONDS;
    if (Math.random() < dt * 14) { sfx.chop(); addParticles(state, rectCenter(STATIONS.board).x, rectCenter(STATIONS.board).y, '#8ecae6', 3); }
    if (state.board.progress >= 1) {
      const done = CHOP_MAP[state.board.item];
      state.board.item = null; state.board.progress = 0;
      state.held = makeItem(done);
      state.stats.chopped++;
      sfx.chopDone();
      addPopup(state, rectCenter(STATIONS.board).x - 40, rectCenter(STATIONS.board).y - 60, COMPONENTS[done].label + ' ready!', '#2a9d8f');
    }
  } else if (state.board.item) {
    state.board.progress = Math.max(0, state.board.progress - dt * 0.15);
  }

  // Cooking.
  for (const b of state.burners) {
    if (!b.item || b.item === 'burnt') continue; // burnt food sits still until binned
    b.progress += dt / COOK_SECONDS;
    if (Math.random() < dt * 6) { sfx.sizzleTick(); state.sizzle = 0.3; }
    if (b.progress >= 1 && b.progress - dt / COOK_SECONDS < 1) {
      sfx.cookDone();
      addPopup(state, rectCenter(STATIONS.stove).x - 30, rectCenter(STATIONS.stove).y - 70, 'Cooked — take it!', '#ffb703');
    }
    if (b.item !== 'burnt' && b.progress >= BURN_AT) {
      b.item = 'burnt'; b.progress = BURN_AT;
      state.burntCount++;
      sfx.burn();
      addPopup(state, rectCenter(STATIONS.stove).x - 30, rectCenter(STATIONS.stove).y - 70, 'Burnt!', '#e63946');
    }
  }
  // Burnt items sit on the burner as a burnt item the player must bin.
  for (const b of state.burners) {
    if (b.item === 'burnt' && !state.held && b.progress >= BURN_AT) {
      // handled by interact: taking a burnt item is allowed via the stove pickup path
    }
  }

  // Particles and popups.
  for (const p of state.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.life -= dt; }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const p of state.popups) { p.y -= 28 * dt; p.life -= dt; }
  state.popups = state.popups.filter((p) => p.life > 0);
  if (state.shake > 0) state.shake -= dt;
  if (state.sizzle > 0) state.sizzle -= dt;

  // Shift end.
  if (state.timeLeft <= 0) endShift(state, 'Shift complete!');
}

export function endShift(state, reason) {
  state.screen = 'end';
  state.endReason = reason;
  state.rating = ratingFor(state);
  sfx.win();
}

export function ratingFor(state) {
  if (state.served >= 12) return 'S — Master Chef!';
  if (state.served >= 9) return 'A — Head Chef';
  if (state.served >= 6) return 'B — Line Cook';
  if (state.served >= 3) return 'C — Kitchen Hand';
  return 'D — Keep Practising';
}
