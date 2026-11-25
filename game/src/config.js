// Dapur Kilat — config: canvas size, layout, tuning. All original art is drawn on canvas.
export const W = 1280;
export const H = 720;
export const SHIFT_SECONDS = 180;
export const PLAYER_SPEED = 270;
export const PLAYER_R = 22;

// Kitchen stations (x, y, w, h) in canvas pixels. Top rail y 0..112 is the order board.
export const STATIONS = {
  crates: [
    { id: 'rice',    label: 'Rice',    x: 24,  y: 150, w: 150, h: 58 },
    { id: 'egg',     label: 'Egg',     x: 24,  y: 216, w: 150, h: 58 },
    { id: 'chili',   label: 'Chili',   x: 24,  y: 282, w: 150, h: 58 },
    { id: 'chicken', label: 'Chicken', x: 24,  y: 348, w: 150, h: 58 },
    { id: 'noodles', label: 'Noodles', x: 24,  y: 414, w: 150, h: 58 },
    { id: 'veg',     label: 'Veg',     x: 24,  y: 480, w: 150, h: 58 },
  ],
  board:  { id: 'board',  label: 'Chopping Board', x: 300, y: 300, w: 190, h: 120 },
  stove:  { id: 'stove',  label: 'Stove',          x: 640, y: 290, w: 220, h: 130 },
  sauce:  { id: 'sauce',  label: 'Sauce',          x: 900, y: 300, w: 110, h: 110 },
  plate:  { id: 'plate',  label: 'Plating Counter',x: 430, y: 560, w: 240, h: 96 },
  window: { id: 'window', label: 'Serving Window', x: 1060, y: 170, w: 190, h: 150 },
  trash:  { id: 'trash',  label: 'Trash',          x: 1080, y: 560, w: 110, h: 96 },
};

export const TICKET_W = 210;
export const TICKET_H = 92;

// Tuning
export const CHOP_SECONDS = 2.2;      // hold Space at the board
export const COOK_SECONDS = 6;        // stove: done at 100%, burnt past 140%
export const BURN_AT = 1.4;           // fraction of cook time
export const PATIENCE_START = 50;     // seconds per ticket at shift start
export const PATIENCE_MIN = 28;
export const SPAWN_START = 15;        // seconds between tickets at shift start
export const SPAWN_MIN = 8;
export const MAX_TICKETS = 4;
export const COMBO_WINDOW = 12;       // seconds to keep a combo alive between serves

// Colours
export const COLORS = {
  floor: '#e8c890', floorAlt: '#dfbe82', wall: '#8a5a3b', rail: '#5b3a29',
  board: '#b98a56', stove: '#4a4a52', counter: '#f2ead8', window: '#ffd166',
  trash: '#7d8597', plate: '#ffffff', accent: '#e63946', gold: '#ffb703',
};
