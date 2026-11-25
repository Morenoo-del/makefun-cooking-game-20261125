// kitchen.js — the kitchen itself: where every counter, crate and station sits,
// and the collision + nearest-station helpers the chef walks against.
// One file, one job: the room. No orders, no scoring here.

import { BOARD_H } from './config.js';

/** Build the station list for a fresh shift. Each station is a rect plus its own state. */
export function buildKitchen() {
  const top = BOARD_H + 10; // y of the top counter row
  const stations = [];
  const crate = (id, x, label, color) => ({
    id, kind: 'crate', ingredient: id, label, color, x, y: top, w: 104, h: 76,
  });
  // Ingredient crates along the top wall, in the order a cook reaches for them.
  stations.push(crate('tomato', 24, 'Tomato', '#e5484d'));
  stations.push(crate('lettuce', 140, 'Lettuce', '#4caf50'));
  stations.push(crate('onion', 256, 'Onion', '#b388eb'));
  stations.push(crate('patty', 372, 'Patty', '#8d5a2b'));
  stations.push(crate('pasta', 488, 'Pasta', '#f2c14e'));
  stations.push(crate('bun', 604, 'Bun', '#e8b06a'));
  stations.push(crate('cheese', 720, 'Cheese', '#ffd23f'));
  // Workstations: two chopping boards and the grill finish the top row.
  stations.push({ id: 'chop1', kind: 'chop', label: 'Chop', x: 848, y: top, w: 104, h: 76, item: null, progress: 0, done: false });
  stations.push({ id: 'chop2', kind: 'chop', label: 'Chop', x: 964, y: top, w: 104, h: 76, item: null, progress: 0, done: false });
  stations.push({ id: 'grill', kind: 'grill', label: 'Grill', x: 1080, y: top, w: 176, h: 76, item: null, progress: 0, done: false, burnt: false });

  // The middle island: pot, plating counter, plate stack and bin.
  const mid = 430;
  stations.push({ id: 'pot', kind: 'pot', label: 'Pot', x: 60, y: mid, w: 120, h: 92, item: null, progress: 0, done: false });
  stations.push({ id: 'plate', kind: 'plate', label: 'Plating', x: 470, y: mid, w: 300, h: 92, plate: null });
  stations.push({ id: 'plates', kind: 'plates', label: 'Plates', x: 830, y: mid, w: 120, h: 92 });
  stations.push({ id: 'trash', kind: 'trash', label: 'Bin', x: 1010, y: mid, w: 110, h: 92 });
  // The service window on the right wall: finished plates go out here.
  stations.push({ id: 'serve', kind: 'serve', label: 'SERVE', x: 1180, y: 380, w: 88, h: 220 });
  return stations;
}

/** The chef may walk anywhere on the floor except inside a station rect (with a small margin). */
export function collidesWithStation(stations, x, y, r) {
  for (const s of stations) {
    const m = 4; // small margin so the chef can hug a counter
    if (x + r > s.x + m && x - r < s.x + s.w - m && y + r > s.y + m && y - r < s.y + s.h - m) {
      return s;
    }
  }
  return null;
}

/** Distance from a point to the nearest edge of a station rect (0 when inside). */
export function distanceToStation(s, x, y) {
  const dx = Math.max(s.x - x, 0, x - (s.x + s.w));
  const dy = Math.max(s.y - y, 0, y - (s.y + s.h));
  return Math.hypot(dx, dy);
}

/** The nearest station within reach of the chef (reach is generous: cooking is fast). */
export function nearestStation(stations, x, y, reach = 78) {
  let best = null;
  let bestD = Infinity;
  for (const s of stations) {
    const d = distanceToStation(s, x, y);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return bestD <= reach ? best : null;
}

/** The station under a mouse click, if the click lands on one. */
export function stationAtPoint(stations, x, y) {
  return stations.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) ?? null;
}

/** A station's processing duration in seconds, by kind. */
export function processSeconds(kind) {
  if (kind === 'chop') return 2.2;
  if (kind === 'grill') return 4.5;
  if (kind === 'pot') return 3.5;
  return 0;
}
