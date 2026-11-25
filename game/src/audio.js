// Dapur Kilat — all sounds are synthesized with WebAudio. No audio files.
let ctx = null;
let muted = false;

export function setMuted(m) { muted = !!m; }
export function isMuted() { return muted; }

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, freq) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = 0.8;
  const g = c.createGain(); g.gain.value = vol || 0.08;
  src.connect(f); f.connect(g); g.connect(c.destination);
  src.start();
}

export const sfx = {
  unlock() { ac(); },
  pickup() { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.08, 'triangle', 0.09, 0.05); },
  place() { tone(340, 0.08, 'triangle', 0.11); },
  chop() { noiseBurst(0.06, 0.14, 2400); tone(190, 0.05, 'square', 0.05); },
  chopDone() { tone(660, 0.1, 'triangle', 0.12); tone(990, 0.14, 'triangle', 0.12, 0.08); },
  sizzleTick() { noiseBurst(0.05, 0.05, 3200); },
  cookDone() { tone(880, 0.12, 'sine', 0.12); tone(1174, 0.16, 'sine', 0.1, 0.09); },
  burn() { tone(220, 0.3, 'sawtooth', 0.1, 0, 110); noiseBurst(0.25, 0.1, 500); },
  serve() { tone(523, 0.12, 'sine', 0.14); tone(659, 0.12, 'sine', 0.14, 0.1); tone(784, 0.2, 'sine', 0.14, 0.2); },
  reject() { tone(220, 0.16, 'square', 0.09); tone(180, 0.22, 'square', 0.09, 0.12); },
  expire() { tone(330, 0.25, 'sawtooth', 0.09, 0, 165); },
  alarm() { tone(980, 0.1, 'square', 0.05); tone(740, 0.1, 'square', 0.05, 0.12); },
  trash() { noiseBurst(0.12, 0.12, 700); },
  click() { tone(700, 0.05, 'triangle', 0.08); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'sine', 0.13, i * 0.13)); },
};
