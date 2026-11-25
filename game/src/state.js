// state.js — the whole game state in one plain object, and the helpers that read it.
// One file, one job: what the game IS right now. No drawing, no input here.

import { SHIFT_SECONDS } from './config.js';

/** A fresh shift: chef, orders, coins, timers, stations and the rush. */
export function createState() {
  return {
    screen: 'title', // 'title' | 'playing' | 'over'
    time: 0, // seconds since the shift started
    shiftLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    missed: 0,
    combo: 0, // consecutive serves without a missed order
    bestCombo: 0,
    orders: [], // {id, recipe, left, total, flash}
    nextOrderId: 1,
    spawnIn: 6, // seconds until the first order arrives
    carrying: null, // {kind, id} or a plate {kind:'plate', contents:[]}
    chef: { x: 640, y: 560, r: 26, dir: 'down', moving: false, walkPhase: 0 },
    stations: null, // filled by kitchen.js: {id, kind, x, y, w, h, ...}
    message: '', // floating hint line under the board
    messageUntil: 0,
    rush: false, // the last 45 seconds: faster orders, red timer
    muted: false,
    particles: [], // {x, y, vx, vy, life, color, size}
    servedFlash: 0, // seconds left of the green "SERVED!" flash
    lastServedPay: 0,
  };
}

/** The shift is over when the clock runs out. */
export function shiftOver(state) {
  return state.shiftLeft <= 0;
}

/** A short hint line, shown until `forSeconds` pass. */
export function say(state, text, forSeconds = 2.5) {
  state.message = text;
  state.messageUntil = state.time + forSeconds;
}

/** Star rating for the end screen: 1-3 stars from coins served. */
export function starRating(state) {
  if (state.served >= 14 && state.coins >= 520) return 3;
  if (state.served >= 9 && state.coins >= 320) return 2;
  if (state.served >= 4) return 1;
  return 0;
}

/** Push a burst of kitchen particles (chopping bits, sizzle puffs, steam). */
export function burst(state, x, y, color, count = 10, speed = 90) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.8);
    state.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 40,
      life: 0.5 + Math.random() * 0.4,
      maxLife: 0.9,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

/** Advance particles; dead ones drop out. */
export function updateParticles(state, dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}
