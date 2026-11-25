// audio.js — tiny kitchen sounds, synthesized with WebAudio. No audio files.
// One file, one job: beeps, thocks and dings. Silent until the player interacts.

let ctx = null;

/** Create (or reuse) the audio context. Call from a user gesture first. */
export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One short tone: frequency, seconds, waveform, volume. */
function tone(freq, seconds, type = 'sine', volume = 0.12) {
  const ac = ensureAudio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + seconds);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + seconds);
}

/** Named kitchen sounds, each a tiny melody of tones. */
export function playSound(name, muted) {
  if (muted) return;
  ensureAudio();
  if (name === 'chop') {
    tone(180, 0.07, 'square', 0.1);
    setTimeout(() => tone(140, 0.06, 'square', 0.08), 90);
  } else if (name === 'pickup') {
    tone(520, 0.08, 'sine', 0.1);
  } else if (name === 'place') {
    tone(320, 0.09, 'triangle', 0.1);
  } else if (name === 'done') {
    tone(660, 0.1, 'sine', 0.1);
    setTimeout(() => tone(880, 0.12, 'sine', 0.1), 100);
  } else if (name === 'serve') {
    tone(523, 0.12, 'sine', 0.12);
    setTimeout(() => tone(659, 0.12, 'sine', 0.12), 110);
    setTimeout(() => tone(784, 0.2, 'sine', 0.12), 220);
  } else if (name === 'miss') {
    tone(220, 0.25, 'sawtooth', 0.07);
    setTimeout(() => tone(165, 0.3, 'sawtooth', 0.07), 150);
  } else if (name === 'click') {
    tone(700, 0.05, 'sine', 0.07);
  }
}
