// orders.js — the order board: spawning tickets, ticking their timers,
// matching a finished plate to a ticket, and the rush that speeds the shift.
// One file, one job: orders. No drawing, no movement here.

import {
  MAX_ACTIVE_ORDERS, ORDER_MIN_SECONDS, ORDER_MAX_SECONDS,
  START_SPAWN_SECONDS, END_SPAWN_SECONDS, SHIFT_SECONDS,
  recipesAvailableAt, payFor,
} from './config.js';
import { say } from './state.js';

function randomOrderSeconds() {
  return ORDER_MIN_SECONDS + Math.random() * (ORDER_MAX_SECONDS - ORDER_MIN_SECONDS);
}

/** Spawn one new ticket from the recipes the shift has unlocked so far. */
export function spawnOrder(state) {
  const pool = recipesAvailableAt(state.time);
  const recipe = pool[Math.floor(Math.random() * pool.length)];
  const seconds = randomOrderSeconds();
  state.orders.push({
    id: state.nextOrderId++,
    recipe,
    left: seconds,
    total: seconds,
    flash: 0, // red flash when the ticket is about to expire
  });
}

/** How fast new orders arrive: 16s at the start, 8s by the end of the shift. */
export function spawnInterval(state) {
  const t = Math.min(1, state.time / SHIFT_SECONDS);
  return START_SPAWN_SECONDS + (END_SPAWN_SECONDS - START_SPAWN_SECONDS) * t;
}

/** Tick the board: spawn, count tickets down, expire the ones that run out. */
export function updateOrders(state, dt) {
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_ACTIVE_ORDERS) {
    spawnOrder(state);
    state.spawnIn = spawnInterval(state);
  }
  for (const o of state.orders) {
    o.left -= dt;
    if (o.left < 10) o.flash += dt;
  }
  const expired = state.orders.filter((o) => o.left <= 0);
  if (expired.length > 0) {
    state.orders = state.orders.filter((o) => o.left > 0);
    state.missed += expired.length;
    state.combo = 0;
    say(state, `Order missed! ${expired.length} ticket${expired.length > 1 ? 's' : ''} walked out.`, 3);
  }
}

/** Does a plate hold exactly what a recipe needs (order does not matter)? */
export function plateMatchesRecipe(plate, recipe) {
  if (plate.contents.length !== recipe.needs.length) return false;
  const have = [...plate.contents].sort();
  const want = [...recipe.needs].sort();
  return have.every((v, i) => v === want[i]);
}

/**
 * Serve a plate at the window. Returns 'served' (with pay), 'wrong' (no ticket
 * wants this plate) or 'noplate' (the chef is not carrying a plate).
 * Serving fills the OLDEST matching ticket first.
 */
export function servePlate(state, plate) {
  if (!plate || plate.kind !== 'plate') return { result: 'noplate', pay: 0 };
  const idx = state.orders.findIndex((o) => plateMatchesRecipe(plate, o.recipe));
  if (idx < 0) return { result: 'wrong', pay: 0 };
  const order = state.orders[idx];
  state.orders.splice(idx, 1);
  const pay = payFor(order.recipe, order.left, order.total);
  state.coins += pay;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.servedFlash = 1.4;
  state.lastServedPay = pay;
  say(state, `${order.recipe.name} served! +${pay} coins${state.combo > 1 ? ` — ${state.combo} in a row!` : ''}`, 2.5);
  return { result: 'served', pay };
}

/** A one-line summary of a ticket, for the hint line and screen readers. */
export function orderSummary(order) {
  return `${order.recipe.name} (${Math.ceil(order.left)}s left)`;
}
