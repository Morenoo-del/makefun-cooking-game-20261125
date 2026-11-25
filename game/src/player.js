// player.js — the chef: walking the kitchen floor, and the hands that pick up,
// process and serve everything. One file, one job: what the chef does.

import { BOARD_H, VIEW_W, VIEW_H, BURN_SECONDS, INGREDIENTS, makeCarried, makePlate } from './config.js';
import { collidesWithStation, distanceToStation, processSeconds } from './kitchen.js';
import { servePlate } from './orders.js';
import { say, burst } from './state.js';

export const CHEF_SPEED = 265;

/** Move the chef one step, sliding along station rects and the room's walls. */
export function moveChef(state, dx, dy, dt) {
  const chef = state.chef;
  const speed = CHEF_SPEED * dt;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) {
    chef.moving = false;
    return;
  }
  const nx = (dx / len) * speed;
  const ny = (dy / len) * speed;
  chef.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  chef.moving = true;
  chef.walkPhase += dt * 11;
  // Try x then y so the chef slides along counters instead of sticking.
  const tryX = chef.x + nx;
  if (tryX - chef.r > 10 && tryX + chef.r < VIEW_W - 10
    && !collidesWithStation(state.stations, tryX, chef.y, chef.r)) {
    chef.x = tryX;
  }
  const tryY = chef.y + ny;
  const floorTop = BOARD_H + 96;
  if (tryY - chef.r > floorTop && tryY + chef.r < VIEW_H - 12
    && !collidesWithStation(state.stations, chef.x, tryY, chef.r)) {
    chef.y = tryY;
  }
}

/** Tick every processing station: chopping, grilling, boiling, and burning. */
export function updateStations(state, dt) {
  for (const s of state.stations) {
    if ((s.kind === 'chop' || s.kind === 'grill' || s.kind === 'pot') && s.item) {
      s.progress += dt;
      const need = processSeconds(s.kind);
      if (!s.done && s.progress >= need) {
        s.done = true;
        burst(state, s.x + s.w / 2, s.y + s.h / 2, '#ffd23f', 8, 70);
      }
      if (s.kind === 'grill' && s.done && s.progress >= BURN_SECONDS && !s.burnt) {
        s.burnt = true;
        say(state, 'The patty burnt! Bin it and grill a fresh one.', 3);
      }
      // A little sizzle puff while something cooks.
      if (Math.random() < dt * 2) {
        burst(state, s.x + s.w / 2, s.y + 8, s.kind === 'grill' ? '#cfd8dc' : '#b3e5fc', 1, 20);
      }
    }
  }
}

/** A ready item keeps its ingredient id; recipes are matched on that id. */
export function readyName(id) {
  const def = INGREDIENTS[id];
  return def ? def.name : id;
}

/** The chef uses the nearest station (E / Space / click). */
export function interact(state) {
  const chef = state.chef;
  let best = null;
  let bestD = Infinity;
  for (const s of state.stations) {
    const d = distanceToStation(s, chef.x, chef.y);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (!best || bestD > 78) {
    say(state, 'Walk up to a counter to use it.', 1.5);
    return;
  }
  useStation(state, best);
}

/** What happens when the chef uses one station. Hands hold one thing at a time. */
export function useStation(state, s) {
  const hands = state.carrying;
  if (s.kind === 'crate') {
    if (hands) { say(state, 'Hands full! Put this down first.', 1.5); return; }
    state.carrying = makeCarried('raw', s.ingredient);
    say(state, `Picked up ${INGREDIENTS[s.ingredient].name}.`, 1.2);
    return;
  }
  if (s.kind === 'chop' || s.kind === 'grill' || s.kind === 'pot') {
    const need = s.kind === 'chop' ? 'chop' : s.kind === 'grill' ? 'grill' : 'pot';
    if (!s.item) {
      if (!hands || hands.kind !== 'raw') { say(state, `Bring a raw ingredient to ${s.label.toLowerCase()} here.`, 1.5); return; }
      if (INGREDIENTS[hands.id].needs !== need) { say(state, `That does not go on the ${s.label.toLowerCase()}.`, 1.5); return; }
      s.item = hands.id;
      s.progress = 0;
      s.done = false;
      s.burnt = false;
      state.carrying = null;
      return;
    }
    if (!s.done) { say(state, 'Still working — give it a moment.', 1.2); return; }
    if (hands) { say(state, 'Hands full! Put this down first.', 1.5); return; }
    if (s.burnt) {
      state.carrying = makeCarried('burnt', s.item);
      say(state, 'Burnt patty. Bin it!', 1.5);
    } else {
      state.carrying = makeCarried('ready', s.item);
      say(state, `Picked up ${INGREDIENTS[s.item].name}.`, 1.2);
    }
    s.item = null;
    s.progress = 0;
    s.done = false;
    s.burnt = false;
    return;
  }
  if (s.kind === 'plates') {
    if (hands) { say(state, 'Hands full! Put this down first.', 1.5); return; }
    state.carrying = makePlate();
    say(state, 'Picked up a clean plate.', 1.2);
    return;
  }
  if (s.kind === 'plate') {
    if (!s.plate) {
      if (hands && hands.kind === 'plate') {
        s.plate = hands;
        state.carrying = null;
        say(state, 'Plate on the counter. Add ingredients to it.', 2);
      } else {
        say(state, 'Bring a plate here to build a dish on it.', 1.5);
      }
      return;
    }
    if (!hands) {
      state.carrying = s.plate;
      s.plate = null;
      say(state, 'Picked the plate back up.', 1.2);
      return;
    }
    if (hands.kind === 'ready') {
      if (s.plate.contents.includes(hands.id)) { say(state, 'That is already on the plate.', 1.5); return; }
      s.plate.contents.push(hands.id);
      state.carrying = null;
      burst(state, s.x + s.w / 2, s.y + s.h / 2, '#8bc34a', 8, 60);
      say(state, `${INGREDIENTS[hands.id].name} added to the plate.`, 1.2);
      return;
    }
    say(state, 'Only finished ingredients go on the plate.', 1.5);
    return;
  }
  if (s.kind === 'serve') {
    if (!hands || hands.kind !== 'plate') { say(state, 'Bring a finished plate to the window.', 1.5); return; }
    const out = servePlate(state, hands);
    if (out.result === 'served') {
      state.carrying = null;
      burst(state, s.x + s.w / 2, s.y + s.h / 2, '#ffd23f', 16, 120);
    } else {
      say(state, 'No order wants this plate — check the tickets!', 2.5);
    }
    return;
  }
  if (s.kind === 'trash') {
    if (!hands) { say(state, 'Nothing to throw away.', 1.2); return; }
    state.carrying = null;
    say(state, 'Binned.', 1);
    return;
  }
}
