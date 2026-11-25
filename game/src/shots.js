// shots.js — staged scenes for the maker's screenshots, driven by ?shot=.
// The game itself never depends on these; they only set up a state that shows
// the kitchen at its best: orders on the board, food on the counters, a dish
// mid-assembly and a plate ready to serve.

import { buildKitchen } from './kitchen.js';
import { RECIPES } from './config.js';
import { makePlate } from './config.js';

/** Apply a staged scene to a fresh state. Returns true when a shot was applied. */
export function applyShot(state, shot) {
  if (!shot) return false;
  state.stations = buildKitchen();
  if (shot === 'start') {
    state.screen = 'title';
    state.time = 0.4;
    return true;
  }
  if (shot === 'play') {
    stageMidGame(state);
    return true;
  }
  if (shot === 'rush') {
    stageRush(state);
    return true;
  }
  if (shot === 'end') {
    stageEnd(state);
    return true;
  }
  return false;
}

/** Mid-game: three tickets, a salad half-built on the plating counter, food cooking. */
export function stageMidGame(state) {
  state.screen = 'playing';
  state.time = 62;
  state.shiftLeft = 118;
  state.coins = 148;
  state.served = 5;
  state.combo = 2;
  const salad = RECIPES[0];
  const burger = RECIPES[1];
  const pasta = RECIPES[2];
  state.orders = [
    { id: 1, recipe: salad, left: 48, total: 80, flash: 0 },
    { id: 2, recipe: burger, left: 62, total: 85, flash: 0 },
    { id: 3, recipe: pasta, left: 34, total: 70, flash: 0 },
  ];
  state.nextOrderId = 4;
  // A salad mid-assembly on the plating counter: lettuce already on the plate.
  const plateStation = state.stations.find((s) => s.id === 'plate');
  const plate = makePlate();
  plate.contents.push('lettuce');
  plateStation.plate = plate;
  // A tomato half-chopped on the first board, a patty grilling, pasta boiling.
  const chop = state.stations.find((s) => s.id === 'chop1');
  chop.item = 'tomato';
  chop.progress = 1.4;
  const grill = state.stations.find((s) => s.id === 'grill');
  grill.item = 'patty';
  grill.progress = 3.1;
  const pot = state.stations.find((s) => s.id === 'pot');
  pot.item = 'pasta';
  pot.progress = 2.4;
  // The chef stands by the plating counter, chopped tomato in hand.
  state.chef.x = 620;
  state.chef.y = 590;
  state.carrying = { kind: 'ready', id: 'tomato' };
  state.message = 'Tomato Pasta needs pasta + tomato — serve it fast!';
  state.messageUntil = 999;
}

/** The rush: four tickets, one nearly out of time, a full burger plate ready to serve. */
export function stageRush(state) {
  state.screen = 'playing';
  state.time = 150;
  state.shiftLeft = 30;
  state.rush = true;
  state.coins = 386;
  state.served = 12;
  state.combo = 4;
  const salad = RECIPES[0];
  const burger = RECIPES[1];
  const pasta = RECIPES[2];
  const melt = RECIPES[3];
  state.orders = [
    { id: 1, recipe: melt, left: 8, total: 75, flash: 1 },
    { id: 2, recipe: burger, left: 41, total: 80, flash: 0 },
    { id: 3, recipe: pasta, left: 55, total: 70, flash: 0 },
    { id: 4, recipe: salad, left: 66, total: 85, flash: 0 },
  ];
  state.nextOrderId = 5;
  // A finished cheeseburger plate on the counter, ready to run to the window.
  const plateStation = state.stations.find((s) => s.id === 'plate');
  const plate = makePlate();
  plate.contents.push('bun', 'patty', 'cheese');
  plateStation.plate = plate;
  // Both boards busy, grill smoking with a second patty.
  const chop1 = state.stations.find((s) => s.id === 'chop1');
  chop1.item = 'onion';
  chop1.progress = 1.8;
  const chop2 = state.stations.find((s) => s.id === 'chop2');
  chop2.item = 'lettuce';
  chop2.progress = 0.6;
  const grill = state.stations.find((s) => s.id === 'grill');
  grill.item = 'patty';
  grill.progress = 4.2;
  grill.done = true;
  state.chef.x = 1080;
  state.chef.y = 640;
  state.carrying = { kind: 'ready', id: 'cheese' };
  state.message = 'RUSH! 30 seconds left — the onion melt ticket is about to walk out!';
  state.messageUntil = 999;
}

/** The end screen: a finished shift with coins, stars and the verdict. */
export function stageEnd(state) {
  state.screen = 'over';
  state.time = 182;
  state.shiftLeft = 0;
  state.coins = 542;
  state.served = 15;
  state.missed = 2;
  state.bestCombo = 5;
  state.combo = 0;
  state.orders = [];
}
