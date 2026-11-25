// main.js — the game's entry point: canvas setup, the frame loop, keyboard
// and mouse input, and the shift's clock. One file, one job: running the game.

import { VIEW_W, VIEW_H, SHIFT_SECONDS } from './config.js';
import { createState, updateParticles, shiftOver } from './state.js';
import { buildKitchen, nearestStation, stationAtPoint } from './kitchen.js';
import { updateOrders } from './orders.js';
import { moveChef, updateStations, interact } from './player.js';
import { render } from './render.js';
import { applyShot } from './shots.js';
import { ensureAudio, playSound } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW_W * dpr;
  canvas.height = VIEW_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const state = createState();
state.stations = buildKitchen();

// A staged scene (?shot=play etc.) is for the maker's screenshots only.
const shot = new URLSearchParams(window.location.search).get('shot');
if (!applyShot(state, shot)) {
  state.screen = 'title';
}

// ---- input ---------------------------------------------------------------

const keys = new Set();
let moveTarget = null; // {x, y} in game coordinates, set by a mouse click
let pendingStation = null; // station to use once the chef walks up to it

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  ensureAudio();
  if (e.key === 'm' || e.key === 'M') {
    state.muted = !state.muted;
    return;
  }
  if (state.screen === 'title' && (e.key === 'Enter' || e.key === ' ')) {
    startShift();
    return;
  }
  if (state.screen === 'over' && (e.key === 'r' || e.key === 'R' || e.key === 'Enter')) {
    startShift();
    return;
  }
  if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
    if (state.screen === 'playing') {
      interact(state);
      playSound('click', state.muted);
    }
    return;
  }
  keys.add(e.key.toLowerCase());
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

canvas.addEventListener('pointerdown', (e) => {
  ensureAudio();
  const p = canvasPoint(e);
  if (state.screen === 'title' || state.screen === 'over') {
    startShift();
    return;
  }
  const station = stationAtPoint(state.stations, p.x, p.y);
  if (station) {
    const near = nearestStation(state.stations, state.chef.x, state.chef.y);
    if (near === station) {
      interact(state);
      playSound('click', state.muted);
    } else {
      // Walk up to the counter, then use it.
      pendingStation = station;
      moveTarget = { x: station.x + station.w / 2, y: station.y + station.h + 44 };
    }
    return;
  }
  moveTarget = p;
  pendingStation = null;
});

/** Begin a fresh shift: reset the state and the kitchen. */
export function startShift() {
  const fresh = createState();
  fresh.stations = buildKitchen();
  fresh.screen = 'playing';
  Object.assign(state, fresh);
  state.stations = fresh.stations;
  playSound('click', state.muted);
  announce('Shift started. First order coming in — grab an ingredient!');
}

/** Keep the screen-reader status line in step with the game. */
function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

// ---- the frame loop ------------------------------------------------------

let last = performance.now();
let announceTimer = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.screen === 'playing') {
    state.time += dt;
    state.shiftLeft = Math.max(0, SHIFT_SECONDS - state.time);
    state.rush = state.shiftLeft <= 45;
    if (state.servedFlash > 0) state.servedFlash -= dt;
    updateOrders(state, dt);
    updateStations(state, dt);
    updateParticles(state, dt);

    // Keyboard movement.
    let dx = 0;
    let dy = 0;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (dx !== 0 || dy !== 0) {
      moveTarget = null;
      pendingStation = null;
      moveChef(state, dx, dy, dt);
    } else if (moveTarget) {
      // Click-to-move: walk toward the target, then stop.
      const tx = moveTarget.x - state.chef.x;
      const ty = moveTarget.y - state.chef.y;
      const dist = Math.hypot(tx, ty);
      if (dist > 8) {
        moveChef(state, tx / dist, ty / dist, dt);
      } else {
        moveTarget = null;
        if (pendingStation) {
          const near = nearestStation(state.stations, state.chef.x, state.chef.y);
          if (near === pendingStation) interact(state);
          pendingStation = null;
        }
      }
    }

    if (shiftOver(state)) {
      state.screen = 'over';
      playSound(state.served >= 9 ? 'serve' : 'miss', state.muted);
      announce(`Shift over. ${state.served} orders served, ${state.coins} coins earned.`);
    }
    // A quiet status update every few seconds for screen readers.
    announceTimer += dt;
    if (announceTimer > 5) {
      announceTimer = 0;
      const next = state.orders[0];
      announce(next ? `Next order: ${next.recipe.name}, ${Math.ceil(next.left)} seconds left. ${state.coins} coins.` : `${state.coins} coins. No orders waiting.`);
    }
  } else {
    // Title and results screens still tick the clock for their pulsing prompts.
    state.time += dt;
    updateParticles(state, dt);
  }

  render(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
