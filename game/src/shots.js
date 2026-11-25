// Dapur Kilat — staged scenes for screenshots and playtesting.
// stage(name) jumps to a deterministic scene; ?stage=... does the same on load.
import { newGame, spawnTicket } from './state.js';
import { makePlate, makeItem } from './recipes.js';
import { STATIONS } from './config.js';

function placePlayer(state, stationKey, dx, dy) {
  const r = STATIONS[stationKey];
  state.player.x = r.x + r.w / 2 + (dx || 0);
  state.player.y = r.y + r.h + 34 + (dy || 0);
}

export function stage(state, name) {
  const fresh = newGame(state.seed);
  // Keep the caller's screen handling: staged scenes start in play unless noted.
  Object.assign(state, fresh);
  state.screen = 'play';

  if (name === 'cover') {
    state.time = 30; state.timeLeft = 150;
    state.tickets = [];
    for (let i = 0; i < 3; i++) spawnTicket(state);
    // A plate mid-assembly on the counter: cooked rice + fried egg.
    const plate = makePlate(); plate.components = ['cooked_rice', 'fried_egg'];
    state.counterPlate = plate;
    // Ingredients waiting on the board area: chopped chili ready in hand.
    state.held = makeItem('chopped_chili');
    placePlayer(state, 'plate', 0, 10);
    // A burner cooking noodles.
    state.burners[0].item = 'noodles'; state.burners[0].progress = 0.45;
    return 'cover staged';
  }
  if (name === 'chop') {
    state.time = 12; state.timeLeft = 168;
    state.tickets = []; spawnTicket(state);
    state.board.item = 'chicken'; state.board.progress = 0.55;
    state.held = null;
    placePlayer(state, 'board', 0, 6);
    return 'chop staged';
  }
  if (name === 'rush') {
    state.time = 155; state.timeLeft = 25;
    state.tickets = [];
    for (let i = 0; i < 3; i++) spawnTicket(state);
    state.tickets.forEach((t, i) => { t.patience = 6 + i * 2; t.patienceMax = 28; });
    state.burners[0].item = 'rice'; state.burners[0].progress = 0.8;
    state.burners[1].item = 'egg'; state.burners[1].progress = 0.55;
    state.held = makeItem('chopped_veg');
    placePlayer(state, 'stove', 0, 10);
    return 'rush staged';
  }
  if (name === 'serve') {
    state.time = 60; state.timeLeft = 120;
    state.score = 340; state.coins = 340; state.served = 3; state.combo = 2; state.comboTimer = 8;
    state.tickets = [];
    spawnTicket(state);
    // Force the ticket to Nasi Goreng and hold its exact plate.
    state.tickets[0].recipeId = 'nasi_goreng';
    const plate = makePlate(); plate.components = ['cooked_rice', 'fried_egg', 'chopped_chili'];
    state.held = plate;
    placePlayer(state, 'window', 0, 10);
    return 'serve staged';
  }
  if (name === 'end') {
    state.time = 179.5; state.timeLeft = 0.5;
    state.score = 520; state.coins = 520; state.served = 5; state.combo = 0; state.bestCombo = 3;
    state.expired = 1; state.burntCount = 1;
    state.tickets = [];
    return 'end staged';
  }
  return 'unknown stage ' + name;
}
